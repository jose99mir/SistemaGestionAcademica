/**
 * @file soporteRoutes.js
 * @description Definición de rutas del microservicio ms-soporte.
 */

const express = require("express");
const router = express.Router();

const SoporteController = require("../controllers/soporteController");

const getHandler = (controller, method) => {
  if (controller && typeof controller[method] === "function") {
    return controller[method];
  }
  return (req, res) => {
    res.status(501).json({ mensaje: `El método '${method}' no está implementado.` });
  };
};

router.get("/todos", getHandler(SoporteController, "getAll"));
router.get("/usuario/:usuarioId", getHandler(SoporteController, "getByUsuario"));
router.post("/", getHandler(SoporteController, "crear"));
router.put("/responder/:id", getHandler(SoporteController, "responder"));
router.delete("/:id", getHandler(SoporteController, "eliminar"));

module.exports = router;