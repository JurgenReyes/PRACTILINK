const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Aviso = sequelize.define("Aviso", {
  id_aviso: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  titulo: { type: DataTypes.STRING(150), allowNull: false },
  mensaje: { type: DataTypes.TEXT, allowNull: false },
  dirigido_a: { type: DataTypes.ENUM("todos", "estudiantes", "empresas"), defaultValue: "todos" },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: "avisos", createdAt: "fecha_creacion", updatedAt: false });

module.exports = Aviso;
