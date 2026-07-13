const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Usuario = sequelize.define("Usuario", {
  id_usuario: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  correo: { type: DataTypes.STRING(150), allowNull: false, unique: true, validate: { isEmail: true } },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  rol: { type: DataTypes.ENUM("estudiante", "empresa", "administrador"), allowNull: false },
  correo_verificado: { type: DataTypes.BOOLEAN, defaultValue: false },
  estatus: { type: DataTypes.ENUM("activo", "suspendido", "eliminado"), defaultValue: "activo" },
  intentos_fallidos: { type: DataTypes.INTEGER, defaultValue: 0 },
  bloqueado_hasta: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: "usuarios",
  createdAt: "fecha_creacion",
  updatedAt: "fecha_modificacion",
});

module.exports = Usuario;
