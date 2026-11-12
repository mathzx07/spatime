# SpaTime — Reservas de spa

Aplicación web para reservar servicios de un spa. Proyecto final de **Desarrollo de Aplicaciones Web** (Ingeniería Informática, Universidad Americana).

**Integrantes:** Cielo Bael, Axel Gonzalez, Osvaldo Rodriguez, José Gomez, Nahuel Villaroel.

| | |
|---|---|
| Repositorio | https://github.com/mathzx07/spatime |
| Aplicación publicada | https://spatime.onrender.com |
| API publicada | https://spatime.onrender.com/api/reservas |
| Estado del servicio | https://spatime.onrender.com/api/salud |

## Propósito

Permitir que un cliente consulte los servicios del spa, registre una reserva eligiendo servicio, fecha y horario, y vea sus reservas. Un panel administrativo muestra las reservas registradas. Las reservas se guardan de forma permanente en una base de datos.

## Tecnologías

| Parte | Tecnología |
|---|---|
| Frontend | React 18 (cargado desde archivos locales en `frontend/vendor`, sin paso de compilación), HTML y CSS |
| Backend | Node.js 22 + Express 5 (API REST en JSON) |
| Base de datos | SQLite, con el módulo `node:sqlite` incluido en Node (sin dependencias extra) |
| Pruebas | `node:test` (13 pruebas automáticas) |
| Despliegue | Render (un solo servicio web: API + frontend) |

## Estructura del repositorio

```
.
├── backend/
│   ├── src/
│   │   ├── server.js            # Inicia el servidor
│   │   ├── app.js               # Express: CORS, rutas, frontend estático y errores
│   │   ├── config.js            # Variables de entorno (.env)
│   │   ├── db.js                # Conexión a SQLite y creación de tablas
│   │   ├── datos.js             # Consultas SQL
│   │   ├── validacion.js        # Reglas de validación de reservas
│   │   └── routes/reservas.js   # Endpoints de /api/reservas
│   ├── db/
│   │   ├── schema.sql           # Tablas, claves e índices
│   │   └── seed.sql             # Datos iniciales
│   ├── scripts/                 # ver-esquema, ver-datos, reiniciar-bd
│   ├── test/                    # Pruebas automáticas
│   ├── .env.example             # Variables de entorno documentadas
│   └── package.json
├── frontend/
│   ├── index.html               # Aplicación React
│   ├── config.js                # URL de la API
│   └── vendor/                  # React y Babel (archivos locales)
├── docs/                        # Diagramas (modelo de datos y arquitectura)
├── render.yaml                  # Configuración del despliegue en Render
└── README.md
```

## Requisitos previos

- **Node.js 22.13 o superior** (se comprueba con `node -v`). Descarga: <https://nodejs.org> (versión LTS).
- No hace falta instalar ningún motor de base de datos: SQLite viene incluido.

## Instalación y arranque (local)

Abrir una terminal en la carpeta `backend` y ejecutar:

```bash
npm install
npm start
```

Cuando aparezca `SpaTime backend escuchando en http://localhost:3000`, abrir <http://localhost:3000> en el navegador. El mismo servidor entrega el frontend y la API.

> En Windows PowerShell, si aparece un error de "ejecución de scripts deshabilitada", ejecutar una vez
> `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`, o usar `cmd` en lugar de PowerShell.

## Variables de entorno

Son opcionales para uso local. Se documentan en [`backend/.env.example`](backend/.env.example); para usarlas, copiarlo como `backend/.env`.

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `PORT` | Puerto del servidor | `3000` |
| `DB_FILE` | Archivo de la base SQLite (`:memory:` para una base temporal) | `backend/data/spatime.db` |
| `CORS_ORIGIN` | Orígenes permitidos por CORS, separados por comas | vacío (cualquier origen) |
| `NODE_VERSION` | Solo en Render: versión de Node | `22.22.0` (definida en `render.yaml`) |

El proyecto **no usa contraseñas, tokens ni claves**: SQLite no tiene usuario ni contraseña. El archivo `.env` y la carpeta `backend/data` están excluidos del repositorio.

## Base de datos

