const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Administrador = sequelize.define("Administrador", {
  id_admin: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  id_usuario: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  nombre_completo: { type: DataTypes.STRING(150), allowNull: false },
  nivel_permiso: { type: DataTypes.ENUM("superadministrador", "soporte", "moderador"), defaultValue: "soporte" },
}, {
  tableName: "administradores",
  createdAt: "fecha_creacion",
  updatedAt: false,
});

module.exports = Administrador;
