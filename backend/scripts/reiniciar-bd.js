// Vuelve la base a los datos iniciales. Detener el servidor antes de ejecutarlo.
const { reiniciar, RUTA } = require("../src/db");

reiniciar();
console.log("Base de datos reiniciada con los datos iniciales:", RUTA);
