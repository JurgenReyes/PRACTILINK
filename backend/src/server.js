require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const { sequelize } = require("./models");
const authRoutes = require("./routes/authRoutes");
const estudianteRoutes = require("./routes/estudianteRoutes");
const vacanteRoutes = require("./routes/vacanteRoutes");
const postulacionRoutes = require("./routes/postulacionRoutes");
const adminRoutes = require("./routes/adminRoutes");
const empresaPanelRoutes = require("./routes/empresaPanelRoutes");
const examenRoutes = require("./routes/examenRoutes");
const mensajeRoutes = require("./routes/mensajeRoutes");
const notificacionRoutes = require("./routes/notificacionRoutes");
const favoritoRoutes = require("./routes/favoritoRoutes");
const publicoRoutes = require("./routes/publicoRoutes");

const app = express();

// Red de seguridad: registra errores fuera del ciclo petición/respuesta de
// Express (ej. una promesa suelta en un setInterval) sin tumbar el proceso.
// Los errores dentro de rutas ya se capturan por routes/*.js (wrapRouter).
process.on("unhandledRejection", (err) => console.error("Unhandled rejection:", err));

app.use(helmet()); // RNF-16: cabeceras de seguridad básicas

// CORS: en desarrollo se acepta cualquier puerto de localhost (Vite puede cambiar
// de puerto si el 5173 está ocupado), para evitar bloqueos por desajuste de puerto.
// En producción, restringe esto a la URL real del frontend (FRONTEND_URL).
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // peticiones sin origin (ej. Postman)
    if (process.env.NODE_ENV === "development" && /^http:\/\/localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }
    if (origin === process.env.FRONTEND_URL) return callback(null, true);
    return callback(new Error("Origen no permitido por política CORS"));
  },
}));
app.use(express.json({ limit: "1mb" }));

// Fotos de perfil guardadas localmente (ver estudianteRoutes.js /foto). Se
// sirven con Cross-Origin-Resource-Policy explícito porque el frontend corre
// en otro puerto (Vite) y, sin este header, algunos navegadores bloquean la
// carga de la imagen aunque CORS ya la permita para peticiones normales.
app.use("/uploads", express.static(path.join(__dirname, "../uploads"), {
  setHeaders: (res) => res.setHeader("Cross-Origin-Resource-Policy", "cross-origin"),
}));

// RF-E07 / protección general: limita intentos de login para mitigar fuerza bruta
const limitadorLogin = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use("/api/auth/login", limitadorLogin);

app.get("/api/salud", (req, res) => res.json({ estatus: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/estudiantes", estudianteRoutes);
app.use("/api/vacantes", vacanteRoutes);
app.use("/api/postulaciones", postulacionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/empresa", empresaPanelRoutes);
app.use("/api/examenes", examenRoutes);
app.use("/api/mensajes", mensajeRoutes);
app.use("/api/notificaciones", notificacionRoutes);
app.use("/api/favoritos", favoritoRoutes);
app.use("/api/publico", publicoRoutes);

// Manejador de errores centralizado
app.use((err, req, res, next) => {
  console.error(err);
  // NOTA TEMPORAL DE DIAGNÓSTICO: se incluye el detalle del error en la
  // respuesta para poder depurar desde el navegador sin acceso a la consola
  // del backend. Quitar antes de pasar a producción.
  res.status(500).json({ error: "Error interno del servidor", detalle: err.message, stack: err.stack });
});

const PORT = process.env.PORT || 4000;

async function iniciar() {
  try {
    await sequelize.authenticate();
    console.log("Conexión a MySQL establecida.");
    // La estructura de la base de datos vive únicamente en database/schema.sql.
    // No se usa sequelize.sync() para evitar que se desalinee el esquema real.
    app.listen(PORT, () => console.log(`API PractiLink escuchando en el puerto ${PORT}`));
  } catch (err) {
    console.error("No se pudo iniciar el servidor:", err);
    process.exit(1);
  }
}

iniciar();
