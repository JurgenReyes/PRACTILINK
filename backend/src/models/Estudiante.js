const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Estudiante = sequelize.define("Estudiante", {
  id_estudiante: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  id_usuario: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  nombre_completo: { type: DataTypes.STRING(150), allowNull: false },
  universidad: { type: DataTypes.STRING(150) },
  carrera: { type: DataTypes.STRING(150) },
  semestre: { type: DataTypes.INTEGER },
  promedio: { type: DataTypes.DECIMAL(3, 1) },
  foto_url: { type: DataTypes.STRING(255) },
  porcentaje_perfil: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName: "estudiantes",
  createdAt: "fecha_creacion",
  updatedAt: "fecha_modificacion",
});

module.exports = Estudiante;
