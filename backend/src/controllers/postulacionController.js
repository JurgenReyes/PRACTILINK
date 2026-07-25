const { Postulacion, Vacante, Estudiante, Empresa, Examen } = require("../models");
const { calcularMatching } = require("../services/ia/matching");
const { generarExamen } = require("../services/ia/examenes");
const { notificar } = require("../services/notificaciones");

// RF-E29 a RF-E32
async function postularse(req, res) {
  const estudiante = await Estudiante.findOne({ where: { id_usuario: req.usuario.id_usuario } });
  if (!estudiante) return res.status(404).json({ error: "Perfil de estudiante no encontrado" });

  const { id_vacante } = req.body;
  const vacante = await Vacante.findByPk(id_vacante, { include: [Empresa] });
  if (!vacante || vacante.estatus !== "publicada") {
    return res.status(400).json({ error: "La vacante no está disponible" });
  }

  const yaExiste = await Postulacion.findOne({ where: { id_estudiante: estudiante.id_estudiante, id_vacante } });
  if (yaExiste) return res.status(409).json({ error: "Ya te has postulado a esta vacante" }); // RF-E30

  const matching_score = await calcularMatching(estudiante, vacante); // RIA-02

  const postulacion = await Postulacion.create({
    id_estudiante: estudiante.id_estudiante,
    id_vacante,
    matching_score,
  });

  // RF-EM24: notificar a la empresa de la nueva postulación
  await notificar({
    id_usuario: vacante.Empresa.id_usuario,
    tipo: "nueva_postulacion",
    mensaje: `${estudiante.nombre_completo} se postuló a "${vacante.titulo}".`,
    asuntoCorreo: "Nueva postulación recibida en PractiLink",
  });

  return res.status(201).json(postulacion);
}

async function cancelar(req, res) {
  const estudiante = await Estudiante.findOne({ where: { id_usuario: req.usuario.id_usuario } });
  const postulacion = await Postulacion.findOne({
    where: { id_postulacion: req.params.id, id_estudiante: estudiante.id_estudiante },
  });
  if (!postulacion) return res.status(404).json({ error: "Postulación no encontrada" });
  if (postulacion.estatus !== "en_revision") {
    return res.status(400).json({ error: "Solo se puede cancelar mientras está en revisión" }); // RF-E31
  }
  await postulacion.destroy();
  return res.json({ mensaje: "Postulación cancelada" });
}

async function misPostulaciones(req, res) {
  const estudiante = await Estudiante.findOne({ where: { id_usuario: req.usuario.id_usuario } });
  const postulaciones = await Postulacion.findAll({
    where: { id_estudiante: estudiante.id_estudiante },
    include: [{ model: Vacante, include: [Empresa] }],
    order: [["fecha_postulacion", "DESC"]],
  });
  return res.json(postulaciones);
}

// RF-EM16: la empresa/admin cambia el estatus, con notificación (RF-E34) y generación
// automática de examen cuando pasa a "evaluacion_pendiente" (RF-E36).
async function cambiarEstatus(req, res) {
  const { estatus } = req.body;
  const estadosValidos = ["en_revision", "evaluacion_pendiente", "entrevista_programada", "aceptado", "rechazado"];
  if (!estadosValidos.includes(estatus)) return res.status(400).json({ error: "Estatus inválido" });

  const postulacion = await Postulacion.findByPk(req.params.id, {
    include: [{ model: Vacante, include: [Empresa] }, Estudiante],
  });
  if (!postulacion) return res.status(404).json({ error: "Postulación no encontrada" });

  // La evaluación con IA es obligatoria: no se puede aceptar a un candidato
  // que todavía no presentó (o no terminó) su examen.
  if (estatus === "aceptado") {
    const examen = await Examen.findOne({ where: { id_postulacion: postulacion.id_postulacion } });
    if (!examen || !examen.finalizado) {
      return res.status(400).json({
        error: examen
          ? "El candidato todavía no ha finalizado su examen de evaluación. No se puede aceptar hasta que lo complete."
          : "Este candidato aún no tiene un examen de evaluación asignado. Cambia primero su estatus a \"Evaluación pendiente\" y espera a que lo conteste antes de aceptarlo.",
      });
    }
  }

  postulacion.estatus = estatus;
  await postulacion.save();

  const ETIQUETAS = {
    en_revision: "en revisión", evaluacion_pendiente: "evaluación pendiente",
    entrevista_programada: "entrevista programada", aceptado: "aceptado", rechazado: "rechazado",
  };

  await notificar({
    id_usuario: postulacion.Estudiante.id_usuario,
    tipo: "cambio_estatus",
    mensaje: `Tu postulación a "${postulacion.Vacante.titulo}" cambió a: ${ETIQUETAS[estatus]}.`,
    asuntoCorreo: "Actualización de tu postulación en PractiLink",
  });

  // RF-E36: si pasa a evaluación pendiente y no existe ya un examen, se genera uno
  if (estatus === "evaluacion_pendiente") {
    const examenExistente = await Examen.findOne({ where: { id_postulacion: postulacion.id_postulacion } });
    if (!examenExistente) {
      const { tipo, preguntas } = generarExamen(postulacion.Vacante);
      await Examen.create({
        id_postulacion: postulacion.id_postulacion,
        tipo,
        tiempo_limite_min: 30,
        preguntas_json: preguntas,
      });
    }
  }

  return res.json(postulacion);
}

// RF-E45: el estudiante confirma o solicita reprogramar su entrevista
async function confirmarEntrevista(req, res) {
  const estudiante = await Estudiante.findOne({ where: { id_usuario: req.usuario.id_usuario } });
  const postulacion = await Postulacion.findOne({
    where: { id_postulacion: req.params.id, id_estudiante: estudiante.id_estudiante },
    include: [Vacante],
  });
  if (!postulacion) return res.status(404).json({ error: "Postulación no encontrada" });

  const { accion } = req.body; // "confirmar" | "reprogramar"
  if (accion === "confirmar") {
    postulacion.entrevista_confirmada = true;
  } else if (accion === "reprogramar") {
    postulacion.entrevista_confirmada = false;
    postulacion.notas_entrevista = (postulacion.notas_entrevista || "") + " [El estudiante solicitó reprogramar]";
  } else {
    return res.status(400).json({ error: "Acción inválida" });
  }
  await postulacion.save();
  return res.json(postulacion);
}

module.exports = { postularse, cancelar, misPostulaciones, cambiarEstatus, confirmarEntrevista };
