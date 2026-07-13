const router = require("express").Router();
const postulaciones = require("../controllers/postulacionController");
const { requiereAutenticacion, requiereRol } = require("../middleware/auth");

router.post("/", requiereAutenticacion, requiereRol("estudiante"), postulaciones.postularse);
router.get("/mias", requiereAutenticacion, requiereRol("estudiante"), postulaciones.misPostulaciones);
router.delete("/:id", requiereAutenticacion, requiereRol("estudiante"), postulaciones.cancelar);
router.put("/:id/estatus", requiereAutenticacion, requiereRol("empresa", "administrador"), postulaciones.cambiarEstatus);

module.exports = router;
