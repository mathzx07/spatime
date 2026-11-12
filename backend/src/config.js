// Configuración por entorno.
// Carga backend/.env si existe; las variables ya definidas en el sistema (por ejemplo, en el
// servicio de despliegue) tienen prioridad sobre el archivo.

const path = require("path");

try {
  process.loadEnvFile(path.join(__dirname, "..", ".env"));
} catch {
  // No hay archivo .env: se usan los valores por defecto
}

module.exports = {
  PUERTO: process.env.PORT || 3000,
  // Orígenes permitidos por CORS, separados por comas. Vacío = cualquier origen.
  CORS_ORIGIN: (process.env.CORS_ORIGIN || "").split(",").map((o) => o.trim()).filter(Boolean),
};
