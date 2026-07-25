const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CatalogoCarrera = sequelize.define("CatalogoCarrera", {
  id_carrera: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nombre: { type: DataTypes.STRING(150), allowNull: false, unique: true },
}, { tableName: "catalogo_carreras", timestamps: false });

module.exports = CatalogoCarrera;
