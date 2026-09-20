/**
 * @file Programa Routes
 * @location ms-academico/routes/programaRoutes.js
 */

const express = require("express");
const router = express.Router();
const ProgramaController = require("../controllers/programaController");

// Endpoints del CRUD
router.get("/", ProgramaController.list);
router.get("/:id", ProgramaController.getById);
router.post("/", ProgramaController.create);
router.put("/:id", ProgramaController.update);
router.delete("/:id", ProgramaController.delete); // Inactiva en lugar de borrar SQL

module.exports = router;
