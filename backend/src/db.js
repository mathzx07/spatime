// Conexión a la base de datos SQLite (módulo integrado de Node, sin dependencias extra).
// SQLite guarda todo en un archivo: no usa usuario ni contraseña.

require("./config");
const fs = require("fs");
const path = require("path");

let DatabaseSync;
try {
  ({ DatabaseSync } = require("node:sqlite"));
} catch {
  console.error("Se necesita Node.js 22.13 o superior (versión actual: " + process.version + ").");
  process.exit(1);
}

// Ruta del archivo; se puede cambiar con la variable DB_FILE (":memory:" para pruebas)
const RUTA = process.env.DB_FILE || path.join(__dirname, "..", "data", "spatime.db");
const leerSql = (nombre) => fs.readFileSync(path.join(__dirname, "..", "db", nombre), "utf8");

if (RUTA !== ":memory:") fs.mkdirSync(path.dirname(RUTA), { recursive: true });

const db = new DatabaseSync(RUTA);
db.exec("PRAGMA foreign_keys = ON");

// Crea las tablas y, si la base es nueva, carga los datos iniciales
function inicializar() {
  db.exec(leerSql("schema.sql"));
  const { n } = db.prepare("SELECT COUNT(*) AS n FROM servicios").get();
  if (n === 0) db.exec(leerSql("seed.sql"));
}

// Borra todo y vuelve a los datos iniciales (se usa en las pruebas y en npm run reiniciar-bd)
function reiniciar() {
  db.exec("DROP TABLE IF EXISTS reservas; DROP TABLE IF EXISTS clientes; DROP TABLE IF EXISTS servicios;");
  inicializar();
}

inicializar();

module.exports = { db, RUTA, reiniciar };
