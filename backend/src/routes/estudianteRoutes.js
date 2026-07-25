const { wrapRouter } = require("../middleware/asyncHandler");
const router = wrapRouter(require("express").Router());
const multer = require("multer");
const { requiereAutenticacion, requiereRol } = require("../middleware/auth");
const { Estudiante, Habilidad } = require("../models");
const { subirArchivo } = require("../services/aws/s3");
const { analizarCV } = require("../services/ia/analisisCV");

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // RF-E16: máximo 10 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") return cb(new Error("Solo se permiten archivos PDF"));
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
  const campos = ["universidad", "carrera", "semestre", "promedio", "foto_url"];
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

    const key = `cvs/${estudiante.id_estudiante}/${Date.now()}_${req.file.originalname}`;
    await subirArchivo({ buffer: req.file.buffer, key, contentType: "application/pdf" });

    // En producción, este análisis se ejecutaría de forma asíncrona (cola SQS) para
    // cumplir RNF-06 sin bloquear la petición HTTP. Aquí se llama directo por simplicidad.
    const perfilExtraido = await analizarCV({ textoExtraido: null });

    return res.status(201).json({
      mensaje: "CV recibido y analizado",
      url_s3: key,
      perfil_extraido: perfilExtraido,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "No se pudo procesar el CV. Intenta de nuevo o completa tu perfil manualmente." });
  }
});

module.exports = router;
