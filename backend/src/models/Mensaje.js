const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Mensaje = sequelize.define("Mensaje", {
  id_mensaje: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  id_postulacion: { type: DataTypes.INTEGER, allowNull: false },
  id_usuario_emisor: { type: DataTypes.INTEGER, allowNull: false },
  contenido: { type: DataTypes.TEXT, allowNull: false },
}, {
  tableName: "mensajes",
  createdAt: "fecha_creacion",
  updatedAt: false,
});

module.exports = Mensaje;
