const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const {
  Usuario, Estudiante, Empresa, Administrador, Vacante, Postulacion, Examen,
  ResultadoExamen, BitacoraAuditoria, ConfiguracionIA, CatalogoUniversidad, CatalogoCarrera, Aviso,
  PlantillaCorreo,
} = require("../models");
const { enviarCorreo } = require("../services/aws/ses");
const { registrarAuditoria } = require("../services/auditoria");
const { generarPDF, dibujarTabla } = require("../services/pdf");
const { enviarCSV } = require("../services/csv");
const { renderizarPlantilla, PLANTILLAS_POR_DEFECTO } = require("../services/plantillasCorreo");

const AZUL_PDF = "#2563EB";

// ---------- RF-A01/RF-A02: usuarios ----------
async function listarUsuarios(req, res) {
  const { estatus, tipo, desde, q } = req.query;
  const where = {};
  if (estatus) where.estatus = estatus;
  if (tipo) where.rol = tipo;
  if (desde) where.fecha_creacion = { [Op.gte]: new Date(desde) };

  const usuarios = await Usuario.findAll({
    where,
    include: [Estudiante, Empresa],
    order: [["fecha_creacion", "DESC"]],
    attributes: { exclude: ["password_hash"] },
  });

  // El nombre vive en Estudiante/Empresa, no en Usuario — si se busca por
  // nombre, se filtra aquí después de traer los datos (Sequelize no puede
  // buscar cómodamente en dos tablas asociadas con un solo OR de forma limpia).
  const filtrados = q
    ? usuarios.filter((u) =>
        u.correo.toLowerCase().includes(q.toLowerCase()) ||
        u.Estudiante?.nombre_completo?.toLowerCase().includes(q.toLowerCase()) ||
        u.Empresa?.nombre_empresa?.toLowerCase().includes(q.toLowerCase())
      )
    : usuarios;

  return res.json(filtrados);
}

async function detalleUsuario(req, res) {
  const usuario = await Usuario.findByPk(req.params.id, {
    include: [Estudiante, Empresa],
    attributes: { exclude: ["password_hash"] },
  });
  if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
  return res.json(usuario);
}

// ---------- RF-A03: suspender/reactivar ----------
async function cambiarEstatusUsuario(req, res) {
  const { estatus, motivo } = req.body;
  if (!["activo", "suspendido"].includes(estatus)) return res.status(400).json({ error: "Estatus inválido" });

  const usuario = await Usuario.findByPk(req.params.id);
  if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

  usuario.estatus = estatus;
  await usuario.save();
  await registrarAuditoria(req, `Cambio de estatus de usuario #${usuario.id_usuario} a ${estatus}`, motivo);
  return res.json(usuario);
}

// ---------- RF-A04: eliminar definitivamente ----------
async function eliminarUsuario(req, res) {
  const usuario = await Usuario.findByPk(req.params.id);
  if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
  await usuario.destroy(); // cascada elimina Estudiante/Empresa asociados
  await registrarAuditoria(req, `Eliminación definitiva de usuario #${req.params.id}`, req.body.motivo);
  return res.json({ mensaje: "Usuario eliminado" });
}

// ---------- RF-A05: restablecer contraseña ----------
async function restablecerPasswordUsuario(req, res) {
  const usuario = await Usuario.findByPk(req.params.id);
  if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

  const passwordTemporal = crypto.randomBytes(6).toString("hex") + "A1!";
  usuario.password_hash = await bcrypt.hash(passwordTemporal, 10);
  await usuario.save();

  await enviarCorreo({
    para: usuario.correo,
    asunto: "Tu contraseña ha sido restablecida - PractiLink",
    texto: `Tu nueva contraseña temporal es: ${passwordTemporal}\nCámbiala en cuanto inicies sesión.`,
  });
  await registrarAuditoria(req, `Restablecimiento de contraseña de usuario #${usuario.id_usuario}`);
  return res.json({ mensaje: "Contraseña restablecida y enviada por correo" });
}

// ---------- RF-A06/RF-A07: validación de empresas ----------
async function empresasPendientes(req, res) {
  const [pendientes, totalAprobadas, totalRechazadas] = await Promise.all([
    Empresa.findAll({
      where: { estatus_validacion: "pendiente" },
      include: [{ model: Usuario, attributes: ["correo"] }],
    }),
    Empresa.count({ where: { estatus_validacion: "aprobada" } }),
    Empresa.count({ where: { estatus_validacion: "rechazada" } }),
  ]);
  return res.json({
    pendientes,
    conteos: { pendientes: pendientes.length, aprobadas: totalAprobadas, rechazadas: totalRechazadas },
  });
}

