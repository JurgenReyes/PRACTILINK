const { wrapRouter } = require("../middleware/asyncHandler");
const router = wrapRouter(require("express").Router());
const { requiereAutenticacion, requiereRol } = require("../middleware/auth");
const admin = require("../controllers/adminController");

router.use(requiereAutenticacion, requiereRol("administrador"));

// RF-A01 a RF-A05: usuarios
router.get("/usuarios", admin.listarUsuarios);
router.get("/usuarios/:id", admin.detalleUsuario);
router.put("/usuarios/:id/estatus", admin.cambiarEstatusUsuario);
router.delete("/usuarios/:id", admin.eliminarUsuario);
router.post("/usuarios/:id/restablecer-password", admin.restablecerPasswordUsuario);

// RF-A06 a RF-A08: validación de empresas y bitácora
router.get("/empresas/pendientes", admin.empresasPendientes);
router.put("/empresas/:id/validar", admin.validarEmpresa);
router.get("/bitacora", admin.verBitacora);

// RF-A09 a RF-A11: moderación de vacantes
router.get("/vacantes", admin.todasLasVacantes);
router.put("/vacantes/:id/dar-de-baja", admin.darDeBajaVacante);

// RF-A12/RF-A13: IA
router.get("/configuracion-ia", admin.verConfiguracionIA);
router.put("/configuracion-ia", admin.actualizarConfiguracionIA);
router.get("/examenes", admin.historialExamenes);

// RF-A15/RF-A16/RF-A17: reportes y dashboard
router.get("/dashboard", admin.dashboardGlobal);
router.get("/reportes/usuarios.csv", admin.exportarUsuariosCSV);

// RF-A18: catálogos (tipo: universidades | carreras)
router.get("/catalogos/:tipo", admin.listarCatalogo);
router.post("/catalogos/:tipo", admin.agregarCatalogo);
router.delete("/catalogos/:tipo/:id", admin.eliminarCatalogo);

// RF-A20: subadministradores
router.get("/administradores", admin.listarAdministradores);
router.post("/administradores", admin.crearAdministrador);

// RF-A22: avisos
router.get("/avisos", admin.listarAvisos);
router.post("/avisos", admin.crearAviso);

module.exports = router;
