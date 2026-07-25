const { wrapRouter } = require("../middleware/asyncHandler");
const router = wrapRouter(require("express").Router());
const { requiereAutenticacion, requiereRol } = require("../middleware/auth");
const { Favorito, Vacante, Empresa, Estudiante } = require("../models");

router.use(requiereAutenticacion, requiereRol("estudiante"));

router.get("/", async (req, res) => {
  const estudiante = await Estudiante.findOne({ where: { id_usuario: req.usuario.id_usuario } });
  const favoritos = await Favorito.findAll({
    where: { id_estudiante: estudiante.id_estudiante },
    include: [{ model: Vacante, include: [Empresa] }],
  });
  return res.json(favoritos);
});

router.post("/:id_vacante", async (req, res) => {
  const estudiante = await Estudiante.findOne({ where: { id_usuario: req.usuario.id_usuario } });
  try {
    const favorito = await Favorito.create({ id_estudiante: estudiante.id_estudiante, id_vacante: req.params.id_vacante });
    return res.status(201).json(favorito);
  } catch (err) {
    return res.status(409).json({ error: "Ya guardaste esta vacante como favorita" });
  }
});

router.delete("/:id_vacante", async (req, res) => {
  const estudiante = await Estudiante.findOne({ where: { id_usuario: req.usuario.id_usuario } });
  await Favorito.destroy({ where: { id_estudiante: estudiante.id_estudiante, id_vacante: req.params.id_vacante } });
  return res.json({ mensaje: "Vacante eliminada de favoritos" });
});

module.exports = router;
