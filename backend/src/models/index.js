const sequelize = require("../config/database");
const Usuario = require("./Usuario");
const Estudiante = require("./Estudiante");
const Empresa = require("./Empresa");
const Vacante = require("./Vacante");
const Postulacion = require("./Postulacion");

// --- Asociaciones ---
Usuario.hasOne(Estudiante, { foreignKey: "id_usuario", onDelete: "CASCADE" });
Estudiante.belongsTo(Usuario, { foreignKey: "id_usuario" });

Usuario.hasOne(Empresa, { foreignKey: "id_usuario", onDelete: "CASCADE" });
Empresa.belongsTo(Usuario, { foreignKey: "id_usuario" });

Empresa.hasMany(Vacante, { foreignKey: "id_empresa", onDelete: "CASCADE" });
Vacante.belongsTo(Empresa, { foreignKey: "id_empresa" });

Estudiante.hasMany(Postulacion, { foreignKey: "id_estudiante" });
Postulacion.belongsTo(Estudiante, { foreignKey: "id_estudiante" });

Vacante.hasMany(Postulacion, { foreignKey: "id_vacante" });
Postulacion.belongsTo(Vacante, { foreignKey: "id_vacante" });

module.exports = { sequelize, Usuario, Estudiante, Empresa, Vacante, Postulacion };
