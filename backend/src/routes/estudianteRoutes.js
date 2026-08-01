const { wrapRouter } = require("../middleware/asyncHandler");
const router = wrapRouter(require("express").Router());
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { requiereAutenticacion, requiereRol } = require("../middleware/auth");
const { Estudiante, Habilidad } = require("../models");
const { analizarCV } = require("../services/ia/analisisCV");

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // RF-E16: máximo 10 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") return cb(new Error("Solo se permiten archivos PDF"));
    cb(null, true);
  },
});

// Foto de perfil y CV: se guardan localmente en disco (no en S3), para que
// funcionen de inmediato en desarrollo sin necesitar credenciales reales de
// AWS. El análisis de contenido del CV (analisisCV.js) ya era simulado desde
// antes, así que ese paso nunca dependió de la nube — solo el almacenamiento
// del archivo en sí, que es lo que se corrige aquí.
const CARPETA_FOTOS = path.join(__dirname, "../../uploads/fotos");
const CARPETA_CVS = path.join(__dirname, "../../uploads/cvs");
const uploadFoto = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      return cb(new Error("Solo se permiten imágenes JPG, PNG o WEBP"));
    }
    cb(null, true);
  },
});

router.get("/perfil", requiereAutenticacion, requiereRol("estudiante"), async (req, res) => {
  const estudiante = await Estudiante.findOne({ where: { id_usuario: req.usuario.id_usuario } });
  if (!estudiante) return res.status(404).json({ error: "Perfil no encontrado" });
  return res.json(estudiante);
});

router.put("/perfil", requiereAutenticacion, requiereRol("estudiante"), async (req, res) => {
  const estudiante = await Estudiante.findOne({ where: { id_usuario: req.usuario.id_usuario } });
  if (!estudiante) return res.status(404).json({ error: "Perfil no encontrado" });
  await estudiante.update(req.body);

  // RF-E13: recalcular porcentaje de perfil completado (heurística simple para el prototipo)
  const campos = ["universidad", "carrera", "semestre", "promedio", "foto_url", "cv_url"];
  const completados = campos.filter((c) => estudiante[c] !== null && estudiante[c] !== undefined).length;
  estudiante.porcentaje_perfil = Math.round((completados / campos.length) * 100);
  await estudiante.save();

  return res.json(estudiante);
});

// Foto de perfil del estudiante (guardada en disco, ver comentario arriba).
router.post("/foto", requiereAutenticacion, requiereRol("estudiante"), uploadFoto.single("foto"), async (req, res) => {
  const estudiante = await Estudiante.findOne({ where: { id_usuario: req.usuario.id_usuario } });
  if (!estudiante) return res.status(404).json({ error: "Perfil no encontrado" });
  if (!req.file) return res.status(400).json({ error: "Debes seleccionar una imagen" });

  fs.mkdirSync(CARPETA_FOTOS, { recursive: true });

  // Si ya tenía una foto anterior, se borra para no acumular archivos huérfanos.
  if (estudiante.foto_url?.startsWith("/uploads/fotos/")) {
    const rutaAnterior = path.join(__dirname, "../..", estudiante.foto_url);
    fs.unlink(rutaAnterior, () => {}); // best-effort, no bloquea si falla
  }

  const extension = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[req.file.mimetype];
  const nombreArchivo = `${estudiante.id_estudiante}_${Date.now()}.${extension}`;
  fs.writeFileSync(path.join(CARPETA_FOTOS, nombreArchivo), req.file.buffer);

  estudiante.foto_url = `/uploads/fotos/${nombreArchivo}`;

  // Recalcular % de perfil completado, igual que en PUT /perfil.
  const campos = ["universidad", "carrera", "semestre", "promedio", "foto_url", "cv_url"];
  const completados = campos.filter((c) => estudiante[c] !== null && estudiante[c] !== undefined).length;
  estudiante.porcentaje_perfil = Math.round((completados / campos.length) * 100);

  await estudiante.save();
  return res.json(estudiante);
});

