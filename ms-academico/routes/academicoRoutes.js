/**
 * @file academicoRoutes.js
 * @description Definición de rutas principales de ms-academico.
 */

const express = require("express");
const router = express.Router();

const ProgramaController = require("../controllers/programaController");
const PeriodoController = require("../controllers/periodoController");
const AcademicoController = require("../controllers/academicoController");
const AsignaturasController = require("../controllers/asignaturasController");
const MatriculaController = require("../controllers/matriculaController");

const getHandler = (controller, method) => {
  if (controller && typeof controller[method] === "function") {
    return controller[method];
  }
  return (req, res) => {
    res.status(501).json({ mensaje: `El método '${method}' no está implementado.` });
  };
};

// --- PROGRAMAS ---
router.get("/programas", getHandler(ProgramaController, "list"));
router.get("/programas/:id", getHandler(ProgramaController, "getById"));
router.post("/programas", getHandler(ProgramaController, "create"));
router.put("/programas/:id", getHandler(ProgramaController, "update"));
router.delete("/programas/:id", getHandler(ProgramaController, "delete"));

// --- PERIODOS ---
router.get("/periodos", getHandler(PeriodoController, "list"));
router.get("/periodos/:id", getHandler(PeriodoController, "getById"));
router.post("/periodos", getHandler(PeriodoController, "create"));
router.put("/periodos/:id", getHandler(PeriodoController, "update"));
router.delete("/periodos/:id", getHandler(PeriodoController, "delete"));

// --- ASIGNATURAS / MATERIAS ---
router.get("/asignaturas", getHandler(AsignaturasController, "getAll"));
router.get("/asignaturas/:id", getHandler(AsignaturasController, "getById"));
router.post("/asignaturas", getHandler(AsignaturasController, "create"));
router.put("/asignaturas/:id", getHandler(AsignaturasController, "update"));
router.delete("/asignaturas/:id", getHandler(AsignaturasController, "delete"));
router.get("/docentes", getHandler(AsignaturasController, "getDocentes"));

// --- MATRÍCULAS ---
router.get("/matriculas", getHandler(MatriculaController, "getAll"));
router.get("/matriculas/estudiantes/buscar", getHandler(MatriculaController, "buscarEstudiantes"));
router.get("/matriculas/detalle/:materiaId/:periodoId", getHandler(MatriculaController, "getDetalle"));
router.post("/matriculas/guardar", getHandler(MatriculaController, "guardarMatriculas"));

module.exports = router;