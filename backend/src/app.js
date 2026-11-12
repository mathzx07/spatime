const path = require("path");
const express = require("express");
const cors = require("cors");
const { CORS_ORIGIN } = require("./config");
const { db } = require("./db");
const reservasRouter = require("./routes/reservas");

const app = express();

app.use(cors(CORS_ORIGIN.length ? { origin: CORS_ORIGIN } : {}));
app.use(express.json());

// Registro simple de cada solicitud (útil para la demo)
app.use((req, res, next) => {
  res.on("finish", () => console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode}`));
  next();
});

// Verificación del servicio y de la conexión con la base de datos
app.get("/api/salud", (req, res) => {
  try {
    db.prepare("SELECT 1").get();
    res.json({ estado: "ok", baseDeDatos: "ok" });
  } catch {
    res.status(503).json({ estado: "error", baseDeDatos: "sin conexión" });
  }
});

app.use("/api/reservas", reservasRouter);

// El mismo servidor entrega el frontend, así se abre en http://localhost:3000
app.use(express.static(path.join(__dirname, "..", "..", "frontend")));

// Ruta inexistente
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada." });
});

// Errores generales (por ejemplo, JSON mal formado en el body)
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "El cuerpo de la solicitud no es un JSON válido." });
  }
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor." });
});

module.exports = app;
