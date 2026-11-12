-- SpaTime - Indicador 5: creación de las tablas (SQLite)
-- Se ejecuta automáticamente al iniciar el backend; es seguro repetirlo.

CREATE TABLE IF NOT EXISTS clientes (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre    TEXT NOT NULL,
  telefono  TEXT NOT NULL,
  correo    TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS servicios (
  id            TEXT PRIMARY KEY,      -- masaje, facial, corporal
  nombre        TEXT NOT NULL,
  duracion_min  INTEGER NOT NULL,
  precio        INTEGER NOT NULL       -- en guaraníes
);

CREATE TABLE IF NOT EXISTS reservas (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id   INTEGER NOT NULL REFERENCES clientes (id),
  servicio_id  TEXT    NOT NULL REFERENCES servicios (id),
  fecha        TEXT    NOT NULL,       -- AAAA-MM-DD
  hora         TEXT    NOT NULL,       -- HH:MM
  estado       TEXT    NOT NULL DEFAULT 'Pendiente'
               CHECK (estado IN ('Pendiente', 'Confirmada', 'Cancelada')),
  creada_en    TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- Un servicio no puede tener dos reservas activas en la misma fecha y hora
CREATE UNIQUE INDEX IF NOT EXISTS ux_reservas_horario
  ON reservas (servicio_id, fecha, hora)
  WHERE estado <> 'Cancelada';
