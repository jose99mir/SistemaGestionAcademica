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
      const userRole = req.headers["x-user-role"];
      const { notas, periodoId } = req.body;

      if (!Array.isArray(notas) || notas.length === 0) {
        return res.status(400).json({ mensaje: "Estructura de notas no válida o vacía" });
      }

      // 🔒 VALIDACIÓN DE PERIODO ACTIVO (Solo se valida si NO es ADMIN)
      if (userRole !== "ADMIN") {
        let idPeriodoEvaluar = periodoId;

        // Si no vino el periodoId en la petición, lo obtenemos mediante la matriculaId
        if (!idPeriodoEvaluar && notas[0]?.matriculaId) {
          idPeriodoEvaluar = await NotaModel.getPeriodoByMatriculaId(notas[0].matriculaId);
        }

        if (idPeriodoEvaluar) {
          const esActivo = await NotaModel.getEstadoPeriodo(idPeriodoEvaluar);

          // En MySQL el campo 'activo' es 1 (activo) o 0 (inactivo)
          if (esActivo !== 1 && esActivo !== true) {
            return res.status(403).json({
              mensaje: "El periodo académico se encuentra inactivo. No es posible guardar ni modificar calificaciones."
            });
          }
        }
      }

      // 💾 Si es ADMIN o el periodo está activo (1), procede el guardado
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
      return res.status(500).json({ mensaje: "Error al obtener historial académico", error: error.message });
    }
  }
};

module.exports = NotaController;