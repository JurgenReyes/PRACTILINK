const { Op } = require("sequelize");
const { Vacante, Postulacion, Estudiante, Empresa, Usuario, Examen, ResultadoExamen } = require("../models");

async function obtenerEmpresa(req) {
  return Empresa.findOne({ where: { id_usuario: req.usuario.id_usuario } });
}

// Todas las vacantes de la empresa, sin importar estatus (a diferencia del listado público)
async function misVacantes(req, res) {
  const empresa = await obtenerEmpresa(req);
  const vacantes = await Vacante.findAll({
    where: { id_empresa: empresa.id_empresa },
    order: [["fecha_creacion", "DESC"]],
  });
  return res.json(vacantes);
}

// RF-EM14/RF-EM15: panel de candidatos por vacante, con filtros
async function candidatosPorVacante(req, res) {
  const empresa = await obtenerEmpresa(req);
  const vacante = await Vacante.findOne({ where: { id_vacante: req.params.id_vacante, id_empresa: empresa.id_empresa } });
  if (!vacante) return res.status(404).json({ error: "Vacante no encontrada" });

  const { estatus, carrera, universidad, puntaje_min } = req.query;
  const where = { id_vacante: vacante.id_vacante };
  if (estatus) where.estatus = estatus;
  if (puntaje_min) where.matching_score = { [Op.gte]: Number(puntaje_min) };

  const whereEstudiante = {};
  if (carrera) whereEstudiante.carrera = { [Op.like]: `%${carrera}%` };
  if (universidad) whereEstudiante.universidad = { [Op.like]: `%${universidad}%` };

  const candidatos = await Postulacion.findAll({
    where,
    include: [
      { model: Estudiante, where: whereEstudiante, include: [Usuario] },
      { model: Examen, include: [ResultadoExamen] },
    ],
    order: [["matching_score", "DESC"]],
  });
  return res.json(candidatos);
}

// RF-EM19: notas internas, no visibles para el estudiante
async function actualizarNotas(req, res) {
  const empresa = await obtenerEmpresa(req);
  const postulacion = await Postulacion.findByPk(req.params.id_postulacion, { include: [Vacante] });
  if (!postulacion || postulacion.Vacante.id_empresa !== empresa.id_empresa) {
    return res.status(404).json({ error: "Postulación no encontrada" });
  }
  postulacion.notas_internas = req.body.notas_internas || "";
  await postulacion.save();
  return res.json(postulacion);
}

// RF-EM20/RF-EM21: estadísticas para el dashboard con gráficas
async function dashboard(req, res) {
  const empresa = await obtenerEmpresa(req);
  const vacantes = await Vacante.findAll({ where: { id_empresa: empresa.id_empresa } });
  const idsVacantes = vacantes.map((v) => v.id_vacante);

  const totalActivas = vacantes.filter((v) => v.estatus === "publicada").length;
  const totalCerradas = vacantes.filter((v) => v.estatus === "cerrada").length;

  const postulaciones = idsVacantes.length
    ? await Postulacion.findAll({ where: { id_vacante: idsVacantes }, include: [Vacante] })
    : [];

  const porEstatus = {};
  for (const p of postulaciones) porEstatus[p.estatus] = (porEstatus[p.estatus] || 0) + 1;

  const porVacante = {};
  for (const p of postulaciones) {
    const titulo = p.Vacante.titulo;
    porVacante[titulo] = (porVacante[titulo] || 0) + 1;
  }

  return res.json({
    total_postulaciones: postulaciones.length,
    vacantes_activas: totalActivas,
    vacantes_cerradas: totalCerradas,
    postulaciones_por_estatus: porEstatus,
    postulaciones_por_vacante: porVacante,
  });
}

// RF-EM22: exportar candidatos en CSV (una empresa puede abrirlo en Excel directamente)
async function exportarCandidatosCSV(req, res) {
  const empresa = await obtenerEmpresa(req);
  const vacantes = await Vacante.findAll({ where: { id_empresa: empresa.id_empresa } });
  const idsVacantes = vacantes.map((v) => v.id_vacante);

  const postulaciones = idsVacantes.length
    ? await Postulacion.findAll({
        where: { id_vacante: idsVacantes },
        include: [Estudiante, Vacante],
      })
    : [];

  const filas = [["Vacante", "Estudiante", "Universidad", "Carrera", "Matching", "Estatus", "Fecha"]];
  for (const p of postulaciones) {
    filas.push([
      p.Vacante.titulo, p.Estudiante.nombre_completo, p.Estudiante.universidad || "",
      p.Estudiante.carrera || "", p.matching_score || "", p.estatus, p.fecha_postulacion.toISOString(),
    ]);
  }
  const csv = filas.map((fila) => fila.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=candidatos_practilink.csv");
  return res.send(csv);
}

// RF-EM18: programar entrevista, notifica automáticamente al estudiante
async function programarEntrevista(req, res) {
  const empresa = await obtenerEmpresa(req);
  const postulacion = await Postulacion.findByPk(req.params.id_postulacion, { include: [Vacante, Estudiante] });
  if (!postulacion || postulacion.Vacante.id_empresa !== empresa.id_empresa) {
    return res.status(404).json({ error: "Postulación no encontrada" });
  }
  const { fecha_entrevista, modalidad_entrevista, notas_entrevista, enlace_videollamada } = req.body;
  postulacion.fecha_entrevista = fecha_entrevista;
  postulacion.modalidad_entrevista = modalidad_entrevista;
  postulacion.notas_entrevista = notas_entrevista || null;
  postulacion.enlace_videollamada = modalidad_entrevista === "videollamada" ? (enlace_videollamada || null) : null;
  postulacion.entrevista_confirmada = false;
  postulacion.estatus = "entrevista_programada";
  await postulacion.save();

  const { notificar } = require("../services/notificaciones");
  await notificar({
    id_usuario: postulacion.Estudiante.id_usuario,
    tipo: "entrevista_programada",
    mensaje: `Tienes una entrevista programada para "${postulacion.Vacante.titulo}" el ${new Date(fecha_entrevista).toLocaleString()}.`,
    asuntoCorreo: "Entrevista programada en PractiLink",
  });

  return res.json(postulacion);
}

module.exports = { misVacantes, candidatosPorVacante, actualizarNotas, dashboard, exportarCandidatosCSV, programarEntrevista };
