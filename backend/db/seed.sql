-- Datos iniciales: se cargan solo la primera vez que se crea la base.

INSERT INTO servicios (id, nombre, duracion_min, precio) VALUES
  ('masaje',   'Masaje relajante',      60, 150000),
  ('facial',   'Limpieza facial',       45, 120000),
  ('corporal', 'Tratamiento corporal',  75, 180000);

INSERT INTO clientes (nombre, telefono, correo) VALUES
  ('Clara Bogado', '0981123456', 'clara@example.com'),
  ('Ana Bogarin',  '0981987654', 'ana@example.com');

INSERT INTO reservas (cliente_id, servicio_id, fecha, hora, estado) VALUES
  (1, 'masaje', '2026-08-20', '10:00', 'Confirmada'),
  (2, 'facial', '2026-08-20', '12:00', 'Pendiente');
