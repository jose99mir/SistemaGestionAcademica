/**
 * @file matriculaController.js
 * @description Controlador HTTP para la gestión de matrículas.
 */

const MatriculaModel = require("../models/matriculaModel");

const MatriculaController = {
  async getAll(req, res) {
    try {
      const userRole = req.headers["x-user-role"];
      const userId = req.headers["x-user-id"];
      const { periodoId } = req.query;

      const matriculas = await MatriculaModel.getAll(userRole, userId, periodoId);
      return res.json(matriculas);
    } catch (error) {
      console.error("Error en getAll matriculas:", error);
      return res.status(500).json({ mensaje: "Error al consultar matrículas" });
    }
  },

  async buscarEstudiantes(req, res) {
    try {
      const { q } = req.query;
      if (!q || q.length < 2) return res.json([]);

      const estudiantes = await MatriculaModel.buscarEstudiantes(q);
      return res.json(estudiantes);
    } catch (error) {
      console.error("Error en buscarEstudiantes:", error);
      return res.status(500).json({ mensaje: "Error en la búsqueda de estudiantes" });
    }
  },

  async getDetalle(req, res) {
    try {
      const { materiaId, periodoId } = req.params;
      const detalle = await MatriculaModel.getDetalle(materiaId, periodoId);
      return res.json(detalle);
    } catch (error) {
      console.error("Error en getDetalle matriculas:", error);
      return res.status(500).json({ mensaje: "Error al obtener el detalle" });
    }
  },

  async guardarMatriculas(req, res) {
    try {
      const { materiaId, periodoId, estudiantesIds } = req.body;

      if (!materiaId || !periodoId || !Array.isArray(estudiantesIds)) {
        return res.status(400).json({ mensaje: "Materia, Periodo y lista de estudiantes requeridos." });
      }

      await MatriculaModel.guardarMatriculas(materiaId, periodoId, estudiantesIds);
      return res.json({ mensaje: "Matrículas procesadas correctamente" });
    } catch (error) {
      console.error("Error en guardarMatriculas:", error);
      return res.status(500).json({ mensaje: "Error al procesar las matrículas" });
    }
  }
};

module.exports = MatriculaController;