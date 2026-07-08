/**
 * Orquestador del análisis de CV (RF-E18 a RF-E20, RIA-01).
 *
 * FLUJO REAL EN PRODUCCIÓN (AWS AI):
 *  1. Amazon Textract.AnalyzeDocument -> extrae el texto crudo del PDF (S3 -> Textract).
 *  2. Amazon Comprehend.DetectEntities / DetectKeyPhrases -> identifica habilidades,
 *     idiomas, instituciones y fechas dentro del texto extraído.
 *  3. Amazon Bedrock (InvokeModel, ej. Claude) -> con un prompt estructurado, convierte
 *     las entidades detectadas en el "perfil estructurado" (JSON) que pide RF-E20:
 *     experiencia laboral, habilidades técnicas/blandas, formación académica e idiomas.
 *
 * Este archivo implementa una versión SIMULADA (mock) para que el prototipo funcione
 * sin credenciales de AWS. La firma de la función es la misma que tendría la versión real,
 * de modo que solo hay que reemplazar el cuerpo por las llamadas a los SDKs de AWS.
 */

async function analizarCV({ textoExtraido }) {
  // --- Aquí, en producción, iría la llamada real a Textract + Comprehend + Bedrock ---
  // const textract = new TextractClient({ region: process.env.AWS_REGION });
  // const comprehend = new ComprehendClient({ region: process.env.AWS_REGION });
  // const bedrock = new BedrockRuntimeClient({ region: process.env.AWS_REGION });

  await new Promise((r) => setTimeout(r, 300)); // simula latencia del pipeline de IA

  return {
    experiencia_laboral: [
      { titulo: "Practicante de Desarrollo", institucion: "Empresa Demo S.A.", inicio: "2024-01", fin: "2024-06" },
    ],
    habilidades_tecnicas: ["JavaScript", "React", "MySQL", "Node.js"],
    habilidades_blandas: ["Trabajo en equipo", "Comunicación efectiva"],
    formacion_academica: [{ institucion: "Universidad Demo", titulo: "Ingeniería en Sistemas", estatus: "en curso" }],
    idiomas: [{ idioma: "Inglés", nivel: "intermedio" }],
    _origen: "simulado", // en producción: "textract+comprehend+bedrock"
  };
}

module.exports = { analizarCV };
