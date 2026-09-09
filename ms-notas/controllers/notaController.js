/**
 * @file Nota Controller - ms-notas
 * @description Control y gestión de lógica para notas y evaluaciones.
 * @iso ISO/IEC 25010 - Funcionalidad y Mantenibilidad
 */

const NotaModel = require("../models/notaModel");

class NotaController {
  static async getNotasEstudiante(req, res) {
    const { estudiante_id } = req.params;
    try {
      const notas = await NotaModel.getNotasByEstudiante(estudiante_id);
      return res.json(notas);
    } catch (err) {
      return res.status(500).json({ error: "Error al consultar notas", detalle: err.message });
    }
  }

  static async getNotasMateria(req, res) {
    const { materia_id } = req.params;
    try {
      const notas = await NotaModel.getNotasByMateria(materia_id);
      return res.json(notas);
    } catch (err) {
      return res.status(500).json({ error: "Error al consultar lista de notas", detalle: err.message });
    }
  }

  static async updateNota(req, res) {
    const { id } = req.params;
    const { corte1, corte2, corte3 } = req.body || {};

    try {
      const updated = await NotaModel.updateNota({ id, corte1, corte2, corte3 });
      if (!updated) {
        return res.status(404).json({ error: "Registro de notas no encontrado" });
      }
      return res.json({ mensaje: "Calificaciones actualizadas correctamente" });
    } catch (err) {
      return res.status(500).json({ error: "Error al actualizar calificaciones", detalle: err.message });
    }
  }

  static async evaluarDocente(req, res) {
    const { estudiante_id, docente_id, puntaje, comentarios } = req.body || {};

    if (!estudiante_id || !docente_id || !puntaje) {
      return res.status(400).json({ error: "Campos requeridos: estudiante_id, docente_id, puntaje" });
    }

    try {
      const id = await NotaModel.registrarEvaluacion({ estudiante_id, docente_id, puntaje, comentarios });
      return res.status(201).json({ id, mensaje: "Evaluación registrada correctamente" });
    } catch (err) {
      return res.status(500).json({ error: "Error al registrar evaluación", detalle: err.message });
    }
  }
}

module.exports = NotaController;