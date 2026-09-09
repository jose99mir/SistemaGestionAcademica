/**
 * @file Academico Model - ms-academico
 * @description Operaciones SQL para programas académicos, materias y matrículas de estudiantes.
 * @iso ISO/IEC 27001 - Integridad de Datos
 */

const pool = require("../config/database");

class AcademicoModel {
  /**
   * Obtiene la lista de programas académicos
   */
  static async getProgramas() {
    const [rows] = await pool.execute("SELECT * FROM programas ORDER BY nombre ASC");
    return rows;
  }

  /**
   * Obtiene la lista de materias asociadas a sus programas y profesores
   */
  static async getMaterias() {
    const query = `
      SELECT 
        m.id, m.codigo, m.nombre, m.creditos, 
        p.nombre AS programa, 
        u.nombre AS docente
      FROM materias m
      LEFT JOIN programas p ON m.programa_id = p.id
      LEFT JOIN usuarios u ON m.docente_id = u.id
      ORDER BY m.nombre ASC
    `;
    const [rows] = await pool.execute(query);
    return rows;
  }

  /**
   * Registra una asignatura/materia
   */
  static async createMateria({ codigo, nombre, creditos, programa_id, docente_id }) {
    const query = `
      INSERT INTO materias (codigo, nombre, creditos, programa_id, docente_id)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(query, [codigo, nombre, creditos, programa_id, docente_id || null]);
    return result.insertId;
  }

  /**
   * Consulta las matrículas académicas activas de un estudiante
   * @param {number} estudianteId 
   */
  static async getMatriculasEstudiante(estudianteId) {
    const query = `
      SELECT 
        m.id AS matricula_id,
        mat.codigo, mat.nombre AS materia, mat.creditos,
        u.nombre AS docente,
        m.estado
      FROM matriculas m
      INNER JOIN materias mat ON m.materia_id = mat.id
      LEFT JOIN usuarios u ON mat.docente_id = u.id
      WHERE m.estudiante_id = ?
    `;
    const [rows] = await pool.execute(query, [estudianteId]);
    return rows;
  }

  /**
   * Realiza la matrícula de un estudiante a una materia
   */
  static async matricularEstudiante({ estudiante_id, materia_id, periodo_id }) {
    const query = `
      INSERT INTO matriculas (estudiante_id, materia_id, periodo_id, estado)
      VALUES (?, ?, ?, 'ACTIVA')
    `;
    const [result] = await pool.execute(query, [estudiante_id, materia_id, periodo_id || 1]);
    return result.insertId;
  }
}

module.exports = AcademicoModel;