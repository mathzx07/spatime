// URL base de la API. Es lo único que hay que tocar si el backend está en otra dirección.
// - Servido por el backend (local o desplegado): misma dirección, ruta "/api".
// - Abierto como archivo (index.html con doble clic): backend local en el puerto 3000.
window.SPATIME_API_URL = location.protocol === "file:" ? "http://localhost:3000/api" : "/api";
