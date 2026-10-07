/**
 * @file Index Principal - ms-soporte
 * @location ms-soporte/index.js
 */

const express = require("express");
const cors = require("cors");
const soporteRoutes = require("./routes/soporteRoutes");

const app = express();
const PORT = parseInt(process.env.PORT || "3007", 10);

app.use(cors());
app.use(express.json());

// IMPORTANTE: Montar en "/" porque ms-gateway hace pathRewrite de "/api/soporte" a ""
app.use("/", soporteRoutes);

app.get("/health", (req, res) => {
  res.json({ service: "ms-soporte", status: "ok", timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`[ms-soporte] Servidor ejecutándose en el puerto ${PORT}`);
});