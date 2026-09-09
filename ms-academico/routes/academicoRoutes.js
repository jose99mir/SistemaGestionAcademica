/**
 * @file Academico Routes - ms-academico
 * @description Rutas HTTP expuestas para oferta académica y matrículas.
 */

const express = require("express");
const AcademicoController = require("../controllers/academicoController");

const router = express.Router();

router.get("/programas", AcademicoController.listProgramas);
router.get("/materias", AcademicoController.listMaterias);
router.post("/materias", AcademicoController.createMateria);
router.get("/matriculas/:estudiante_id", AcademicoController.getMatriculas);
router.post("/matriculas", AcademicoController.matricular);

module.exports = router;