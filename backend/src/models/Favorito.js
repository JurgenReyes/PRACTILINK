const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Favorito = sequelize.define("Favorito", {
  id_favorito: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  id_estudiante: { type: DataTypes.INTEGER, allowNull: false },
  id_vacante: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: "favoritos",
  createdAt: "fecha_creacion",
  updatedAt: false,
  indexes: [{ unique: true, fields: ["id_estudiante", "id_vacante"] }],
});

module.exports = Favorito;
