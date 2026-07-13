const { Postulacion, Vacante, Estudiante, Empresa } = require("../models");
const { calcularMatching } = require("../services/ia/matching");

// RF-E29 a RF-E32
async function postularse(req, res) {
  const estudiante = await Estudiante.findOne({ where: { id_usuario: req.usuario.id_usuario } });
  if (!estudiante) return res.status(404).json({ error: "Perfil de estudiante no encontrado" });

  const { id_vacante } = req.body;
  const vacante = await Vacante.findByPk(id_vacante);
  if (!vacante || vacante.estatus !== "publicada") {
    return res.status(400).json({ error: "La vacante no está disponible" });
  }

  const yaExiste = await Postulacion.findOne({ where: { id_estudiante: estudiante.id_estudiante, id_vacante } });
  if (yaExiste) return res.status(409).json({ error: "Ya te has postulado a esta vacante" }); // RF-E30

  const matching_score = await calcularMatching(estudiante, vacante); // RIA-02

  const postulacion = await Postulacion.create({
    id_estudiante: estudiante.id_estudiante,
    id_vacante,
    matching_score,
  });
  return res.status(201).json(postulacion);
}

async function cancelar(req, res) {
  const estudiante = await Estudiante.findOne({ where: { id_usuario: req.usuario.id_usuario } });
  const postulacion = await Postulacion.findOne({
    where: { id_postulacion: req.params.id, id_estudiante: estudiante.id_estudiante },
  });
  if (!postulacion) return res.status(404).json({ error: "Postulación no encontrada" });
  if (postulacion.estatus !== "en_revision") {
    return res.status(400).json({ error: "Solo se puede cancelar mientras está en revisión" }); // RF-E31
  }
  await postulacion.destroy();
  return res.json({ mensaje: "Postulación cancelada" });
}

async function misPostulaciones(req, res) {
  const estudiante = await Estudiante.findOne({ where: { id_usuario: req.usuario.id_usuario } });
  const postulaciones = await Postulacion.findAll({
    where: { id_estudiante: estudiante.id_estudiante },
    include: [{ model: Vacante, include: [Empresa] }],
    order: [["fecha_postulacion", "DESC"]],
  });
  return res.json(postulaciones);
}

// RF-EM16: la empresa cambia el estatus (con notificación, ver services/notificaciones)
async function cambiarEstatus(req, res) {
  const { estatus } = req.body;
  const estadosValidos = ["en_revision", "evaluacion_pendiente", "entrevista_programada", "aceptado", "rechazado"];
  if (!estadosValidos.includes(estatus)) return res.status(400).json({ error: "Estatus inválido" });

  const postulacion = await Postulacion.findByPk(req.params.id);
  if (!postulacion) return res.status(404).json({ error: "Postulación no encontrada" });

  postulacion.estatus = estatus;
  await postulacion.save();
  // TODO: disparar notificación correo + in-app (RF-E34) vía services/aws/ses.js + tabla notificaciones
  return res.json(postulacion);
}

module.exports = { postularse, cancelar, misPostulaciones, cambiarEstatus };
