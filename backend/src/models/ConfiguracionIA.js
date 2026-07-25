const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ConfiguracionIA = sequelize.define("ConfiguracionIA", {
  clave: { type: DataTypes.STRING(100), primaryKey: true },
  valor: { type: DataTypes.STRING(255), allowNull: false },
  descripcion: { type: DataTypes.STRING(255) },
}, {
  tableName: "configuracion_ia",
  timestamps: false,
});

module.exports = ConfiguracionIA;
