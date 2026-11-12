// Acceso a datos con SQL directo sobre SQLite.

const { db, reiniciar } = require("./db");

const HORARIOS_VALIDOS = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

// Las reservas se devuelven con el mismo formato JSON que en el Indicador 4
const SELECT_RESERVA = `
  SELECT r.id, r.servicio_id AS servicioId, r.fecha, r.hora,
         c.nombre AS cliente, c.telefono, c.correo, r.estado
  FROM reservas r
  JOIN clientes c ON c.id = r.cliente_id`;

function listar() {
  return db.prepare(`${SELECT_RESERVA} ORDER BY r.id`).all();
}

function buscarPorId(id) {
  return db.prepare(`${SELECT_RESERVA} WHERE r.id = ?`).get(id);
}

function servicioExiste(id) {
  return db.prepare("SELECT 1 FROM servicios WHERE id = ?").get(id) !== undefined;
}

function existeReservaEnHorario(servicioId, fecha, hora) {
  const fila = db
    .prepare("SELECT 1 FROM reservas WHERE servicio_id = ? AND fecha = ? AND hora = ? AND estado <> 'Cancelada'")
    .get(servicioId, fecha, hora);
  return fila !== undefined;
}

// Guarda el cliente (si ya existe su correo, actualiza sus datos) y la reserva, en una sola transacción
function crear({ servicioId, fecha, hora, cliente, telefono, correo }) {
  db.exec("BEGIN");
  try {
    const { id: clienteId } = db
      .prepare(
        `INSERT INTO clientes (nombre, telefono, correo) VALUES (?, ?, ?)
         ON CONFLICT (correo) DO UPDATE SET nombre = excluded.nombre, telefono = excluded.telefono
         RETURNING id`
      )
      .get(cliente, telefono, correo);
    const { lastInsertRowid } = db
      .prepare("INSERT INTO reservas (cliente_id, servicio_id, fecha, hora) VALUES (?, ?, ?, ?)")
      .run(clienteId, servicioId, fecha, hora);
    db.exec("COMMIT");
    return buscarPorId(Number(lastInsertRowid));
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

module.exports = { HORARIOS_VALIDOS, listar, buscarPorId, servicioExiste, existeReservaEnHorario, crear, reiniciar };
