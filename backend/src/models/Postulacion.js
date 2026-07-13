const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Postulacion = sequelize.define("Postulacion", {
  id_postulacion: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  id_estudiante: { type: DataTypes.INTEGER, allowNull: false },
  id_vacante: { type: DataTypes.INTEGER, allowNull: false },
  estatus: {
    type: DataTypes.ENUM("en_revision", "evaluacion_pendiente", "entrevista_programada", "aceptado", "rechazado"),
    defaultValue: "en_revision",
  },
  matching_score: { type: DataTypes.DECIMAL(5, 2) },
}, {
  tableName: "postulaciones",
  createdAt: "fecha_postulacion",
  updatedAt: "fecha_modificacion",
  indexes: [{ unique: true, fields: ["id_estudiante", "id_vacante"] }],
});

module.exports = Postulacion;
