// Prueba de persistencia: se guarda una reserva, se reinicia el servidor y el dato sigue ahí.
const { test } = require("node:test");
const assert = require("node:assert");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const PUERTO = 3917;
const BASE = `http://localhost:${PUERTO}/api/reservas`;

function iniciarServidor(archivoBd) {
  return new Promise((resolve, reject) => {
    const proceso = spawn(process.execPath, ["--disable-warning=ExperimentalWarning", "src/server.js"], {
      cwd: path.join(__dirname, ".."),
      env: { ...process.env, PORT: String(PUERTO), DB_FILE: archivoBd },
    });
    proceso.stdout.on("data", (d) => String(d).includes("escuchando") && resolve(proceso));
    proceso.on("error", reject);
  });
}

function detenerServidor(proceso) {
  return new Promise((resolve) => {
    proceso.on("exit", resolve);
    proceso.kill();
  });
}

test("La reserva guardada sigue disponible después de reiniciar el servidor", async () => {
  const carpeta = fs.mkdtempSync(path.join(os.tmpdir(), "spatime-"));
  const archivoBd = path.join(carpeta, "prueba.db");
  const reserva = {
    servicioId: "facial",
    fecha: "2099-01-10",
    hora: "09:00",
    cliente: "Lia Gimenez",
    telefono: "0982000111",
    correo: "lia@example.com",
  };

  let servidor = await iniciarServidor(archivoBd);
  try {
    const res = await fetch(BASE, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(reserva) });
    assert.strictEqual(res.status, 201);
    const creada = await res.json();
    await detenerServidor(servidor);

    servidor = await iniciarServidor(archivoBd);
    const listado = await (await fetch(BASE)).json();
    const encontrada = listado.find((r) => r.id === creada.id);
    assert.ok(encontrada, "la reserva debería seguir en la base");
    assert.strictEqual(encontrada.cliente, "Lia Gimenez");
    assert.strictEqual(listado.length, 3);
  } finally {
    await detenerServidor(servidor);
    fs.rmSync(carpeta, { recursive: true, force: true });
  }
});
