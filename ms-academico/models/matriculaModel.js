/**
 * @file matriculaModel.js
 * @description Consultas a la base de datos para la gestión de matrículas.
 */

const db = require("../config/database");

const MatriculaModel = {
  // Resumen global de matrículas
  async getAll(userRole, userId, periodoId) {
    let query = `
      SELECT 
        m.id AS materiaId,
        m.codigo AS materiaCodigo,
        m.nombre AS materiaNombre,
        p.id AS periodoId,
        COALESCE(p.nombre, 'Sin Periodo') AS periodoNombre,
        u_doc.nombre AS profesorNombre,
        u_doc.email AS profesorEmail,
        COUNT(mat.id) AS totalEstudiantes
      FROM materias m
      LEFT JOIN matriculas mat ON mat.materia_id = m.id
      LEFT JOIN periodos_academicos p ON mat.periodo_id = p.id
      LEFT JOIN usuarios u_doc ON m.docente_id = u_doc.id
    `;

    const params = [];
    const conditions = [];

    if (userRole === "ESTUDIANTE") {
      conditions.push("mat.estudiante_id = ?");
      params.push(userId);
    } else if (userRole === "DOCENTE" || userRole === "PROFESOR") {
      conditions.push("m.docente_id = ?");
      params.push(userId);
    }

    if (periodoId) {
      conditions.push("(mat.periodo_id = ? OR mat.periodo_id IS NULL)");
      params.push(periodoId);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += `
      GROUP BY m.id, p.id, u_doc.id
      ORDER BY m.nombre ASC
    `;

    const [rows] = await db.query(query, params);
    return rows;
  },

  // Busca estudiantes activos en usuarios para autocompletado
  async buscarEstudiantes(termino) {
    const filter = `%${termino}%`;
    const query = `
      SELECT id, documento, nombre, email 
      FROM usuarios 
      WHERE rol = 'ESTUDIANTE' 
        AND activo = 1 
        AND (documento LIKE ? OR nombre LIKE ?)
      LIMIT 10
    `;
    const [rows] = await db.query(query, [filter, filter]);
    return rows;
  },

  // Obtiene los estudiantes matriculados trayendo la columna `mat.estado` de la tabla `matriculas`
  async getDetalle(materiaId, periodoId) {
    const query = `
      SELECT 
        mat.id AS matriculaId,
        u.id AS estudianteId,
        u.documento,
        u.nombre AS estudianteNombre,
        u.email AS estudianteEmail,
        mat.estado AS estadoMatricula
      FROM matriculas mat
      INNER JOIN usuarios u ON mat.estudiante_id = u.id
      WHERE mat.materia_id = ? AND mat.periodo_id = ?
      ORDER BY u.nombre ASC
    `;
    const [rows] = await db.query(query, [materiaId, periodoId]);
    return rows;
  },

  // Actualiza la columna `estado` en la tabla `matriculas` (ACTIVA / CANCELADA / FINALIZADA)
  async guardarMatriculas(materiaId, periodoId, estudiantes) {
    const [actuales] = await db.query(
      "SELECT estudiante_id, estado FROM matriculas WHERE materia_id = ? AND periodo_id = ?",
      [materiaId, periodoId]
    );

    const actualesMap = new Map(actuales.map(a => [a.estudiante_id, a.estado]));
    
    // Mapea la selección a los valores exactos del ENUM: 'ACTIVA', 'FINALIZADA', 'CANCELADA'
    const nuevosMap = new Map(
      estudiantes.map(e => [
        Number(e.id), 
        e.estadoMatricula || 'ACTIVA'
      ])
    );

    // 1. Desmatricular/Remover registro de la tabla `matriculas`
    const paraEliminar = [...actualesMap.keys()].filter(id => !nuevosMap.has(id));
    if (paraEliminar.length > 0) {
      await db.query(
        "DELETE FROM matriculas WHERE materia_id = ? AND periodo_id = ? AND estudiante_id IN (?)",
        [materiaId, periodoId, paraEliminar]
      );
    }

    // 2. Insertar o actualizar campo `estado` en la tabla `matriculas`
    for (const [estudianteId, estadoNuevo] of nuevosMap.entries()) {
      if (actualesMap.has(estudianteId)) {
        if (actualesMap.get(estudianteId) !== estadoNuevo) {
          await db.query(
            "UPDATE matriculas SET estado = ? WHERE materia_id = ? AND periodo_id = ? AND estudiante_id = ?",
            [estadoNuevo, materiaId, periodoId, estudianteId]
          );
        }
      } else {
        await db.query(
          "INSERT INTO matriculas (estudiante_id, materia_id, periodo_id, estado) VALUES (?, ?, ?, ?)",
          [estudianteId, materiaId, periodoId, estadoNuevo]
        );
      }
    }
  }
};

module.exports = MatriculaModel;