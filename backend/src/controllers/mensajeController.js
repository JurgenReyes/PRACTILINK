const { Mensaje, Postulacion, Estudiante, Empresa, Vacante, Usuario } = require("../models");
const { notificar } = require("../services/notificaciones");

/** Verifica que el usuario autenticado pertenezca a la postulación (estudiante o empresa dueña de la vacante). */
async function obtenerPostulacionAutorizada(req) {
  const postulacion = await Postulacion.findByPk(req.params.id_postulacion, {
    include: [{ model: Vacante, include: [Empresa] }, Estudiante],
  });
  if (!postulacion) return null;

  const esEstudiante = postulacion.Estudiante && req.usuario.rol === "estudiante" &&
    postulacion.Estudiante.id_usuario === req.usuario.id_usuario;
  const esEmpresa = postulacion.Vacante.Empresa && req.usuario.rol === "empresa" &&
    postulacion.Vacante.Empresa.id_usuario === req.usuario.id_usuario;

  return (esEstudiante || esEmpresa) ? postulacion : null;
}

// RF-E44/RF-EM23: chat habilitado únicamente después de la postulación
async function listar(req, res) {
  const postulacion = await obtenerPostulacionAutorizada(req);
  if (!postulacion) return res.status(403).json({ error: "No tienes acceso a esta conversación" });

  const mensajes = await Mensaje.findAll({
    where: { id_postulacion: postulacion.id_postulacion },
    include: [{ model: Usuario, as: "Emisor", attributes: ["id_usuario", "rol"] }],
    order: [["fecha_creacion", "ASC"]],
  });
  return res.json(mensajes);
}

async function enviar(req, res) {
  const postulacion = await obtenerPostulacionAutorizada(req);
  if (!postulacion) return res.status(403).json({ error: "No tienes acceso a esta conversación" });

  const { contenido } = req.body;
  if (!contenido || !contenido.trim()) return res.status(400).json({ error: "El mensaje no puede estar vacío" });

  const mensaje = await Mensaje.create({
    id_postulacion: postulacion.id_postulacion,
    id_usuario_emisor: req.usuario.id_usuario,
    contenido: contenido.trim(),
  });

  // Notifica a la otra parte de la conversación
  const destinatario = req.usuario.rol === "estudiante"
    ? postulacion.Vacante.Empresa.id_usuario
    : postulacion.Estudiante.id_usuario;

  await notificar({
    id_usuario: destinatario,
    tipo: "nuevo_mensaje",
    mensaje: `Tienes un nuevo mensaje sobre "${postulacion.Vacante.titulo}".`,
    asuntoCorreo: "Nuevo mensaje en PractiLink",
  });

  return res.status(201).json(mensaje);
}

module.exports = { listar, enviar };
