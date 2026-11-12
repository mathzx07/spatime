// Muestra el contenido de las tablas (evidencia de los datos almacenados)
const { db, RUTA } = require("../src/db");

console.log("Base de datos:", RUTA);
for (const tabla of ["clientes", "servicios", "reservas"]) {
  const filas = db.prepare(`SELECT * FROM ${tabla}`).all().map((f) => ({ ...f }));
  console.log(`\n== ${tabla} (${filas.length} filas) ==`);
  console.table(filas);
}
