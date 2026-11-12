const { servicioExiste, HORARIOS_VALIDOS } = require("./datos");

function dosDigitos(n) {
  return String(n).padStart(2, "0");
}

function fechaDeHoy() {
  const d = new Date();
  return `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}-${dosDigitos(d.getDate())}`;
}

// Comprueba que sea AAAA-MM-DD y una fecha real del calendario
function esFechaReal(texto) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const [anio, mes, dia] = texto.split("-").map(Number);
  const d = new Date(anio, mes - 1, dia);
  return d.getFullYear() === anio && d.getMonth() === mes - 1 && d.getDate() === dia;
}

// Devuelve un objeto { campo: mensaje }; vacío si los datos son válidos
function validarReserva(datos) {
  const errores = {};
  const { servicioId, fecha, hora, cliente, telefono, correo } = datos || {};

  if (!servicioId) errores.servicioId = "El servicio es obligatorio.";
  else if (!servicioExiste(servicioId)) errores.servicioId = "El servicio no existe.";

  if (!fecha) errores.fecha = "La fecha es obligatoria.";
  else if (!esFechaReal(fecha)) errores.fecha = "La fecha debe tener el formato AAAA-MM-DD.";
  else if (fecha < fechaDeHoy()) errores.fecha = "La fecha no puede ser anterior a hoy.";

  if (!hora) errores.hora = "El horario es obligatorio.";
  else if (!HORARIOS_VALIDOS.includes(hora)) errores.hora = "El horario no está disponible.";

  if (!cliente || String(cliente).trim().length < 3) {
    errores.cliente = "El nombre es obligatorio (mínimo 3 caracteres).";
  }

  if (!telefono) errores.telefono = "El teléfono es obligatorio.";
  else if (!/^[0-9+ -]{6,}$/.test(telefono)) errores.telefono = "El teléfono solo puede tener números (mínimo 6 dígitos).";

  if (!correo) errores.correo = "El correo es obligatorio.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) errores.correo = "El formato del correo no es válido.";

  return errores;
}

module.exports = { validarReserva };
