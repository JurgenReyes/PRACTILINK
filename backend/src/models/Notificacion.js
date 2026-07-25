const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Notificacion = sequelize.define("Notificacion", {
  id_notificacion: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  id_usuario: { type: DataTypes.INTEGER, allowNull: false },
  tipo: { type: DataTypes.STRING(50), allowNull: false },
  mensaje: { type: DataTypes.STRING(255), allowNull: false },
  leido: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: "notificaciones",
  createdAt: "fecha_creacion",
  updatedAt: false,
});

module.exports = Notificacion;
