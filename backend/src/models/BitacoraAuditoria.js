const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const BitacoraAuditoria = sequelize.define("BitacoraAuditoria", {
  id_log: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  id_admin: { type: DataTypes.INTEGER, allowNull: false },
  accion: { type: DataTypes.STRING(150), allowNull: false },
  detalle: { type: DataTypes.TEXT },
}, {
  tableName: "bitacora_auditoria",
  createdAt: "fecha_creacion",
  updatedAt: false,
});

module.exports = BitacoraAuditoria;
