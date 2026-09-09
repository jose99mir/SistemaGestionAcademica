/**
 * @file Nota Model - ms-notas
 * @description Capa de datos para la consulta y actualización de calificaciones académicas.
 * @iso ISO/IEC 27001 - Integridad y Confidencialidad
 */

const pool = require("../config/database");

class NotaModel {
  /**
   * Obtiene las calificaciones registradas de un estudiante por su ID
   * @param {number} estudianteId 
   */
  static async getNotasByEstudiante(estudianteId) {
    const query = `
      SELECT 
        n.id,
        m.nombre AS materia,
        m.codigo,
        n.corte1,
        n.corte2,
        n.corte3,
        n.nota_final
      FROM notas n
      INNER JOIN matriculas mat ON n.matricula_id = mat.id
      INNER JOIN materias m ON mat.materia_id = m.id
      WHERE mat.estudiante_id = ?
    `;
    const [rows] = await pool.execute(query, [estudianteId]);
    return rows;
  }

  /**
   * Obtiene las notas de los estudiantes inscritos en una materia asignada a un docente
   * @param {number} materiaId 
   */
  static async getNotasByMateria(materiaId) {
    const query = `
      SELECT 
        n.id AS nota_id,
        u.id AS estudiante_id,
        u.nombre AS estudiante,
        u.email,
        n.corte1,
        n.corte2,
        n.corte3,
        n.nota_final
      FROM notas n
      INNER JOIN matriculas mat ON n.matricula_id = mat.id
      INNER JOIN usuarios u ON mat.estudiante_id = u.id
      WHERE mat.materia_id = ?
    `;
    const [rows] = await pool.execute(query, [materiaId]);
    return rows;
  }

  /**
   * Actualiza las calificaciones de una matrícula específica
   */
  static async updateNota({ id, corte1, corte2, corte3 }) {
    const c1 = parseFloat(corte1) || 0;
    const c2 = parseFloat(corte2) || 0;
    const c3 = parseFloat(corte3) || 0;
    
    // Cálculo ponderado estándar (30%, 30%, 40%)
    const notaFinal = (c1 * 0.3) + (c2 * 0.3) + (c3 * 0.4);

    const query = `
      UPDATE notas 
      SET corte1 = ?, corte2 = ?, corte3 = ?, nota_final = ? 
      WHERE id = ?
    `;
    const [result] = await pool.execute(query, [c1, c2, c3, notaFinal.toFixed(2), id]);
    return result.affectedRows > 0;
  }

  /**
   * Registra una evaluación docente realizada por un estudiante
   */
  static async registrarEvaluacion({ estudiante_id, docente_id, puntaje, comentarios }) {
    const query = `
      INSERT INTO evaluaciones_docente (estudiante_id, docente_id, puntaje, comentarios)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.execute(query, [estudiante_id, docente_id, puntaje, comentarios || ""]);
    return result.insertId;
  }
}

module.exports = NotaModel;