const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Vacante = sequelize.define("Vacante", {
  id_vacante: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  id_empresa: { type: DataTypes.INTEGER, allowNull: false },
  titulo: { type: DataTypes.STRING(150), allowNull: false },
  area: { type: DataTypes.STRING(100) },
  modalidad: { type: DataTypes.ENUM("presencial", "remoto", "hibrido"), allowNull: false },
  ubicacion: { type: DataTypes.STRING(150) },
  carrera_solicitada: { type: DataTypes.STRING(150) },
  requisitos: { type: DataTypes.TEXT },
  horario: { type: DataTypes.STRING(100) },
  duracion_meses: { type: DataTypes.INTEGER },
  apoyo_economico: { type: DataTypes.DECIMAL(10, 2) },
  beneficios: { type: DataTypes.TEXT },
  estatus: { type: DataTypes.ENUM("borrador", "publicada", "pausada", "cerrada"), defaultValue: "borrador" },
  fecha_expiracion: { type: DataTypes.DATEONLY },
}, {
  tableName: "vacantes",
  createdAt: "fecha_creacion",
  updatedAt: "fecha_modificacion",
});

module.exports = Vacante;
