const { PUERTO } = require("./config");
const app = require("./app");

app.listen(PUERTO, () => {
  console.log(`SpaTime backend escuchando en http://localhost:${PUERTO}`);
  console.log(`API: http://localhost:${PUERTO}/api/reservas`);
});
