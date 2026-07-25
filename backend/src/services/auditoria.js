const { BitacoraAuditoria, Administrador } = require("../models");

/** RF-A21: registra en bitácora toda acción crítica de un administrador. */
async function registrarAuditoria(req, accion, detalle) {
  const admin = await Administrador.findOne({ where: { id_usuario: req.usuario.id_usuario } });
  if (!admin) return;
  await BitacoraAuditoria.create({ id_admin: admin.id_admin, accion, detalle: detalle || null });
}

module.exports = { registrarAuditoria };
