const express = require("express");
const datos = require("../datos");
const { validarReserva } = require("../validacion");

const router = express.Router();

// GET /api/reservas -> listado completo
router.get("/", (req, res) => {
  res.status(200).json(datos.listar());
});

// GET /api/reservas/:id -> una reserva
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "El id debe ser un número entero." });
  }
  const reserva = datos.buscarPorId(id);
  if (!reserva) {
    return res.status(404).json({ error: "No existe una reserva con ese id." });
  }
  res.status(200).json(reserva);
});

// POST /api/reservas -> crea una reserva
router.post("/", (req, res) => {
  const errores = validarReserva(req.body);
  if (Object.keys(errores).length > 0) {
    return res.status(400).json({ error: "Datos inválidos.", detalles: errores });
  }

  const { servicioId, fecha, hora, cliente, telefono, correo } = req.body;

  if (datos.existeReservaEnHorario(servicioId, fecha, hora)) {
    return res.status(409).json({ error: "Ese horario ya está reservado para el servicio elegido." });
  }

  try {
    const nueva = datos.crear({ servicioId, fecha, hora, cliente: cliente.trim(), telefono, correo });
    res.status(201).json(nueva);
  } catch (error) {
    // La base también impide duplicados (índice único): se responde igual que arriba
    if (error.errcode === 2067) {
      return res.status(409).json({ error: "Ese horario ya está reservado para el servicio elegido." });
    }
    throw error;
  }
});

module.exports = router;
