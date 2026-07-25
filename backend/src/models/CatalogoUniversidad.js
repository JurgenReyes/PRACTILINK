const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CatalogoUniversidad = sequelize.define("CatalogoUniversidad", {
  id_universidad: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nombre: { type: DataTypes.STRING(150), allowNull: false, unique: true },
}, { tableName: "catalogo_universidades", timestamps: false });

module.exports = CatalogoUniversidad;
