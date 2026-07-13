const router = require("express").Router();
const vacantes = require("../controllers/vacanteController");
const { requiereAutenticacion, requiereRol } = require("../middleware/auth");

router.get("/", vacantes.listar); // público, con filtros por query string
router.get("/:id", vacantes.detalle);
router.post("/", requiereAutenticacion, requiereRol("empresa"), vacantes.crear);
router.put("/:id", requiereAutenticacion, requiereRol("empresa"), vacantes.actualizar);
router.post("/:id/duplicar", requiereAutenticacion, requiereRol("empresa"), vacantes.duplicar);

module.exports = router;
