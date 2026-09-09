/**
 * @file Index Principal - ms-gateway
 * @description Punto único de entrada (API Gateway) para el Portal Académico.
 * @iso ISO/IEC 25010 - Alta Disponibilidad y Mantenibilidad
 * @iso ISO/IEC 27001 - Control de Acceso Centralizado
 */

const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());

// Mapeo de microservicios backend
const services = {
  "/api/auth": process.env.MS_AUTH_URL || "http://ms-auth:3006",
  "/api/usuarios": process.env.MS_USUARIOS_URL || "http://ms-usuarios:3001",
  "/api/academico": process.env.MS_ACADEMICO_URL || "http://ms-academico:3002",
  "/api/notas": process.env.MS_NOTAS_URL || "http://ms-notas:3005",
  "/api/soporte": process.env.MS_SOPORTE_URL || "http://ms-soporte:3007"
};

// Configuración de proxies dinámicos
Object.entries(services).forEach(([path, target]) => {
  app.use(
    path,
    createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: (pathStr) => pathStr.replace(new RegExp(`^${path}`), ""),
      onError: (err, req, res) => {
        console.error(`[Gateway Error] Fallo al redirigir ${path}:`, err.message);
        res.status(503).json({
          error: "Servicio no disponible temporalmente",
          path
        });
      }
    })
  );
});

// Health check global del API Gateway
app.get("/health", (req, res) => {
  res.json({
    gateway: "ok",
    servicios_mapeados: Object.keys(services),
    timestamp: new Date()
  });
});

app.listen(PORT, () => {
  console.log(`[ms-gateway] Corriendo y enrutando en el puerto ${PORT}`);
});