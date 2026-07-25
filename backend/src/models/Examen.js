const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Examen = sequelize.define("Examen", {
  id_examen: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  id_postulacion: { type: DataTypes.INTEGER, allowNull: false },
  tipo: { type: DataTypes.ENUM("tecnico", "no_tecnico"), allowNull: false },
  tiempo_limite_min: { type: DataTypes.INTEGER, defaultValue: 30 },
  finalizado: { type: DataTypes.BOOLEAN, defaultValue: false },
  preguntas_json: { type: DataTypes.JSON, allowNull: false }, // reactivos generados por IA
  respuestas_json: { type: DataTypes.JSON, allowNull: true }, // respuestas del estudiante
}, {
  tableName: "examenes",
  createdAt: "fecha_creacion",
  updatedAt: false,
});

module.exports = Examen;
