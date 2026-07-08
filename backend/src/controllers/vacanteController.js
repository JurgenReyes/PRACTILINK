const { Op } = require("sequelize");
const { Vacante, Empresa } = require("../models");

// RF-E24 a RF-E27: búsqueda, filtros combinables y orden.
async function listar(req, res) {
  const { q, carrera, modalidad, ubicacion, duracion_min, duracion_max, orden } = req.query;
  const where = { estatus: "publicada" };

  if (q) where.titulo = { [Op.like]: `%${q}%` };
  if (modalidad) where.modalidad = modalidad;
  if (ubicacion) where.ubicacion = { [Op.like]: `%${ubicacion}%` };
  if (carrera) where.carrera_solicitada = { [Op.like]: `%${carrera}%` };
  if (duracion_min || duracion_max) {
    where.duracion_meses = {};
    if (duracion_min) where.duracion_meses[Op.gte] = Number(duracion_min);
    if (duracion_max) where.duracion_meses[Op.lte] = Number(duracion_max);
  }

  let order = [["fecha_creacion", "DESC"]];
  if (orden === "remuneracion") order = [["apoyo_economico", "DESC"]];

  const vacantes = await Vacante.findAll({
    where,
    order,
    include: [{ model: Empresa, attributes: ["nombre_empresa", "giro"] }],
  });
  return res.json(vacantes);
}

async function detalle(req, res) {
  const vacante = await Vacante.findByPk(req.params.id, { include: [Empresa] });
  if (!vacante) return res.status(404).json({ error: "Vacante no encontrada" });
  return res.json(vacante);
}

// RF-EM06 a RF-EM09
async function crear(req, res) {
  const empresa = await Empresa.findOne({ where: { id_usuario: req.usuario.id_usuario } });
  if (!empresa) return res.status(404).json({ error: "Empresa no encontrada" });
  if (empresa.estatus_validacion !== "aprobada") {
    // RF-EM05: no puede publicar hasta ser validada. Puede guardar como borrador.
    if (req.body.estatus === "publicada") {
      return res.status(403).json({ error: "Tu cuenta empresarial aún no ha sido validada por un administrador" });
    }
  }
  const vacante = await Vacante.create({ ...req.body, id_empresa: empresa.id_empresa });
  return res.status(201).json(vacante);
}

// RF-EM10: editar, pausar, reactivar o cerrar
async function actualizar(req, res) {
  const empresa = await Empresa.findOne({ where: { id_usuario: req.usuario.id_usuario } });
  const vacante = await Vacante.findOne({ where: { id_vacante: req.params.id, id_empresa: empresa.id_empresa } });
  if (!vacante) return res.status(404).json({ error: "Vacante no encontrada" });
  await vacante.update(req.body);
  return res.json(vacante);
}

// RF-EM12: duplicar como plantilla
async function duplicar(req, res) {
  const empresa = await Empresa.findOne({ where: { id_usuario: req.usuario.id_usuario } });
  const original = await Vacante.findOne({ where: { id_vacante: req.params.id, id_empresa: empresa.id_empresa } });
  if (!original) return res.status(404).json({ error: "Vacante no encontrada" });
  const datos = original.toJSON();
  delete datos.id_vacante;
  datos.estatus = "borrador";
  const copia = await Vacante.create(datos);
  return res.status(201).json(copia);
}

module.exports = { listar, detalle, crear, actualizar, duplicar };
