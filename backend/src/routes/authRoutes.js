const router = require("express").Router();
const auth = require("../controllers/authController");

router.post("/registro", auth.registro);
router.post("/verificar-correo", auth.verificarCorreo);
router.post("/login", auth.login);
router.post("/recuperar-password", auth.solicitarRecuperacion);
router.post("/restablecer-password", auth.restablecerPassword);

module.exports = router;
