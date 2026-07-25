const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const {
  Usuario, Estudiante, Empresa, Administrador, Vacante, Postulacion, Examen,
  ResultadoExamen, BitacoraAuditoria, ConfiguracionIA, CatalogoUniversidad, CatalogoCarrera, Aviso,
} = require("../models");
const { enviarCorreo } = require("../services/aws/ses");
const { registrarAuditoria } = require("../services/auditoria");

// ---------- RF-A01/RF-A02: usuarios ----------
async function listarUsuarios(req, res) {
  const { estatus, tipo, desde } = req.query;
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
  return res.json(usuarios);
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
  const empresas = await Empresa.findAll({
    where: { estatus_validacion: "pendiente" },
    include: [{ model: Usuario, attributes: ["correo"] }],
  });
  return res.json(empresas);
}

async function validarEmpresa(req, res) {
  const { aprobar, motivo } = req.body;
  const empresa = await Empresa.findByPk(req.params.id, { include: [Usuario] });
  if (!empresa) return res.status(404).json({ error: "Empresa no encontrada" });
  if (!aprobar && !motivo) return res.status(400).json({ error: "El motivo de rechazo es obligatorio" });

  empresa.estatus_validacion = aprobar ? "aprobada" : "rechazada";
  empresa.motivo_rechazo = aprobar ? null : motivo;
  await empresa.save();

  await enviarCorreo({
    para: empresa.Usuario.correo,
    asunto: aprobar ? "Tu cuenta empresarial fue aprobada" : "Tu cuenta empresarial fue rechazada",
    texto: aprobar ? "Ya puedes publicar vacantes en PractiLink." : `Motivo: ${motivo}`,
  });
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
  const { estatus } = req.query;
  const where = estatus ? { estatus } : {};
  const vacantes = await Vacante.findAll({ where, include: [Empresa], order: [["fecha_creacion", "DESC"]] });
  return res.json(vacantes);
}

async function darDeBajaVacante(req, res) {
  const { motivo } = req.body;
  const vacante = await Vacante.findByPk(req.params.id, { include: [{ model: Empresa, include: [Usuario] }] });
  if (!vacante) return res.status(404).json({ error: "Vacante no encontrada" });

  vacante.estatus = "cerrada";
  await vacante.save();

  await enviarCorreo({
    para: vacante.Empresa.Usuario.correo,
    asunto: "Tu vacante fue dada de baja - PractiLink",
    texto: `La vacante "${vacante.titulo}" fue dada de baja. Motivo: ${motivo}`,
  });
  await registrarAuditoria(req, `Vacante #${vacante.id_vacante} dada de baja`, motivo);
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
async function dashboardGlobal(req, res) {
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

  return res.json({
    usuarios_activos: usuariosActivos,
    empresas_validadas: empresasValidadas,
    vacantes_activas: vacantesActivas,
    postulaciones_totales: postulacionesTotales,
    tasa_colocacion: tasaColocacion,
    postulaciones_por_estatus: Object.fromEntries(
      postulacionesPorEstatus.map((p) => [p.estatus, Number(p.get("total"))])
    ),
  });
}

// ---------- RF-A16: reportes exportables ----------
async function exportarUsuariosCSV(req, res) {
  const usuarios = await Usuario.findAll({ include: [Estudiante, Empresa], attributes: { exclude: ["password_hash"] } });
  const filas = [["ID", "Correo", "Rol", "Estatus", "Verificado", "Fecha registro"]];
  for (const u of usuarios) {
    filas.push([u.id_usuario, u.correo, u.rol, u.estatus, u.correo_verificado ? "sí" : "no", u.fecha_creacion.toISOString()]);
  }
  const csv = filas.map((f) => f.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=usuarios_practilink.csv");
  return res.send(csv);
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
  dashboardGlobal, exportarUsuariosCSV,
  listarCatalogo, agregarCatalogo, eliminarCatalogo,
  crearAdministrador, listarAdministradores,
  crearAviso, listarAvisos,
};
