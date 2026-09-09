/**
 * @file Soporte Routes - ms-soporte
 * @description Mapeo de rutas HTTP para la gestión de PQRS.
 */

const express = require("express");
const SoporteController = require("../controllers/soporteController");

const router = express.Router();

router.post("/", SoporteController.registrarPqrs);
router.get("/", SoporteController.listAll);
router.get("/usuario/:usuario_id", SoporteController.getByUsuario);
router.put("/:id/responder", SoporteController.responder);

module.exports = router;