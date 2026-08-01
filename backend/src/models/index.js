const sequelize = require("../config/database");
const Usuario = require("./Usuario");
const Estudiante = require("./Estudiante");
const Empresa = require("./Empresa");
const Administrador = require("./Administrador");
const Vacante = require("./Vacante");
const Postulacion = require("./Postulacion");
const Habilidad = require("./Habilidad");
const Notificacion = require("./Notificacion");
const Mensaje = require("./Mensaje");
const Examen = require("./Examen");
const ResultadoExamen = require("./ResultadoExamen");
const BitacoraAuditoria = require("./BitacoraAuditoria");
const ConfiguracionIA = require("./ConfiguracionIA");
const CatalogoUniversidad = require("./CatalogoUniversidad");
const CatalogoCarrera = require("./CatalogoCarrera");
const Aviso = require("./Aviso");
const Favorito = require("./Favorito");
const PlantillaCorreo = require("./PlantillaCorreo");

// --- Asociaciones ---
Usuario.hasOne(Estudiante, { foreignKey: "id_usuario", onDelete: "CASCADE" });
Estudiante.belongsTo(Usuario, { foreignKey: "id_usuario" });

Usuario.hasOne(Empresa, { foreignKey: "id_usuario", onDelete: "CASCADE" });
Empresa.belongsTo(Usuario, { foreignKey: "id_usuario" });

Usuario.hasOne(Administrador, { foreignKey: "id_usuario", onDelete: "CASCADE" });
Administrador.belongsTo(Usuario, { foreignKey: "id_usuario" });

Empresa.hasMany(Vacante, { foreignKey: "id_empresa", onDelete: "CASCADE" });
Vacante.belongsTo(Empresa, { foreignKey: "id_empresa" });

Estudiante.hasMany(Postulacion, { foreignKey: "id_estudiante" });
Postulacion.belongsTo(Estudiante, { foreignKey: "id_estudiante" });

Vacante.hasMany(Postulacion, { foreignKey: "id_vacante" });
Postulacion.belongsTo(Vacante, { foreignKey: "id_vacante" });

Estudiante.hasMany(Habilidad, { foreignKey: "id_estudiante", onDelete: "CASCADE" });
Habilidad.belongsTo(Estudiante, { foreignKey: "id_estudiante" });

Usuario.hasMany(Notificacion, { foreignKey: "id_usuario", onDelete: "CASCADE" });
Notificacion.belongsTo(Usuario, { foreignKey: "id_usuario" });

Postulacion.hasMany(Mensaje, { foreignKey: "id_postulacion", onDelete: "CASCADE" });
Mensaje.belongsTo(Postulacion, { foreignKey: "id_postulacion" });
Usuario.hasMany(Mensaje, { foreignKey: "id_usuario_emisor" });
Mensaje.belongsTo(Usuario, { foreignKey: "id_usuario_emisor", as: "Emisor" });

Postulacion.hasOne(Examen, { foreignKey: "id_postulacion", onDelete: "CASCADE" });
Examen.belongsTo(Postulacion, { foreignKey: "id_postulacion" });

Examen.hasOne(ResultadoExamen, { foreignKey: "id_examen", onDelete: "CASCADE" });
ResultadoExamen.belongsTo(Examen, { foreignKey: "id_examen" });

Administrador.hasMany(BitacoraAuditoria, { foreignKey: "id_admin" });
BitacoraAuditoria.belongsTo(Administrador, { foreignKey: "id_admin" });

Estudiante.hasMany(Favorito, { foreignKey: "id_estudiante", onDelete: "CASCADE" });
Favorito.belongsTo(Estudiante, { foreignKey: "id_estudiante" });
Vacante.hasMany(Favorito, { foreignKey: "id_vacante", onDelete: "CASCADE" });
Favorito.belongsTo(Vacante, { foreignKey: "id_vacante" });

module.exports = {
  sequelize, Usuario, Estudiante, Empresa, Administrador, Vacante, Postulacion,
  Habilidad, Notificacion, Mensaje, Examen, ResultadoExamen, BitacoraAuditoria,
  ConfiguracionIA, CatalogoUniversidad, CatalogoCarrera, Aviso, Favorito, PlantillaCorreo,
};
