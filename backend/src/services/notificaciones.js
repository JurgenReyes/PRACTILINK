const { Notificacion, Usuario } = require("../models");
const { enviarCorreo } = require("./aws/ses");

/**
 * Crea una notificación in-app y, salvo que se indique lo contrario, envía también
 * el correo correspondiente. Cubre RN-01 (eventos que deben notificarse) y RN-02
 * (el usuario podría desactivar el correo salvo notificaciones críticas; el flag
 * de preferencias por usuario queda documentado como extensión futura del perfil).
 */
async function notificar({ id_usuario, tipo, mensaje, tambienCorreo = true, asuntoCorreo }) {
  await Notificacion.create({ id_usuario, tipo, mensaje });

  if (tambienCorreo) {
    const usuario = await Usuario.findByPk(id_usuario);
    if (usuario) {
      await enviarCorreo({
        para: usuario.correo,
        asunto: asuntoCorreo || "Nueva notificación en PractiLink",
        texto: mensaje,
      });
    }
  }
}

module.exports = { notificar };
