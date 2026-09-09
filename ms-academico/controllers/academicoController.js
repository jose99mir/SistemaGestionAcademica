/**
 * @file Academico Controller - ms-academico
 * @description Lógica de negocio para asignaturas, programas y matrículas.
 * @iso ISO/IEC 25010 - Mantenibilidad y Eficiencia
 */

const AcademicoModel = require("../models/academicoModel");

class AcademicoController {
  static async listProgramas(req, res) {
    try {
      const programas = await AcademicoModel.getProgramas();
      return res.json(programas);
    } catch (err) {
      return res.status(500).json({ error: "Error al obtener programas", detalle: err.message });
    }
  }

  static async listMaterias(req, res) {
    try {
      const materias = await AcademicoModel.getMaterias();
      return res.json(materias);
    } catch (err) {
      return res.status(500).json({ error: "Error al obtener materias", detalle: err.message });
    }
  }

  static async createMateria(req, res) {
    const { codigo, nombre, creditos, programa_id, docente_id } = req.body || {};
    if (!codigo || !nombre || !creditos) {
      return res.status(400).json({ error: "Campos requeridos: codigo, nombre, creditos" });
    }
    try {
      const id = await AcademicoModel.createMateria({ codigo, nombre, creditos, programa_id, docente_id });
      return res.status(201).json({ id, mensaje: "Materia creada con éxito" });
    } catch (err) {
      return res.status(500).json({ error: "Error al crear materia", detalle: err.message });
    }
  }

  static async getMatriculas(req, res) {
    const { estudiante_id } = req.params;
    try {
      const matriculas = await AcademicoModel.getMatriculasEstudiante(estudiante_id);
      return res.json(matriculas);
    } catch (err) {
      return res.status(500).json({ error: "Error al obtener matrículas", detalle: err.message });
    }
  }

  static async matricular(req, res) {
    const { estudiante_id, materia_id, periodo_id } = req.body || {};
    if (!estudiante_id || !materia_id) {
      return res.status(400).json({ error: "Campos requeridos: estudiante_id, materia_id" });
    }
    try {
      const id = await AcademicoModel.matricularEstudiante({ estudiante_id, materia_id, periodo_id });
      return res.status(201).json({ id, mensaje: "Matrícula realizada exitosamente" });
    } catch (err) {
      return res.status(500).json({ error: "Error al realizar matrícula", detalle: err.message });
    }
  }
}

module.exports = AcademicoController;