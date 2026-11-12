// Muestra las sentencias con las que se crearon las tablas (evidencia de creación)
const { db, RUTA } = require("../src/db");

console.log("Base de datos:", RUTA, "\n");
const objetos = db
  .prepare("SELECT type, name, sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' AND sql IS NOT NULL ORDER BY type DESC, name")
  .all();
for (const o of objetos) console.log(`-- ${o.type}: ${o.name}\n${o.sql};\n`);
