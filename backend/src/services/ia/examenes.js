/**
 * Generación y calificación de exámenes (RF-E36 a RF-E42, RIA-03, RIA-04).
 *
 * EN PRODUCCIÓN: Amazon Bedrock recibe el área de conocimiento detectada en el CV
 * (o los requisitos de la vacante) y genera reactivos de opción múltiple, casos
 * prácticos y preguntas abiertas con un prompt estructurado; las respuestas abiertas
 * se califican con una segunda llamada a Bedrock usando una rúbrica predefinida
 * (configurable por el administrador, ver RF-A12).
 *
 * Esta versión genera un examen de ejemplo determinístico según el área, para que
 * el flujo completo (generar -> responder -> calificar -> reporte) sea funcional
 * sin necesitar credenciales de AWS.
 */

const BANCOS_POR_AREA = {
  programacion: [
    { id: "p1", tipo: "opcion_multiple", pregunta: "¿Cuál estructura de datos usarías para implementar una cola (FIFO)?", opciones: ["Pila (stack)", "Cola (queue)", "Árbol binario", "Grafo"], respuesta_correcta: 1, puntos: 10 },
    { id: "p2", tipo: "opcion_multiple", pregunta: "¿Qué método HTTP se usa típicamente para crear un recurso nuevo?", opciones: ["GET", "POST", "DELETE", "OPTIONS"], respuesta_correcta: 1, puntos: 10 },
    { id: "p3", tipo: "caso_practico", pregunta: "Describe cómo optimizarías una consulta SQL que tarda demasiado en una tabla de 1 millón de filas.", puntos: 20 },
    { id: "p4", tipo: "abierta", pregunta: "Explica la diferencia entre programación síncrona y asíncrona con un ejemplo.", puntos: 20 },
  ],
  marketing: [
    { id: "m1", tipo: "opcion_multiple", pregunta: "¿Qué métrica mide mejor la fidelidad de un cliente?", opciones: ["CPC", "CTR", "Retención/Churn", "Impresiones"], respuesta_correcta: 2, puntos: 10 },
    { id: "m2", tipo: "caso_practico", pregunta: "Diseña brevemente una estrategia de lanzamiento para un producto digital con presupuesto limitado.", puntos: 25 },
    { id: "m3", tipo: "abierta", pregunta: "¿Cómo medirías el éxito de una campaña en redes sociales?", puntos: 20 },
  ],
  diseno: [
    { id: "d1", tipo: "opcion_multiple", pregunta: "¿Qué principio de diseño ayuda más a la jerarquía visual?", opciones: ["Simetría", "Contraste", "Repetición exacta", "Saturación máxima"], respuesta_correcta: 1, puntos: 10 },
    { id: "d2", tipo: "abierta", pregunta: "Describe tu proceso para diseñar una interfaz desde cero.", puntos: 25 },
  ],
  general: [
    { id: "g1", tipo: "opcion_multiple", pregunta: "¿Qué harías si no cumples una fecha límite de entrega?", opciones: ["Nada, esperar a que pregunten", "Avisar cuanto antes y proponer un plan", "Justificar sin avisar", "Renunciar a la tarea"], respuesta_correcta: 1, puntos: 15 },
    { id: "g2", tipo: "abierta", pregunta: "Cuéntanos sobre un proyecto del que te sientas orgulloso y por qué.", puntos: 25 },
  ],
};

function detectarArea(vacante) {
  const texto = `${vacante.area || ""} ${vacante.titulo || ""}`.toLowerCase();
  if (/(desarroll|program|software|sistemas|frontend|backend|datos)/.test(texto)) return "programacion";
  if (/marketing|publicidad|ventas|redes/.test(texto)) return "marketing";
  if (/diseñ|dise|ux|ui/.test(texto)) return "diseno";
  return "general";
}

/** Genera el examen (RF-E36, RF-E37): banco de reactivos según el área detectada. */
function generarExamen(vacante) {
  const area = detectarArea(vacante);
  const preguntas = BANCOS_POR_AREA[area] || BANCOS_POR_AREA.general;
  return {
    tipo: area === "general" ? "no_tecnico" : "tecnico",
    preguntas,
  };
}

/**
 * Califica el examen (RF-E39, RIA-04): opción múltiple y casos prácticos cerrados
 * se califican automáticamente; las respuestas abiertas reciben una calificación
 * simulada (en producción: Bedrock + rúbrica) basada en la longitud/calidad básica.
 */
function calificarExamen(preguntas, respuestas) {
  let puntajeObtenido = 0;
  let puntajeMaximo = 0;
  const fortalezas = [];
  const areasMejora = [];

  for (const p of preguntas) {
    puntajeMaximo += p.puntos;
    const respuesta = respuestas[p.id];

    if (p.tipo === "opcion_multiple") {
      if (respuesta === p.respuesta_correcta) {
        puntajeObtenido += p.puntos;
        fortalezas.push(`Respuesta correcta en: "${p.pregunta.slice(0, 60)}..."`);
      } else {
        areasMejora.push(`Revisar el tema de: "${p.pregunta.slice(0, 60)}..."`);
      }
    } else {
      // Casos prácticos y abiertas: calificación simulada por longitud/calidad básica
      const texto = (respuesta || "").trim();
      const factor = texto.length > 200 ? 1 : texto.length > 80 ? 0.7 : texto.length > 0 ? 0.4 : 0;
      puntajeObtenido += Math.round(p.puntos * factor);
      if (factor >= 0.7) fortalezas.push("Respuesta abierta bien desarrollada");
      else areasMejora.push("Ampliar y estructurar mejor las respuestas abiertas");
    }
  }

  const puntajeGlobal = puntajeMaximo > 0 ? Math.round((puntajeObtenido / puntajeMaximo) * 100) : 0;
  const nivel = puntajeGlobal >= 85 ? "Alta compatibilidad" : puntajeGlobal >= 60 ? "Compatibilidad media" : "Baja compatibilidad";

  return {
    puntaje_global: puntajeGlobal,
    fortalezas: fortalezas.slice(0, 4).join(". ") || "Sin fortalezas destacadas detectadas.",
    areas_mejora: areasMejora.slice(0, 4).join(". ") || "Ninguna área de mejora relevante detectada.",
    nivel_compatibilidad: nivel,
  };
}

module.exports = { generarExamen, calificarExamen };
