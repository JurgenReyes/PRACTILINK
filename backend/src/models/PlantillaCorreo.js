const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// Las plantillas usan variables tipo {{nombre}} que se sustituyen al enviar
// el correo (ver services/plantillasCorreo.js). Si una clave no tiene fila
// aquí todavía, el envío de correo usa un texto por defecto embebido en el
// código, así que esta tabla nunca bloquea el funcionamiento del sistema.
const PlantillaCorreo = sequelize.define("PlantillaCorreo", {
  clave: { type: DataTypes.STRING(60), primaryKey: true },
  nombre: { type: DataTypes.STRING(120), allowNull: false },
  asunto: { type: DataTypes.STRING(200), allowNull: false },
  cuerpo: { type: DataTypes.TEXT, allowNull: false },
}, {
  tableName: "plantillas_correo",
  createdAt: "fecha_creacion",
  updatedAt: "fecha_modificacion",
});

module.exports = PlantillaCorreo;