async function validarEmpresa(req, res) {
  const { aprobar, motivo } = req.body;
  const empresa = await Empresa.findByPk(req.params.id, { include: [Usuario] });
  if (!empresa) return res.status(404).json({ error: "Empresa no encontrada" });
  if (!aprobar && !motivo) return res.status(400).json({ error: "El motivo de rechazo es obligatorio" });

  empresa.estatus_validacion = aprobar ? "aprobada" : "rechazada";
  empresa.motivo_rechazo = aprobar ? null : motivo;
  await empresa.save();

  const { asunto, texto } = await renderizarPlantilla("validacion_empresa", {
    asunto_validacion: aprobar ? "Tu cuenta empresarial fue aprobada" : "Tu cuenta empresarial fue rechazada",
    mensaje: aprobar ? "Ya puedes publicar vacantes en PractiLink." : `Motivo: ${motivo}`,
  });
  await enviarCorreo({ para: empresa.Usuario.correo, asunto, texto });
  await registrarAuditoria(req, `Validación de empresa #${empresa.id_empresa}: ${aprobar ? "aprobada" : "rechazada"}`, motivo);
  return res.json(empresa);
}

// ---------- RF-A08: bitácora ----------
async function verBitacora(req, res) {
  const registros = await BitacoraAuditoria.findAll({
    include: [{ model: Administrador, attributes: ["nombre_completo"] }],
    order: [["fecha_creacion", "DESC"]],
    limit: 200,
  });
  return res.json(registros);
}

// ---------- RF-A09/RF-A10/RF-A11: moderación de vacantes ----------
async function todasLasVacantes(req, res) {
  const { estatus, reportadas, q } = req.query;
  const where = {};
  if (estatus) where.estatus = estatus;
  if (reportadas === "1") where.reportada = true;
  if (q) where[Op.or] = [{ titulo: { [Op.like]: `%${q}%` } }];
  const vacantes = await Vacante.findAll({ where, include: [Empresa], order: [["fecha_creacion", "DESC"]] });
  return res.json(vacantes);
}

async function darDeBajaVacante(req, res) {
  const { motivo } = req.body;
  const vacante = await Vacante.findByPk(req.params.id, { include: [{ model: Empresa, include: [Usuario] }] });
  if (!vacante) return res.status(404).json({ error: "Vacante no encontrada" });

  vacante.estatus = "cerrada";
  vacante.reportada = false;
  vacante.motivo_reporte = null;
  await vacante.save();

  await enviarCorreo({
    para: vacante.Empresa.Usuario.correo,
    asunto: "Tu vacante fue dada de baja - PractiLink",
    texto: `La vacante "${vacante.titulo}" fue dada de baja. Motivo: ${motivo}`,
  });
  await registrarAuditoria(req, `Vacante #${vacante.id_vacante} dada de baja`, motivo);
  return res.json(vacante);
}

// El reporte de un estudiante puede resultar infundado: el admin lo puede
// descartar sin dar de baja la vacante.
async function descartarReporteVacante(req, res) {
  const vacante = await Vacante.findByPk(req.params.id);
  if (!vacante) return res.status(404).json({ error: "Vacante no encontrada" });
  vacante.reportada = false;
  vacante.motivo_reporte = null;
  await vacante.save();
  await registrarAuditoria(req, `Reporte descartado para la vacante #${vacante.id_vacante}`);
  return res.json(vacante);
}

// ---------- RF-A12: parámetros de IA ----------
async function verConfiguracionIA(req, res) {
  const config = await ConfiguracionIA.findAll();
  return res.json(config);
}

async function actualizarConfiguracionIA(req, res) {
  const { clave, valor } = req.body;
  const config = await ConfiguracionIA.findByPk(clave);
  if (!config) return res.status(404).json({ error: "Parámetro no encontrado" });
  config.valor = String(valor);
  await config.save();
  await registrarAuditoria(req, `Actualización de parámetro de IA: ${clave} = ${valor}`);
  return res.json(config);
}

