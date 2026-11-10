/**
 * @file notaModel.js
 * @description Consultas SQL para la gestión de notas por docente/admin y vista del estudiante.
 */

const db = require("../config/database");

const NotaModel = {
  // Lista materias: trae p.activo AS periodoActivo para controlar el bloqueo en la UI
  async getMateriasDocente(userRole, userId, periodoId) {
    let query = `
      SELECT DISTINCT
        m.id AS materiaId,
        m.codigo AS materiaCodigo,
        m.nombre AS materiaNombre,
        p.id AS periodoId,
        COALESCE(p.nombre, 'Sin Periodo') AS periodoNombre,
        p.activo AS periodoActivo,
        u_doc.nombre AS profesorNombre,
        COUNT(mat.id) AS totalEstudiantes
      FROM materias m
      INNER JOIN matriculas mat ON mat.materia_id = m.id
      INNER JOIN periodos_academicos p ON mat.periodo_id = p.id
      LEFT JOIN usuarios u_doc ON m.docente_id = u_doc.id
    `;

    const params = [];
    const conditions = [];

    if (userRole === "DOCENTE" || userRole === "PROFESOR") {
      conditions.push("m.docente_id = ?");
      params.push(userId);
    }

    if (periodoId) {
      conditions.push("mat.periodo_id = ?");
      params.push(periodoId);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " GROUP BY m.id, p.id, u_doc.id, p.activo ORDER BY p.id DESC, m.nombre ASC";

    const [rows] = await db.query(query, params);
    return rows;
  },

  // Obtiene si el periodo está activo (1) o inactivo (0)
  async getEstadoPeriodo(periodoId) {
    const [rows] = await db.query(
      `SELECT activo FROM periodos_academicos WHERE id = ?`,
      [periodoId]
    );
    return rows.length > 0 ? rows[0].activo : 0;
  },

  // Obtiene el ID del periodo a partir de un matricula_id
  async getPeriodoByMatriculaId(matriculaId) {
    const [rows] = await db.query(
      `SELECT periodo_id FROM matriculas WHERE id = ?`,
      [matriculaId]
    );
    return rows.length > 0 ? rows[0].periodo_id : null;
  },

  // Obtiene los estudiantes de una materia/periodo con sus notas
  async getEstudiantesConNotas(materiaId, periodoId) {
    const query = `
      SELECT 
        mat.id AS matriculaId,
        u.id AS estudianteId,
        u.documento,
        u.nombre AS estudianteNombre,
        u.email AS estudianteEmail,
        COALESCE(n.corte1, 0) AS corte1,
        COALESCE(n.corte2, 0) AS corte2,
        COALESCE(n.corte3, 0) AS corte3,
        COALESCE(n.nota_final, 0) AS notaFinal
      FROM matriculas mat
      INNER JOIN usuarios u ON mat.estudiante_id = u.id
      LEFT JOIN notas n ON n.matricula_id = mat.id
      WHERE mat.materia_id = ? AND mat.periodo_id = ? AND mat.estado = 'ACTIVA'
      ORDER BY u.nombre ASC
    `;

    const [rows] = await db.query(query, [materiaId, periodoId]);
    return rows;
  },

  // Guarda o actualiza masivamente las notas
  async guardarNotas(notasGrid) {
    for (const item of notasGrid) {
      const { matriculaId, corte1, corte2, corte3, notaFinal } = item;

      await db.query(`
        INSERT INTO notas (matricula_id, corte1, corte2, corte3, nota_final)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          corte1 = VALUES(corte1),
          corte2 = VALUES(corte2),
          corte3 = VALUES(corte3),
          nota_final = VALUES(nota_final)
      `, [matriculaId, corte1 || 0, corte2 || 0, corte3 || 0, notaFinal || 0]);
    }
  },

  // Obtiene periodos del estudiante
  async getPeriodosEstudiante(estudianteId) {
    const query = `
      SELECT DISTINCT 
        p.id AS id, 
        p.nombre AS nombre,
        p.activo AS activo
      FROM matriculas mat
      INNER JOIN periodos_academicos p ON mat.periodo_id = p.id
      WHERE mat.estudiante_id = ?
      ORDER BY p.id DESC
    `;
    const [rows] = await db.query(query, [estudianteId]);
    return rows;
  },

  // Historial académico del estudiante
  async getNotasEstudiante(estudianteId, periodoId = null) {
    let query = `
      SELECT 
        p.id AS periodoId,
        COALESCE(p.nombre, 'Sin Periodo') AS periodoNombre,
        p.activo AS periodoActivo,
        m.id AS materiaId,
        m.codigo AS materiaCodigo,
        m.nombre AS materiaNombre,
        COALESCE(m.creditos, 3) AS creditos,
        mat.estado AS estadoMatricula,
        COALESCE(n.corte1, 0) AS corte1,
        COALESCE(n.corte2, 0) AS corte2,
        COALESCE(n.corte3, 0) AS corte3,
        COALESCE(n.nota_final, 0) AS notaFinal
      FROM matriculas mat
      INNER JOIN materias m ON mat.materia_id = m.id
      INNER JOIN periodos_academicos p ON mat.periodo_id = p.id
      LEFT JOIN notas n ON n.matricula_id = mat.id
      WHERE mat.estudiante_id = ?
    `;

    const params = [estudianteId];

    if (periodoId) {
      query += " AND mat.periodo_id = ?";
      params.push(periodoId);
    }

    query += " ORDER BY p.id DESC, m.nombre ASC";

    const [rows] = await db.query(query, params);
    return rows;
  }
};

module.exports = NotaModel;