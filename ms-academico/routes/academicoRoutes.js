/**
 * @file Academico Routes - ms-academico
 * @description Rutas HTTP expuestas para programas, materias, matrículas y periodos.
 */

const express = require("express");
const router = express.Router();

const ProgramaController = require("../controllers/programaController");
const PeriodoController = require("../controllers/periodoController");
const AcademicoController = require("../controllers/academicoController");

// --- 1. CRUD PROGRAMAS ---
router.get("/programas", ProgramaController.list);
router.get("/programas/:id", ProgramaController.getById);
router.post("/programas", ProgramaController.create);
router.put("/programas/:id", ProgramaController.update);
router.delete("/programas/:id", ProgramaController.delete);

// --- 2. CRUD PERIODOS ACADÉMICOS ---
router.get("/periodos", PeriodoController.list);
router.get("/periodos/:id", PeriodoController.getById);
router.post("/periodos", PeriodoController.create);
router.put("/periodos/:id", PeriodoController.update);
router.delete("/periodos/:id", PeriodoController.delete);

// --- 3. MATERIAS Y MATRÍCULAS ---
router.get("/materias", AcademicoController.listMaterias);
router.post("/materias", AcademicoController.createMateria);
router.get("/matriculas/:estudiante_id", AcademicoController.getMatriculas);
router.post("/matriculas", AcademicoController.matricular);

module.exports = router;