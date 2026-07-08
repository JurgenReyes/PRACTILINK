/**
 * Cálculo del porcentaje de coincidencia (matching) entre un estudiante y una vacante.
 * RF-E22 / RIA-02: en producción, el modelo (Bedrock) pondera criterios configurables
 * por el administrador (habilidades, carrera, idiomas, experiencia).
 *
 * Esta versión usa una heurística simple (coincidencia de palabras clave) como
 * marcador de posición funcional, para no depender de credenciales de AWS en el prototipo.
 */
async function calcularMatching(estudiante, vacante) {
  let puntaje = 50; // base

  if (vacante.carrera_solicitada && estudiante.carrera) {
    if (vacante.carrera_solicitada.toLowerCase().includes(estudiante.carrera.toLowerCase())) {
      puntaje += 30;
    }
  }
  if (estudiante.promedio) {
    puntaje += Math.min(20, Number(estudiante.promedio) * 2);
  }

  return Math.min(100, Math.round(puntaje));
}

module.exports = { calcularMatching };
