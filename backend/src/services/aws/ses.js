const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const nodemailer = require("nodemailer");

const ses = new SESClient({ region: process.env.AWS_REGION });

// Gmail vía SMTP (nodemailer): opción real de envío para desarrollo/pruebas,
// sin necesitar credenciales de AWS. Requiere una "contraseña de aplicación"
// de Gmail (no la contraseña normal de la cuenta) en GMAIL_APP_PASSWORD.
// Ver instrucciones en .env.example.
let transporterGmail = null;
if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
  transporterGmail = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  });
}

/**
 * Envío de correo transaccional. Cubre RN-01 (verificación, cambio de
 * estatus, recuperación, código de 2FA, etc.). Prioridad de envío:
 *   1. Gmail (si GMAIL_USER/GMAIL_APP_PASSWORD están configurados) — envío real.
 *   2. Amazon SES (si hay credenciales de AWS configuradas) — envío real.
 *   3. Modo simulado (NODE_ENV=development sin ninguna de las anteriores):
 *      solo se imprime en consola, para poder probar el flujo sin ninguna cuenta externa.
 */
async function enviarCorreo({ para, asunto, texto }) {
  if (transporterGmail) {
    await transporterGmail.sendMail({ from: process.env.GMAIL_USER, to: para, subject: asunto, text: texto });
    return { enviado: true, via: "gmail" };
  }

  if (process.env.NODE_ENV === "development" && !process.env.AWS_ACCESS_KEY_ID) {
    console.log(`[correo-simulado] Para: ${para} | Asunto: ${asunto}\n${texto}`);
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
