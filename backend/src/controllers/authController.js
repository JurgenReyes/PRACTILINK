const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Usuario, Estudiante, Empresa } = require("../models");
const { enviarCorreo } = require("../services/aws/ses");

const MAX_INTENTOS = 5;
const MINUTOS_BLOQUEO = 15;

function validarPassword(pw) {
  // RF-E08: mínimo 8 caracteres, mayúscula, número y carácter especial.
  return /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(pw);
}

async function registro(req, res) {
  try {
    const { correo, password, rol } = req.body;

    if (!validarPassword(password)) {
      return res.status(400).json({
        error: "La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial.",
      });
    }
    if (!["estudiante", "empresa"].includes(rol)) {
      return res.status(400).json({ error: "Rol inválido para autorregistro" });
    }

    const existente = await Usuario.findOne({ where: { correo } });
    if (existente) return res.status(409).json({ error: "El correo ya está registrado" });

    const password_hash = await bcrypt.hash(password, 10); // RNF-12: bcrypt
    const usuario = await Usuario.create({ correo, password_hash, rol });

    if (rol === "estudiante") {
      const { nombre_completo, universidad, carrera, semestre } = req.body;
      await Estudiante.create({ id_usuario: usuario.id_usuario, nombre_completo, universidad, carrera, semestre });
    } else {
      const { nombre_empresa, rfc, giro, responsable, telefono } = req.body;
      await Empresa.create({ id_usuario: usuario.id_usuario, nombre_empresa, rfc, giro, responsable, telefono });
    }

    // RF-E03: correo de verificación (token válido 24h, firmado con JWT para no requerir tabla extra en el prototipo)
    const tokenVerificacion = jwt.sign({ id_usuario: usuario.id_usuario }, process.env.JWT_SECRET, { expiresIn: "24h" });
    await enviarCorreo({
      para: correo,
      asunto: "Verifica tu cuenta en PractiLink",
      texto: `Confirma tu cuenta con este enlace: ${process.env.FRONTEND_URL}/verificar?token=${tokenVerificacion}`,
    });

    return res.status(201).json({ mensaje: "Registro exitoso. Revisa tu correo para verificar tu cuenta." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error al registrar el usuario" });
  }
}

async function verificarCorreo(req, res) {
  try {
    const { token } = req.body;
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    await Usuario.update({ correo_verificado: true }, { where: { id_usuario: payload.id_usuario } });
    return res.json({ mensaje: "Correo verificado correctamente" });
  } catch (err) {
    return res.status(400).json({ error: "Token inválido o expirado" });
  }
}

async function login(req, res) {
  try {
    const { correo, password } = req.body;
    const usuario = await Usuario.findOne({ where: { correo } });
    if (!usuario) return res.status(401).json({ error: "Credenciales inválidas" });

    // RF-E07: bloqueo temporal tras 5 intentos fallidos
    if (usuario.bloqueado_hasta && new Date(usuario.bloqueado_hasta) > new Date()) {
      return res.status(423).json({ error: "Cuenta bloqueada temporalmente. Intenta más tarde." });
    }

    const passwordOk = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordOk) {
      usuario.intentos_fallidos += 1;
      if (usuario.intentos_fallidos >= MAX_INTENTOS) {
        usuario.bloqueado_hasta = new Date(Date.now() + MINUTOS_BLOQUEO * 60000);
        usuario.intentos_fallidos = 0;
      }
      await usuario.save();
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    if (!usuario.correo_verificado) {
      return res.status(403).json({ error: "Debes verificar tu correo antes de iniciar sesión" });
    }

    usuario.intentos_fallidos = 0;
    usuario.bloqueado_hasta = null;
    await usuario.save();

    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
    );

    return res.json({ token, rol: usuario.rol });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error al iniciar sesión" });
  }
}

async function solicitarRecuperacion(req, res) {
  const { correo } = req.body;
  const usuario = await Usuario.findOne({ where: { correo } });
  if (!usuario) return res.json({ mensaje: "Si el correo existe, se enviará un enlace de recuperación." });

  // RF-E06: token de un solo uso, vigencia máxima de 1 hora
  const token = jwt.sign({ id_usuario: usuario.id_usuario, uso: "recuperacion" }, process.env.JWT_SECRET, { expiresIn: "1h" });
  await enviarCorreo({
    para: correo,
    asunto: "Recupera tu contraseña - PractiLink",
    texto: `Restablece tu contraseña aquí: ${process.env.FRONTEND_URL}/restablecer?token=${token}`,
  });
  return res.json({ mensaje: "Si el correo existe, se enviará un enlace de recuperación." });
}

async function restablecerPassword(req, res) {
  try {
    const { token, nuevaPassword } = req.body;
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.uso !== "recuperacion") throw new Error("token inválido");
    if (!validarPassword(nuevaPassword)) {
      return res.status(400).json({ error: "La contraseña no cumple los requisitos de seguridad" });
    }
    const password_hash = await bcrypt.hash(nuevaPassword, 10);
    await Usuario.update({ password_hash }, { where: { id_usuario: payload.id_usuario } });
    return res.json({ mensaje: "Contraseña actualizada correctamente" });
  } catch (err) {
    return res.status(400).json({ error: "Token inválido o expirado" });
  }
}

module.exports = { registro, verificarCorreo, login, solicitarRecuperacion, restablecerPassword };
