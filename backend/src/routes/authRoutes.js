const { wrapRouter } = require("../middleware/asyncHandler");
const router = wrapRouter(require("express").Router());
const auth = require("../controllers/authController");
const { requiereAutenticacion } = require("../middleware/auth");

router.post("/registro", auth.registro);
router.post("/verificar-correo", auth.verificarCorreo);
router.post("/login", auth.login);
router.post("/verificar-2fa", auth.verificar2FA);
router.post("/recuperar-password", auth.solicitarRecuperacion);
router.post("/restablecer-password", auth.restablecerPassword);
router.put("/cambiar-password", requiereAutenticacion, auth.cambiarPassword);

module.exports = router;
