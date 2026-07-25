const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Habilidad = sequelize.define("Habilidad", {
  id_habilidad: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  id_estudiante: { type: DataTypes.INTEGER, allowNull: false },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  tipo: { type: DataTypes.ENUM("tecnica", "software", "certificacion", "idioma"), allowNull: false },
  nivel: { type: DataTypes.STRING(50) },
  institucion: { type: DataTypes.STRING(150) },
  fecha: { type: DataTypes.DATEONLY },
}, {
  tableName: "habilidades",
  timestamps: false,
});

module.exports = Habilidad;
