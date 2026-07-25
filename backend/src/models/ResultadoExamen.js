const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ResultadoExamen = sequelize.define("ResultadoExamen", {
  id_resultado: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  id_examen: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  puntaje_global: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
  fortalezas: { type: DataTypes.TEXT },
  areas_mejora: { type: DataTypes.TEXT },
  nivel_compatibilidad: { type: DataTypes.STRING(50) },
}, {
  tableName: "resultados_examen",
  createdAt: "fecha_creacion",
  updatedAt: false,
});

module.exports = ResultadoExamen;
