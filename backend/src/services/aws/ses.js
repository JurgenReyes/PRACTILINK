const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const ses = new SESClient({ region: process.env.AWS_REGION });

/**
 * Envío de correo transaccional vía Amazon SES.
 * Cubre RN-01 (verificación, cambio de estatus, recuperación, etc.)
 * En NODE_ENV=development, si no hay credenciales AWS configuradas, solo se loguea el correo
 * para poder probar el flujo local sin cuenta de AWS.
 */
async function enviarCorreo({ para, asunto, texto }) {
  if (process.env.NODE_ENV === "development" && !process.env.AWS_ACCESS_KEY_ID) {
    console.log(`[SES-simulado] Para: ${para} | Asunto: ${asunto}\n${texto}`);
    return { simulado: true };
  }

  const comando = new SendEmailCommand({
    Source: process.env.SES_FROM_EMAIL,
    Destination: { ToAddresses: [para] },
    Message: {
      Subject: { Data: asunto },
      Body: { Text: { Data: texto } },
    },
  });
  return ses.send(comando);
}

module.exports = { enviarCorreo };
