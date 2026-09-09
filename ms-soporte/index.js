/**
 * @file Index Principal - ms-soporte
 * @description Servidor de inicio para el microservicio de PQRS y soporte.
 */

const express = require("express");
const cors = require("cors");
const soporteRoutes = require("./routes/soporteRoutes");

const app = express();
app.use(cors());
app.use(express.json());

const SERVICIO = "ms-soporte";
const PORT = process.env.PORT || 3007;

let avgResponseTime = 0;
let totalRequests = 0;
let errorCount = 0;

app.use((req, res, next) => {
  totalRequests++;
  const start = Date.now();
  res.on("finish", () => {
    const elapsed = Date.now() - start;
    avgResponseTime = avgResponseTime * 0.9 + elapsed * 0.1;
    if (res.statusCode >= 400) errorCount++;
  });
  next();
});

app.use("/", soporteRoutes);

app.get("/health", (req, res) => {
  res.json({
    servicio: SERVICIO,
    estado: "ok",
    response_time_ms: Math.round(avgResponseTime),
    timestamp: new Date()
  });
});

app.get("/metrics", (req, res) => {
  res.json({
    servicio: SERVICIO,
    uptime_seconds: Math.round(process.uptime()),
    memory_mb: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
    total_requests: totalRequests,
    error_count: errorCount,
    avg_response_time_ms: Math.round(avgResponseTime)
  });
});

app.listen(PORT, () => {
  console.log(`[${SERVICIO}] Corriendo en el puerto ${PORT}`);
});