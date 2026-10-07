/**
 * @file Soporte Routes - ms-soporte
 * @description Exposición de rutas REST del microservicio de soporte técnico y PQRS.
 */

const express = require("express");
const SoporteController = require("../controllers/soporteController");

const router = express.Router();

router.get("/", SoporteController.getPqrs);
router.post("/", SoporteController.createPqr);
router.put("/:id/responder", SoporteController.responderPqr);
router.delete("/:id", SoporteController.deletePqr);

module.exports = router;