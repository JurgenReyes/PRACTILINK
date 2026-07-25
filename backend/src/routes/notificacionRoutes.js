const { wrapRouter } = require("../middleware/asyncHandler");
const router = wrapRouter(require("express").Router());
const { requiereAutenticacion } = require("../middleware/auth");
const { Notificacion } = require("../models");

router.use(requiereAutenticacion);

router.get("/", async (req, res) => {
  const notificaciones = await Notificacion.findAll({
    where: { id_usuario: req.usuario.id_usuario },
    order: [["fecha_creacion", "DESC"]],
    limit: 30,
  });
  return res.json(notificaciones);
});

router.put("/:id/leido", async (req, res) => {
  const notificacion = await Notificacion.findOne({
    where: { id_notificacion: req.params.id, id_usuario: req.usuario.id_usuario },
  });
  if (!notificacion) return res.status(404).json({ error: "Notificación no encontrada" });
  notificacion.leido = true;
  await notificacion.save();
  return res.json(notificacion);
});

router.put("/marcar-todas", async (req, res) => {
  await Notificacion.update({ leido: true }, { where: { id_usuario: req.usuario.id_usuario, leido: false } });
  return res.json({ mensaje: "Todas las notificaciones marcadas como leídas" });
});

module.exports = router;
