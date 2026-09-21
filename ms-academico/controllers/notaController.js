/**
 * @file notaController.js
 * @description Controlador HTTP para la gestión de calificaciones por rol.
 */

const NotaModel = require("../models/notaModel");

const NotaController = {
  async getMateriasDocente(req, res) {
    try {
      const userRole = req.headers["x-user-role"];
      const userId = req.headers["x-user-id"];
      const { periodoId } = req.query;

      const materias = await NotaModel.getMateriasDocente(userRole, userId, periodoId);
      return res.json(materias);
    } catch (error) {
      console.error("Error en getMateriasDocente:", error);
      return res.status(500).json({ mensaje: "Error al consultar asignaturas", error: error.message });
    }
  },

  async getEstudiantesConNotas(req, res) {
    try {
      const { materiaId, periodoId } = req.params;
      const estudiantes = await NotaModel.getEstudiantesConNotas(materiaId, periodoId);
      return res.json(estudiantes);
    } catch (error) {
      console.error("Error en getEstudiantesConNotas:", error);
      return res.status(500).json({ mensaje: "Error al consultar la planilla de notas", error: error.message });
    }
  },

  async guardarNotas(req, res) {
    try {
      const { notas } = req.body;
      if (!Array.isArray(notas)) {
        return res.status(400).json({ mensaje: "Estructura de notas no válida" });
      }

      await NotaModel.guardarNotas(notas);
      return res.json({ mensaje: "Notas guardadas correctamente" });
    } catch (error) {
      console.error("Error en guardarNotas:", error);
      return res.status(500).json({ mensaje: "Error al registrar calificaciones", error: error.message });
    }
  },

async getPeriodosEstudiante(req, res) {
    try {
      const userId = req.headers["x-user-id"] || (req.user ? req.user.id : null);

      if (!userId) {
        return res.status(400).json({ mensaje: "Falta identificador del estudiante" });
      }

      const periodos = await NotaModel.getPeriodosEstudiante(userId);
      
      // Muestra en la terminal de Node.js qué está retornando la base de datos
      console.log(`[BACKEND DEBUG] Periodos para estudiante ${userId}:`, periodos);

      return res.json(periodos); // IMPORTANTE: debe llevar return res.json()
    } catch (error) {
      console.error("Error en getPeriodosEstudiante:", error);
      return res.status(500).json({ mensaje: "Error al consultar los periodos", error: error.message });
    }
  },

  async getNotasEstudiante(req, res) {
    try {
      const userId = req.headers["x-user-id"];
      const { periodoId } = req.query;
      const notas = await NotaModel.getNotasEstudiante(userId, periodoId);
      return res.json(notas);
    } catch (error) {
      console.error("Error en getNotasEstudiante:", error);
      return res.status(500).json({ mensaje: "Error al obtener historial académico", error: error.message });
    }
  },
    async getPeriodosEstudiante(req, res) {
  try {
    // Intenta obtener el ID del usuario desde x-user-id o desde el objeto req.user si usas JWT
    const userId = req.headers["x-user-id"] || (req.user ? req.user.id : null);

    if (!userId) {
      return res.status(400).json({ mensaje: "No se proporcionó el identificador del estudiante" });
    }

    const periodos = await NotaModel.getPeriodosEstudiante(userId);
    return res.json(periodos);
  } catch (error) {
    console.error("Error en getPeriodosEstudiante:", error);
    return res.status(500).json({ mensaje: "Error al consultar los periodos del estudiante", error: error.message });
  }
  },

  async getNotasEstudiante(req, res) {
    try {
      const userId = req.headers["x-user-id"];
      const { periodoId } = req.query;
      const notas = await NotaModel.getNotasEstudiante(userId, periodoId);
      return res.json(notas);
    } catch (error) {
      console.error("Error en getNotasEstudiante:", error);
      return res.status(500).json({ mensaje: "Error al obtener el historial de calificaciones", error: error.message });
    }
  }

  
};

module.exports = NotaController;