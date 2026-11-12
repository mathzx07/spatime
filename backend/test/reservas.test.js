// Las pruebas usan una base de datos en memoria para no tocar la real
process.env.DB_FILE = ":memory:";

const { test, before, after, beforeEach } = require("node:test");
const assert = require("node:assert");
const app = require("../src/app");
const datos = require("../src/datos");

let servidor;
let base;

before(async () => {
  await new Promise((resolve) => {
    servidor = app.listen(0, resolve);
  });
  base = `http://localhost:${servidor.address().port}/api/reservas`;
});

after(() => servidor.close());
beforeEach(() => datos.reiniciar());

const reservaValida = {
  servicioId: "masaje",
  fecha: "2099-12-01",
  hora: "10:00",
  cliente: "Sol Perez",
  telefono: "0981555444",
  correo: "sol@example.com",
};

function post(cuerpo) {
  return fetch(base, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo),
  });
}

test("GET /api/reservas devuelve 200 y el listado", async () => {
  const res = await fetch(base);
  assert.strictEqual(res.status, 200);
  const cuerpo = await res.json();
  assert.ok(Array.isArray(cuerpo));
  assert.strictEqual(cuerpo.length, 2);
});

test("GET /api/reservas/:id devuelve 200 con la reserva", async () => {
  const res = await fetch(`${base}/1`);
  assert.strictEqual(res.status, 200);
  assert.strictEqual((await res.json()).cliente, "Clara Bogado");
});

test("GET /api/reservas/:id inexistente devuelve 404", async () => {
  const res = await fetch(`${base}/999`);
  assert.strictEqual(res.status, 404);
});

test("GET /api/reservas/:id no numérico devuelve 400", async () => {
  const res = await fetch(`${base}/abc`);
  assert.strictEqual(res.status, 400);
});

test("POST válido devuelve 201 y la reserva queda en el listado", async () => {
  const res = await post(reservaValida);
  assert.strictEqual(res.status, 201);
  const creada = await res.json();
  assert.strictEqual(creada.id, 3);
  assert.strictEqual(creada.estado, "Pendiente");

  const listado = await (await fetch(base)).json();
  assert.strictEqual(listado.length, 3);
});

test("POST sin datos obligatorios devuelve 400 con el detalle por campo", async () => {
  const res = await post({});
  assert.strictEqual(res.status, 400);
  const cuerpo = await res.json();
  for (const campo of ["servicioId", "fecha", "hora", "cliente", "telefono", "correo"]) {
    assert.ok(cuerpo.detalles[campo], `falta el detalle de ${campo}`);
  }
});

test("POST con datos inválidos devuelve 400", async () => {
  const casos = [
    { servicioId: "inexistente" },
    { fecha: "2020-01-01" },
    { fecha: "2099-02-31" },
    { fecha: "01/12/2099" },
    { hora: "03:00" },
    { cliente: "Al" },
    { telefono: "abc" },
    { correo: "correo-invalido" },
  ];
  for (const cambio of casos) {
    const res = await post({ ...reservaValida, ...cambio });
    assert.strictEqual(res.status, 400, `debería rechazar ${JSON.stringify(cambio)}`);
  }
});

test("POST con un horario ya reservado devuelve 409", async () => {
  assert.strictEqual((await post(reservaValida)).status, 201);
  assert.strictEqual((await post(reservaValida)).status, 409);
});

test("POST con JSON mal formado devuelve 400", async () => {
  const res = await fetch(base, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{esto no es json",
  });
  assert.strictEqual(res.status, 400);
});

test("Una ruta inexistente devuelve 404 en JSON", async () => {
  const res = await fetch(base.replace("/reservas", "/nada"));
  assert.strictEqual(res.status, 404);
  assert.ok((await res.json()).error);
});

test("El cliente se reutiliza si el correo ya existe", async () => {
  await post(reservaValida);
  await post({ ...reservaValida, hora: "11:00" });
  const { db } = require("../src/db");
  const { n } = db.prepare("SELECT COUNT(*) AS n FROM clientes WHERE correo = ?").get(reservaValida.correo);
  assert.strictEqual(n, 1);
});

test("GET /api/salud confirma que el servicio y la base responden", async () => {
  const res = await fetch(base.replace("/reservas", "/salud"));
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(await res.json(), { estado: "ok", baseDeDatos: "ok" });
});
