/**
 * @file Index Principal - ms-gateway
 * @description Punto único de entrada para el Portal Académico con forward de identidad.
 */

const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

if (!process.env.PORT) {
  throw new Error("ERROR FATAL: La variable de entorno PORT no está definida.");
}

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

// Mapeo de microservicios backend
const services = {
  "/api/auth": process.env.MS_AUTH_URL,
  "/api/usuarios": process.env.MS_USUARIOS_URL,
  "/api/academico": process.env.MS_ACADEMICO_URL,
  "/api/notas": process.env.MS_NOTAS_URL,
  "/api/soporte": process.env.MS_SOPORTE_URL
};

// Función auxiliar para decodificar JWT sin librerías externas
function parseJwtPayload(token) {
  try {
    const base64Payload = token.split(".")[1];
    if (!base64Payload) return null;
    const payloadBuffer = Buffer.from(base64Payload, "base64");
    return JSON.parse(payloadBuffer.toString("utf-8"));
  } catch (e) {
    return null;
  }
}

Object.entries(services).forEach(([path, target]) => {
  console.log(`[ms-gateway] Enrutando ${path} -> ${target}`);

  app.use(
    path,
    createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: (pathStr) => pathStr.replace(new RegExp(`^${path}`), ""),
      onProxyReq: (proxyReq, req) => {
        // Extrae el Token JWT del Header
        const authHeader = req.headers["authorization"];
        if (authHeader) {
          const token = authHeader.split(" ")[1];
          const decoded = parseJwtPayload(token);
          if (decoded) {
            const userId = decoded.id || decoded.usuario_id || decoded.sub;
            const userRole = decoded.rol || decoded.role || "ESTUDIANTE";
            
            // Inyecta las cabeceras en la petición hacia el microservicio final
            if (userId) proxyReq.setHeader("x-user-id", String(userId));
            if (userRole) proxyReq.setHeader("x-user-role", String(userRole));
          }
        }
      },
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