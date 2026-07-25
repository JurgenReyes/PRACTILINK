const { wrapRouter } = require("../middleware/asyncHandler");
const router = wrapRouter(require("express").Router());
const examenes = require("../controllers/examenController");
const { requiereAutenticacion, requiereRol } = require("../middleware/auth");

router.use(requiereAutenticacion, requiereRol("estudiante"));

router.get("/", examenes.misExamenes);
router.get("/:id", examenes.detalle);
router.post("/:id/respuestas", examenes.enviarRespuestas);

module.exports = router;
