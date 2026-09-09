/**
 * @file Nota Routes - ms-notas
 * @description Exposición de rutas REST del microservicio de notas.
 */

const express = require("express");
const NotaController = require("../controllers/notaController");

const router = express.Router();

router.get("/estudiante/:estudiante_id", NotaController.getNotasEstudiante);
router.get("/materia/:materia_id", NotaController.getNotasMateria);
router.put("/:id", NotaController.updateNota);
router.post("/evaluar-docente", NotaController.evaluarDocente);

module.exports = router;