// ---------- RF-A13: historial de exámenes ----------
async function historialExamenes(req, res) {
  const examenes = await Examen.findAll({
    include: [ResultadoExamen, { model: Postulacion, include: [Estudiante, Vacante] }],
    order: [["fecha_creacion", "DESC"]],
    limit: 100,
  });
  return res.json(examenes);
}

// ---------- RF-A15/RF-A17: dashboard global y métricas ----------
async function calcularStatsGlobales() {
  const [usuariosActivos, empresasValidadas, vacantesActivas, postulacionesTotales, aceptados] = await Promise.all([
    Usuario.count({ where: { estatus: "activo" } }),
    Empresa.count({ where: { estatus_validacion: "aprobada" } }),
    Vacante.count({ where: { estatus: "publicada" } }),
    Postulacion.count(),
    Postulacion.count({ where: { estatus: "aceptado" } }),
  ]);

  const tasaColocacion = postulacionesTotales > 0 ? Math.round((aceptados / postulacionesTotales) * 100) : 0;

  const postulacionesPorEstatus = await Postulacion.findAll({
    attributes: ["estatus", [Postulacion.sequelize.fn("COUNT", "*"), "total"]],
    group: ["estatus"],
  });

  // Usuarios nuevos por semana (últimas 8 semanas) — para la gráfica de línea.
  const usuariosRecientes = await Usuario.findAll({
    attributes: ["fecha_creacion"],
    where: { fecha_creacion: { [Op.gte]: new Date(Date.now() - 8 * 7 * 24 * 60 * 60 * 1000) } },
  });
  const semanas = {};
  for (const u of usuariosRecientes) {
    const d = new Date(u.fecha_creacion);
    const inicioSemana = new Date(d);
    inicioSemana.setDate(d.getDate() - d.getDay());
    const clave = inicioSemana.toISOString().slice(0, 10);
    semanas[clave] = (semanas[clave] || 0) + 1;
  }
  const usuariosNuevosPorSemana = Object.entries(semanas)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([semana, total]) => ({ semana, total }));

  // Vacantes con mayor demanda (top 5 por número de postulaciones).
  const vacantesConMayorDemanda = await Postulacion.findAll({
    attributes: ["id_vacante", [Postulacion.sequelize.fn("COUNT", "*"), "total"]],
    group: ["id_vacante"],
    order: [[Postulacion.sequelize.fn("COUNT", "*"), "DESC"]],
    limit: 5,
    include: [{ model: Vacante, attributes: ["titulo"] }],
  });

  // Tiempo promedio de respuesta: días entre la postulación y el último
  // cambio de estatus, para postulaciones que ya salieron de "en revisión".
  const respondidas = await Postulacion.findAll({
    where: { estatus: { [Op.ne]: "en_revision" } },
    attributes: ["fecha_postulacion", "fecha_modificacion"],
  });
  const tiempoPromedioRespuestaDias = respondidas.length
    ? Math.round(
        (respondidas.reduce((sum, p) => sum + (new Date(p.fecha_modificacion) - new Date(p.fecha_postulacion)), 0) /
          respondidas.length /
          (1000 * 60 * 60 * 24)) *
          10
      ) / 10
    : 0;

  return {
    usuarios_activos: usuariosActivos,
    empresas_validadas: empresasValidadas,
    vacantes_activas: vacantesActivas,
    postulaciones_totales: postulacionesTotales,
    tasa_colocacion: tasaColocacion,
    postulaciones_por_estatus: Object.fromEntries(
      postulacionesPorEstatus.map((p) => [p.estatus, Number(p.get("total"))])
    ),
    usuarios_nuevos_por_semana: usuariosNuevosPorSemana,
    vacantes_mayor_demanda: vacantesConMayorDemanda.map((v) => ({
      titulo: v.Vacante?.titulo || "(vacante eliminada)",
      postulantes: Number(v.get("total")),
    })),
    tiempo_promedio_respuesta_dias: tiempoPromedioRespuestaDias,
  };
}

async function dashboardGlobal(req, res) {
  return res.json(await calcularStatsGlobales());
}

