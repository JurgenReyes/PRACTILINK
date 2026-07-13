const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Empresa = sequelize.define("Empresa", {
  id_empresa: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  id_usuario: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  nombre_empresa: { type: DataTypes.STRING(150), allowNull: false },
  rfc: { type: DataTypes.STRING(13), allowNull: false },
  giro: { type: DataTypes.STRING(100) },
  responsable: { type: DataTypes.STRING(150) },
  telefono: { type: DataTypes.STRING(20) },
  estatus_validacion: { type: DataTypes.ENUM("pendiente", "aprobada", "rechazada"), defaultValue: "pendiente" },
  motivo_rechazo: { type: DataTypes.STRING(255) },
}, {
  tableName: "empresas",
  createdAt: "fecha_creacion",
  updatedAt: "fecha_modificacion",
});

module.exports = Empresa;
