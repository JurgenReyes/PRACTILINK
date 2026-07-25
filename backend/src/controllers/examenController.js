const { Examen, ResultadoExamen, Postulacion, Estudiante, Vacante } = require("../models");
const { calificarExamen } = require("../services/ia/examenes");
const { notificar } = require("../services/notificaciones");

// RF-E41: historial de evaluaciones del estudiante
async function misExamenes(req, res) {
  const estudiante = await Estudiante.findOne({ where: { id_usuario: req.usuario.id_usuario } });
  const examenes = await Examen.findAll({
    include: [
      { model: Postulacion, where: { id_estudiante: estudiante.id_estudiante }, include: [Vacante] },
      ResultadoExamen,
    ],
    order: [["fecha_creacion", "DESC"]],
  });
  return res.json(examenes);
}

async function detalle(req, res) {
  const estudiante = await Estudiante.findOne({ where: { id_usuario: req.usuario.id_usuario } });
  const examen = await Examen.findOne({
    where: { id_examen: req.params.id },
    include: [{ model: Postulacion, where: { id_estudiante: estudiante.id_estudiante }, include: [Vacante] }],
  });
  if (!examen) return res.status(404).json({ error: "Examen no encontrado" });

  // No se envían las respuestas correctas de opción múltiple si aún no ha finalizado
  const preguntas = examen.finalizado
    ? examen.preguntas_json
    : examen.preguntas_json.map(({ respuesta_correcta, ...resto }) => resto);

  return res.json({ ...examen.toJSON(), preguntas_json: preguntas });
}

// RF-E38/RF-E42: tiempo límite visible, no se puede reiniciar un examen ya finalizado
async function enviarRespuestas(req, res) {
  const estudiante = await Estudiante.findOne({ where: { id_usuario: req.usuario.id_usuario } });
  const examen = await Examen.findOne({
    where: { id_examen: req.params.id },
    include: [{ model: Postulacion, where: { id_estudiante: estudiante.id_estudiante }, include: [Vacante] }],
  });
  if (!examen) return res.status(404).json({ error: "Examen no encontrado" });
  if (examen.finalizado) return res.status(400).json({ error: "Este examen ya fue finalizado y no puede reiniciarse" }); // RF-E42

  const { respuestas } = req.body; // { [id_pregunta]: respuesta }
  examen.respuestas_json = respuestas;
  examen.finalizado = true;
  await examen.save();

  // RF-E39/RIA-04: calificación automática (cerradas) + calificación sugerida (abiertas)
  const resultado = await calificarExamen(examen.preguntas_json, respuestas);
  await ResultadoExamen.create({ id_examen: examen.id_examen, ...resultado });

  await notificar({
    id_usuario: req.usuario.id_usuario,
    tipo: "resultado_examen",
    mensaje: `Tu resultado en el examen de "${examen.Postulacion.Vacante.titulo}" ya está disponible: ${resultado.puntaje_global}%.`,
    asuntoCorreo: "Resultado de tu examen disponible en PractiLink",
  });

  return res.json({ mensaje: "Examen enviado y calificado", resultado });
}

module.exports = { misExamenes, detalle, enviarRespuestas };
