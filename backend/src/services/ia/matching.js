const { ConfiguracionIA } = require("../../models");

/**
 * Cálculo del porcentaje de coincidencia (matching) entre un estudiante y una vacante.
 * RF-E22 / RIA-02: los pesos son configurables por el administrador (RF-A12) a través
 * de la tabla configuracion_ia, en vez de estar fijos en el código.
 *
 * En producción, Amazon Bedrock ponderaría además habilidades específicas, idiomas y
 * experiencia extraídos del CV; aquí se implementa la heurística base (carrera + promedio)
 * ya conectada al sistema de configuración real.
 */
async function obtenerParametro(clave, valorPorDefecto) {
  const config = await ConfiguracionIA.findByPk(clave);
  return config ? Number(config.valor) : valorPorDefecto;
}

async function calcularMatching(estudiante, vacante) {
  const puntajeBase = await obtenerParametro("puntaje_base", 50);
  const pesoCarrera = await obtenerParametro("peso_carrera", 30);
  const pesoPromedio = await obtenerParametro("peso_promedio", 20);

  let puntaje = puntajeBase;

  if (vacante.carrera_solicitada && estudiante.carrera) {
    if (vacante.carrera_solicitada.toLowerCase().includes(estudiante.carrera.toLowerCase())) {
      puntaje += pesoCarrera;
    }
  }
  if (estudiante.promedio) {
    puntaje += Math.min(pesoPromedio, Number(estudiante.promedio) * (pesoPromedio / 10));
  }

  return Math.min(100, Math.round(puntaje));
}

module.exports = { calcularMatching };
