const { wrapRouter } = require("../middleware/asyncHandler");
const router = wrapRouter(require("express").Router());
const { CatalogoUniversidad, CatalogoCarrera, Aviso } = require("../models");

// Lectura pública: usados en formularios de registro/publicación de vacantes
router.get("/catalogos/:tipo", async (req, res) => {
  const Modelo = req.params.tipo === "universidades" ? CatalogoUniversidad : CatalogoCarrera;
  return res.json(await Modelo.findAll({ order: [["nombre", "ASC"]] }));
});

router.get("/avisos", async (req, res) => {
  return res.json(await Aviso.findAll({ where: { activo: true }, order: [["fecha_creacion", "DESC"]] }));
});

module.exports = router;
