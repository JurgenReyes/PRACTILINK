const { Notificacion, Usuario } = require("../models");
const { enviarCorreo } = require("./aws/ses");
const { renderizarPlantilla } = require("./plantillasCorreo");

/**
 * Crea una notificación in-app y, salvo que se indique lo contrario, envía también
 * el correo correspondiente. Cubre RN-01 (eventos que deben notificarse) y RN-02
 * (el usuario podría desactivar el correo salvo notificaciones críticas; el flag
 * de preferencias por usuario queda documentado como extensión futura del perfil).
 *
 * Si se pasa `plantilla: { clave, variables }`, el asunto/cuerpo del correo salen
 * de la plantilla editable en Configuración (con fallback automático si el admin
 * nunca la personalizó) en vez de usar `asuntoCorreo`/`mensaje` directo.
 */
async function notificar({ id_usuario, tipo, mensaje, tambienCorreo = true, asuntoCorreo, plantilla }) {
  await Notificacion.create({ id_usuario, tipo, mensaje });

  if (tambienCorreo) {
    const usuario = await Usuario.findByPk(id_usuario);
    if (usuario) {
      const { asunto, texto } = plantilla
        ? await renderizarPlantilla(plantilla.clave, plantilla.variables)
        : { asunto: asuntoCorreo || "Nueva notificación en PractiLink", texto: mensaje };
      await enviarCorreo({ para: usuario.correo, asunto, texto });
    }
  }
}

module.exports = { notificar };
