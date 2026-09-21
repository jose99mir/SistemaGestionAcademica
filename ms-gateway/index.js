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

if (!process.env.PORT) {
  throw new Error("ERROR FATAL: La variable de entorno PORT no está definida.");
}

// Validasion dagiti variables ti entorno para kadagiti microservicios
const requiredEnvVars = [
  "MS_AUTH_URL",
  "MS_USUARIOS_URL",
  "MS_ACADEMICO_URL",
  "MS_NOTAS_URL",
  "MS_SOPORTE_URL"
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`ERROR FATAL: La variable de entorno ${envVar} no está definida.`);
  }
}

const PORT = parseInt(process.env.PORT, 10);

app.use(cors());

// Mapeo ti microservicios backend a diretso a mangal-ala kadagiti variables
const services = {
  "/api/auth": process.env.MS_AUTH_URL,
  "/api/usuarios": process.env.MS_USUARIOS_URL,
  "/api/academico": process.env.MS_ACADEMICO_URL,
  "/api/notas": process.env.MS_NOTAS_URL,
  "/api/soporte": process.env.MS_SOPORTE_URL
};

// Configuración ti proxies dinámicos
Object.entries(services).forEach(([path, target]) => {
  console.log(`[ms-gateway] Enrutando ${path} -> ${target}`);

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

// Health check global ti API Gateway
app.get("/health", (req, res) => {
  res.json({
    gateway: "ok",
    servicios_mapeados: services,
    timestamp: new Date()
  });
});

app.listen(PORT, () => {
  console.log(`[ms-gateway] Corriendo y enrutando en el puerto ${PORT}`);
});