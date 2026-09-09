/**
 * @file Index - Microservicio de Autenticación (ms-auth)
 */
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 3006;
const SERVICIO = "ms-auth";

// Middlewares globales
app.use(cors());
app.use(express.json());

// Healthcheck para comprobar disponibilidad
app.get(["/health", "/api/auth/health"], (req, res) => {
  res.status(200).json({ status: "OK", service: SERVICIO });
});

// Cargar enrutador de autenticación desde la raíz y con el prefijo /api/auth
app.use("/", authRoutes);
app.use("/api/auth", authRoutes);

// Manejo de rutas no encontradas (404)
app.use((req, res) => {
  console.log(`[${SERVICIO}] Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: `Ruta no encontrada en ${SERVICIO}: ${req.method} ${req.originalUrl}` });
});

// Middleware de manejo de errores globales
app.use((err, req, res, next) => {
  console.error(`[${SERVICIO}] Error no controlado:`, err.stack);
  res.status(500).json({ error: "Error interno del servidor", detalle: err.message });
});

// Iniciar servidor HTTP
app.listen(PORT, () => {
  console.log(`[${SERVICIO}] Corriendo en el puerto ${PORT}`);
});