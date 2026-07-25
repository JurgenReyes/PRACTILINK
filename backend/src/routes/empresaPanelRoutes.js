const { wrapRouter } = require("../middleware/asyncHandler");
const router = wrapRouter(require("express").Router());
const panel = require("../controllers/empresaPanelController");
const { requiereAutenticacion, requiereRol } = require("../middleware/auth");

router.use(requiereAutenticacion, requiereRol("empresa"));

router.get("/mis-vacantes", panel.misVacantes);
router.get("/vacantes/:id_vacante/candidatos", panel.candidatosPorVacante);
router.put("/postulaciones/:id_postulacion/notas", panel.actualizarNotas);
router.put("/postulaciones/:id_postulacion/entrevista", panel.programarEntrevista);
router.get("/dashboard", panel.dashboard);
router.get("/reportes/candidatos.csv", panel.exportarCandidatosCSV);

module.exports = router;