// RF-E14: habilidades, certificaciones e idiomas del estudiante
router.get("/habilidades", requiereAutenticacion, requiereRol("estudiante"), async (req, res) => {
  const estudiante = await Estudiante.findOne({ where: { id_usuario: req.usuario.id_usuario } });
  if (!estudiante) return res.status(404).json({ error: "Perfil no encontrado" });
  const habilidades = await Habilidad.findAll({ where: { id_estudiante: estudiante.id_estudiante } });
  return res.json(habilidades);
});

router.post("/habilidades", requiereAutenticacion, requiereRol("estudiante"), async (req, res) => {
  const estudiante = await Estudiante.findOne({ where: { id_usuario: req.usuario.id_usuario } });
  if (!estudiante) return res.status(404).json({ error: "Perfil no encontrado" });
  const { nombre, tipo, nivel, institucion, fecha } = req.body;
  if (!nombre || !tipo) return res.status(400).json({ error: "Nombre y tipo son obligatorios" });
  const habilidad = await Habilidad.create({ id_estudiante: estudiante.id_estudiante, nombre, tipo, nivel, institucion, fecha: fecha || null });
  return res.status(201).json(habilidad);
});

router.delete("/habilidades/:id", requiereAutenticacion, requiereRol("estudiante"), async (req, res) => {
  const estudiante = await Estudiante.findOne({ where: { id_usuario: req.usuario.id_usuario } });
  if (!estudiante) return res.status(404).json({ error: "Perfil no encontrado" });
  await Habilidad.destroy({ where: { id_habilidad: req.params.id, id_estudiante: estudiante.id_estudiante } });
  return res.json({ mensaje: "Habilidad eliminada" });
});

// RF-E16 a RF-E20: carga y análisis de CV
router.post("/cv", requiereAutenticacion, requiereRol("estudiante"), upload.single("cv"), async (req, res) => {
  try {
    const estudiante = await Estudiante.findOne({ where: { id_usuario: req.usuario.id_usuario } });
    if (!estudiante) return res.status(404).json({ error: "Perfil no encontrado" });
    if (!req.file) return res.status(400).json({ error: "Debes adjuntar un archivo PDF" });

    fs.mkdirSync(CARPETA_CVS, { recursive: true });

    // Si ya tenía un CV anterior, se borra para no acumular archivos huérfanos.
    if (estudiante.cv_url?.startsWith("/uploads/cvs/")) {
      fs.unlink(path.join(__dirname, "../..", estudiante.cv_url), () => {});
    }

    const nombreArchivo = `${estudiante.id_estudiante}_${Date.now()}.pdf`;
    fs.writeFileSync(path.join(CARPETA_CVS, nombreArchivo), req.file.buffer);

    // En producción, este análisis se ejecutaría de forma asíncrona (cola SQS) para
    // cumplir RNF-06 sin bloquear la petición HTTP. Aquí se llama directo por simplicidad.
    const perfilExtraido = await analizarCV({ textoExtraido: null });

    estudiante.cv_url = `/uploads/cvs/${nombreArchivo}`;
    estudiante.cv_nombre_original = req.file.originalname;

    const campos = ["universidad", "carrera", "semestre", "promedio", "foto_url", "cv_url"];
    const completados = campos.filter((c) => estudiante[c] !== null && estudiante[c] !== undefined).length;
    estudiante.porcentaje_perfil = Math.round((completados / campos.length) * 100);

    await estudiante.save();

    return res.status(201).json({
      mensaje: "CV recibido y analizado",
      cv_url: estudiante.cv_url,
      cv_nombre_original: estudiante.cv_nombre_original,
      perfil_extraido: perfilExtraido,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "No se pudo procesar el CV. Intenta de nuevo o completa tu perfil manualmente." });
  }
});

module.exports = router;
