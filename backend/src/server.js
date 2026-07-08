require("dotenv").config();
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

const app = express();

app.use(helmet()); // RNF-16: cabeceras de seguridad básicas
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json({ limit: "1mb" }));

// RF-E07 / protección general: limita intentos de login para mitigar fuerza bruta
const limitadorLogin = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use("/api/auth/login", limitadorLogin);

app.get("/api/salud", (req, res) => res.json({ estatus: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/estudiantes", estudianteRoutes);
app.use("/api/vacantes", vacanteRoutes);
app.use("/api/postulaciones", postulacionRoutes);
app.use("/api/admin", adminRoutes);

// Manejador de errores centralizado
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});

const PORT = process.env.PORT || 4000;

async function iniciar() {
  try {
    await sequelize.authenticate();
    console.log("Conexión a MySQL establecida.");
    // En desarrollo, sincroniza modelos; en producción usar migraciones controladas.
    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ alter: true });
    }
    app.listen(PORT, () => console.log(`API PractiLink escuchando en el puerto ${PORT}`));
  } catch (err) {
    console.error("No se pudo iniciar el servidor:", err);
    process.exit(1);
  }
}

iniciar();