// ---------- Plantillas de correo automático ----------
async function listarPlantillasCorreo(req, res) {
  const guardadas = await PlantillaCorreo.findAll();
  const porClave = Object.fromEntries(guardadas.map((p) => [p.clave, p]));

  // Se listan siempre las 4 claves conocidas, tomando lo guardado si existe
  // o el valor por defecto si el admin nunca la ha tocado — así la pantalla
  // de Configuración siempre muestra algo editable, nunca queda vacía.
  const resultado = Object.entries(PLANTILLAS_POR_DEFECTO).map(([clave, porDefecto]) => {
    const guardada = porClave[clave];
    return {
      clave,
      nombre: porDefecto.nombre,
      asunto: guardada?.asunto ?? porDefecto.asunto,
      cuerpo: guardada?.cuerpo ?? porDefecto.cuerpo,
      personalizada: Boolean(guardada),
    };
  });
  return res.json(resultado);
}

async function actualizarPlantillaCorreo(req, res) {
  const { clave } = req.params;
  const { asunto, cuerpo } = req.body;
  if (!PLANTILLAS_POR_DEFECTO[clave]) return res.status(404).json({ error: "Plantilla desconocida" });
  if (!asunto?.trim() || !cuerpo?.trim()) return res.status(400).json({ error: "Asunto y cuerpo son obligatorios" });

  const [plantilla] = await PlantillaCorreo.upsert({
    clave, nombre: PLANTILLAS_POR_DEFECTO[clave].nombre, asunto, cuerpo,
  });
  await registrarAuditoria(req, `Plantilla de correo actualizada: ${clave}`);
  return res.json(plantilla);
}
async function exportarUsuariosCSV(req, res) {
  const usuarios = await Usuario.findAll({ include: [Estudiante, Empresa], attributes: { exclude: ["password_hash"] } });
  const filas = [["ID", "Correo", "Rol", "Estatus", "Verificado", "Fecha registro"]];
  for (const u of usuarios) {
    filas.push([u.id_usuario, u.correo, u.rol, u.estatus, u.correo_verificado ? "sí" : "no", u.fecha_creacion.toISOString()]);
  }
  return enviarCSV(res, { filas, nombreArchivo: "usuarios_practilink.csv" });
}

async function exportarDashboardPDF(req, res) {
  const stats = await calcularStatsGlobales();
  generarPDF(res, {
    titulo: "Dashboard Global",
    nombreArchivo: "dashboard_practilink.pdf",
    dibujar(doc) {
      const tarjetas = [
        ["Usuarios activos", stats.usuarios_activos],
        ["Empresas validadas", stats.empresas_validadas],
        ["Vacantes activas", stats.vacantes_activas],
        ["Postulaciones totales", stats.postulaciones_totales],
        ["Tasa de colocación", `${stats.tasa_colocacion}%`],
      ];
      let x = 40;
      tarjetas.forEach(([label, valor]) => {
        doc.roundedRect(x, doc.y, 95, 55, 6).strokeColor("#E5E7EB").stroke();
        doc.font("Helvetica-Bold").fontSize(16).fillColor(AZUL_PDF).text(String(valor), x, doc.y + 10, { width: 95, align: "center" });
        doc.font("Helvetica").fontSize(7.5).fillColor("#6B7280").text(label, x, doc.y + 30 - 12, { width: 95, align: "center" });
        x += 103;
      });
      doc.moveDown(4);
      doc.y += 20;

      doc.font("Helvetica-Bold").fontSize(12).fillColor("#1F2937").text("Vacantes con mayor demanda");
      doc.moveDown(0.3);
      dibujarTabla(doc, {
        columnas: ["Vacante", "Postulantes"],
        filas: stats.vacantes_mayor_demanda.map((v) => [v.titulo, v.postulantes]),
      });

      doc.moveDown(1.5);
      doc.font("Helvetica-Bold").fontSize(12).fillColor("#1F2937").text("Tiempo promedio de respuesta de empresas");
      doc.font("Helvetica").fontSize(10).fillColor("#1F2937").text(`${stats.tiempo_promedio_respuesta_dias} días en promedio`);
    },
  });
}

async function exportarBitacoraCSV(req, res) {
  const registros = await BitacoraAuditoria.findAll({
    include: [Administrador],
    order: [["fecha_creacion", "DESC"]],
  });
  const filas = [["Fecha", "Administrador", "Acción", "Detalle"]];
  for (const r of registros) {
    filas.push([r.fecha_creacion.toISOString(), r.Administrador?.nombre_completo || "—", r.accion, r.detalle || ""]);
  }
  return enviarCSV(res, { filas, nombreArchivo: "bitacora_practilink.csv" });
}

