const { wrapRouter } = require("../middleware/asyncHandler");
const router = wrapRouter(require("express").Router());
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const panel = require("../controllers/empresaPanelController");
const { requiereAutenticacion, requiereRol } = require("../middleware/auth");
const { Empresa } = require("../models");

router.use(requiereAutenticacion, requiereRol("empresa"));

// Logo de la empresa: mismo criterio que la foto de perfil del estudiante —
// se guarda localmente en disco en vez de S3, para que funcione sin
// necesitar credenciales reales de AWS.
const CARPETA_LOGOS = path.join(__dirname, "../../uploads/logos");
const uploadLogo = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (!["image/jpeg", "image/png", "image/webp", "image/svg+xml"].includes(file.mimetype)) {
      return cb(new Error("Solo se permiten imágenes JPG, PNG, WEBP o SVG"));
    }
    cb(null, true);
  },
});

router.post("/logo", uploadLogo.single("logo"), async (req, res) => {
  const empresa = await Empresa.findOne({ where: { id_usuario: req.usuario.id_usuario } });
  if (!empresa) return res.status(404).json({ error: "Perfil no encontrado" });
  if (!req.file) return res.status(400).json({ error: "Debes seleccionar una imagen" });

  fs.mkdirSync(CARPETA_LOGOS, { recursive: true });

  if (empresa.logo_url?.startsWith("/uploads/logos/")) {
    fs.unlink(path.join(__dirname, "../..", empresa.logo_url), () => {});
  }

  const extension = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/svg+xml": "svg" }[req.file.mimetype];
  const nombreArchivo = `${empresa.id_empresa}_${Date.now()}.${extension}`;
  fs.writeFileSync(path.join(CARPETA_LOGOS, nombreArchivo), req.file.buffer);

  empresa.logo_url = `/uploads/logos/${nombreArchivo}`;
  await empresa.save();
  return res.json(empresa);
});

router.get("/mis-vacantes", panel.misVacantes);
router.get("/perfil", panel.obtenerPerfilEmpresa);
router.put("/perfil", panel.actualizarPerfilEmpresa);
router.get("/vacantes/:id_vacante/candidatos", panel.candidatosPorVacante);
router.put("/postulaciones/:id_postulacion/notas", panel.actualizarNotas);
router.put("/postulaciones/:id_postulacion/entrevista", panel.programarEntrevista);
router.get("/dashboard", panel.dashboard);
router.get("/entrevistas", panel.misEntrevistas);
router.get("/reportes/candidatos.csv", panel.exportarCandidatosCSV);

module.exports = router;