La base se prepara sola al iniciar el backend: crea las tablas con `backend/db/schema.sql` y, si la base es nueva, carga los datos iniciales de `backend/db/seed.sql` (3 servicios, 2 clientes y 2 reservas de ejemplo).

Modelo: `clientes` 1—N `reservas` N—1 `servicios` (ver `docs/modelo_datos.png`).

Comandos útiles (en `backend`):

```bash
npm run ver-esquema    # muestra los CREATE TABLE de la base
npm run ver-datos      # muestra el contenido de las tablas
npm run reiniciar-bd   # vuelve a los datos iniciales (detener el servidor antes)
npm test               # 13 pruebas automáticas
```

## API

| Método | Ruta | Propósito | Códigos |
|---|---|---|---|
| GET | `/api/salud` | Comprueba que el servicio y la base responden | 200, 503 |
| GET | `/api/reservas` | Lista de reservas | 200 |
| GET | `/api/reservas/:id` | Una reserva | 200, 400, 404 |
| POST | `/api/reservas` | Registra una reserva (valida y guarda en la base) | 201, 400, 409 |

Ejemplo de POST (en Windows usar `curl.exe`):

```bash
curl -i -X POST http://localhost:3000/api/reservas -H "Content-Type: application/json" -d '{"servicioId":"corporal","fecha":"2026-12-15","hora":"15:00","cliente":"Nahuel Villaroel","telefono":"0985112233","correo":"nahuel@example.com"}'
```

Valores válidos: `servicioId` = `masaje`, `facial` o `corporal`; `hora` = `09:00`, `10:00`, `11:00`, `14:00`, `15:00` o `16:00`. Los errores se devuelven en JSON: `400` con el detalle por campo y `409` si el horario ya está reservado.

## Funciones

| Función | Estado |
|---|---|
| Consultar servicios | Implementada (datos fijos en el frontend) |
| Registrar una reserva con validación y persistencia | Implementada |
| Consultar reservas (lista y por id) | Implementada |
| Evitar reservas duplicadas (error 409) | Implementada |
| Panel administrativo con totales y filtro | Implementada (lee de la base) |
| Consultar especialistas | Implementada con una API externa de prueba (JSONPlaceholder) |
| Modificar, cancelar y confirmar reservas | Parcial: solo se aplican en el navegador, no en la base |
| Administrar servicios, autenticación y roles | Futura |

## Despliegue y acceso

**Local:** <http://localhost:3000>

**Publicado:** https://spatime.onrender.com

El frontend publicado usa la dirección del backend desplegado: `frontend/config.js` apunta a `/api` en la misma dirección, no a `localhost`.

### Publicar en Render (plan gratuito)

1. Subir este repositorio a GitHub.
2. En <https://render.com>: **New + → Blueprint**, elegir el repositorio y confirmar. Render lee `render.yaml` y crea el servicio `spatime`.
   Alternativa manual: **New + → Web Service** con *Root Directory* `backend`, *Build Command* `npm install`, *Start Command* `npm start`, *Health Check Path* `/api/salud` y la variable `NODE_VERSION = 22.22.0`.
3. Esperar a que el despliegue termine y abrir la URL `https://<nombre>.onrender.com`.
4. Comprobar `https://<nombre>.onrender.com/api/salud` (debe responder `{"estado":"ok","baseDeDatos":"ok"}`).
5. Opcional: definir `CORS_ORIGIN` con la URL de la aplicación.

## Limitaciones

- En el plan gratuito de Render el sistema de archivos es temporal: **la base SQLite se reinicia (vuelve a los datos iniciales) cuando el servicio se reinicia, se vuelve a desplegar o se duerme por 15 minutos sin tráfico**. Las reservas se conservan mientras el servicio está activo (por ejemplo, durante una demostración). Para conservarlas siempre haría falta un disco persistente (plan pago de Render) o una base de datos alojada aparte.
- La primera visita después de un período de inactividad puede tardar cerca de un minuto en responder.
- Modificar, cancelar y confirmar reservas no se guardan en la base.
- No hay autenticación: el panel administrativo es accesible para cualquier usuario.