async function exportarBitacoraPDF(req, res) {
  const registros = await BitacoraAuditoria.findAll({
    include: [Administrador],
    order: [["fecha_creacion", "DESC"]],
    limit: 200, // suficiente para un reporte legible; la bitácora completa se sigue viendo en pantalla
  });
  generarPDF(res, {
    titulo: "Bitácora de Auditoría",
    nombreArchivo: "bitacora_practilink.pdf",
    dibujar(doc) {
      dibujarTabla(doc, {
        columnas: ["Fecha", "Administrador", "Acción", "Detalle"],
        filas: registros.map((r) => [
          new Date(r.fecha_creacion).toLocaleString("es-MX"),
          r.Administrador?.nombre_completo || "—",
          r.accion,
          r.detalle || "—",
        ]),
      });
    },
  });
}

// ---------- RF-A18: catálogos ----------
async function listarCatalogo(req, res) {
  const Modelo = req.params.tipo === "universidades" ? CatalogoUniversidad : CatalogoCarrera;
  return res.json(await Modelo.findAll({ order: [["nombre", "ASC"]] }));
}

async function agregarCatalogo(req, res) {
  const Modelo = req.params.tipo === "universidades" ? CatalogoUniversidad : CatalogoCarrera;
  const item = await Modelo.create({ nombre: req.body.nombre });
  return res.status(201).json(item);
}

async function eliminarCatalogo(req, res) {
  const Modelo = req.params.tipo === "universidades" ? CatalogoUniversidad : CatalogoCarrera;
  await Modelo.destroy({ where: { [req.params.tipo === "universidades" ? "id_universidad" : "id_carrera"]: req.params.id } });
  return res.json({ mensaje: "Eliminado" });
}

// ---------- RF-A20: gestión de subadministradores ----------
async function crearAdministrador(req, res) {
  // Solo un superadministrador puede dar de alta otras cuentas de admin
  // (incluyendo otros superadministradores) — evita que un admin de
  // soporte/moderador se autoasigne más permisos de los que tiene.
  const quienSolicita = await Administrador.findOne({ where: { id_usuario: req.usuario.id_usuario } });
  if (!quienSolicita || quienSolicita.nivel_permiso !== "superadministrador") {
    return res.status(403).json({ error: "Solo un superadministrador puede crear cuentas de administrador." });
  }

  const { correo, password, nombre_completo, nivel_permiso } = req.body;
  const password_hash = await bcrypt.hash(password, 10);
  const usuario = await Usuario.create({ correo, password_hash, rol: "administrador", correo_verificado: true });
  const admin = await Administrador.create({ id_usuario: usuario.id_usuario, nombre_completo, nivel_permiso });
  await registrarAuditoria(req, `Creación de administrador: ${correo} (${nivel_permiso})`);
  return res.status(201).json(admin);
}

async function listarAdministradores(req, res) {
  const admins = await Administrador.findAll({ include: [{ model: Usuario, attributes: ["correo", "estatus"] }] });
  return res.json(admins);
}

// ---------- RF-A22: avisos generales ----------
async function crearAviso(req, res) {
  const aviso = await Aviso.create(req.body);
  await registrarAuditoria(req, `Aviso publicado: ${aviso.titulo}`);
  return res.status(201).json(aviso);
}

async function listarAvisos(req, res) {
  return res.json(await Aviso.findAll({ where: { activo: true }, order: [["fecha_creacion", "DESC"]] }));
}

module.exports = {
  listarUsuarios, detalleUsuario, cambiarEstatusUsuario, eliminarUsuario, restablecerPasswordUsuario,
  empresasPendientes, validarEmpresa, verBitacora,
  todasLasVacantes, darDeBajaVacante,
  verConfiguracionIA, actualizarConfiguracionIA, historialExamenes,
  dashboardGlobal, exportarUsuariosCSV, exportarDashboardPDF, exportarBitacoraCSV, exportarBitacoraPDF,
  listarCatalogo, agregarCatalogo, eliminarCatalogo,
  crearAdministrador, listarAdministradores,
  crearAviso, listarAvisos,
  descartarReporteVacante,
  listarPlantillasCorreo, actualizarPlantillaCorreo,
};
