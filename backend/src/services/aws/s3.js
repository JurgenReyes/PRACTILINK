const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3 = new S3Client({ region: process.env.AWS_REGION });
const BUCKET = process.env.AWS_S3_BUCKET;

/**
 * Sube un archivo (CV en PDF o foto de perfil) a S3.
 * RF-E16/RF-E17: CV en PDF, máx 10MB, con historial de versiones (el "key" incluye la versión).
 */
async function subirArchivo({ buffer, key, contentType }) {
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ServerSideEncryption: "AES256",
  }));
  return `s3://${BUCKET}/${key}`;
}

/** Genera una URL firmada temporal para que el frontend descargue el archivo (RF-EM17). */
async function obtenerUrlFirmada(key, expiraSegundos = 300) {
  const comando = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(s3, comando, { expiresIn: expiraSegundos });
}

module.exports = { subirArchivo, obtenerUrlFirmada };
