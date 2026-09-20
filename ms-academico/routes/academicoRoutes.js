/**
 * @file Academico Routes - ms-academico
 * @description Rutas HTTP expuestas para programas, materias y matrículas.
 */

const express = require("express");
const router = express.Router();

// Importación de Controladores
const ProgramaController = require("../controllers/programaController");
const AcademicoController = require("../controllers/academicoController");

// ==========================================
// 1. CRUD PROGRAMAS ACADÉMICOS
// ==========================================
router.get("/programas", ProgramaController.list);
router.get("/programas/:id", ProgramaController.getById);
router.post("/programas", ProgramaController.create);
router.put("/programas/:id", ProgramaController.update);
router.delete("/programas/:id", ProgramaController.delete);

// ==========================================
// 2. MATERIAS Y MATRÍCULAS
// ==========================================
router.get("/materias", AcademicoController.listMaterias);
router.post("/materias", AcademicoController.createMateria);
router.get("/matriculas/:estudiante_id", AcademicoController.getMatriculas);
router.post("/matriculas", AcademicoController.matricular);

module.exports = router;