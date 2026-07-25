const { wrapRouter } = require("../middleware/asyncHandler");
const router = wrapRouter(require("express").Router());
const mensajes = require("../controllers/mensajeController");
const { requiereAutenticacion } = require("../middleware/auth");

router.use(requiereAutenticacion);
router.get("/:id_postulacion", mensajes.listar);
router.post("/:id_postulacion", mensajes.enviar);

module.exports = router;
