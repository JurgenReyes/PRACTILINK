const { PlantillaCorreo } = require("../models");

// Si el admin nunca editó una plantilla, no debe romper el envío de
// correos — se usa este texto por defecto (el mismo que ya existía antes
// de que las plantillas fueran editables).
const PLANTILLAS_POR_DEFECTO = {
  verificacion_cuenta: {
    nombre: "Verificación de cuenta",
    asunto: "Verifica tu cuenta en PractiLink",
    cuerpo: "Confirma tu cuenta con este enlace: {{enlace}}",
  },
  cambio_estatus_postulacion: {
    nombre: "Cambio de estatus de postulación",
    asunto: "Actualización de tu postulación en PractiLink",
    cuerpo: "{{mensaje}}",
  },
  recuperacion_password: {
    nombre: "Recuperación de contraseña",
    asunto: "Recupera tu contraseña - PractiLink",
    cuerpo: "Restablece tu contraseña aquí: {{enlace}}",
  },
  validacion_empresa: {
    nombre: "Validación / rechazo de empresa",
    asunto: "{{asunto_validacion}}",
    cuerpo: "{{mensaje}}",
  },
};

function sustituir(texto, variables) {
  return texto.replace(/\{\{(\w+)\}\}/g, (_, clave) => (variables[clave] ?? ""));
}

// Devuelve { asunto, texto } ya con las variables sustituidas, tomando la
// plantilla editada por el admin si existe, o el valor por defecto si no.
async function renderizarPlantilla(clave, variables = {}) {
  const porDefecto = PLANTILLAS_POR_DEFECTO[clave];
  const guardada = await PlantillaCorreo.findByPk(clave).catch(() => null);
  const base = guardada || porDefecto;
  return {
    asunto: sustituir(base.asunto, variables),
    texto: sustituir(base.cuerpo, variables),
  };
}

module.exports = { renderizarPlantilla, PLANTILLAS_POR_DEFECTO };
