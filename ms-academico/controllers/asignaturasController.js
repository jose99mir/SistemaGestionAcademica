/**
 * @file asignaturasController.js
 * @description Controlador para el recurso Asignaturas/Materias en ms-academico.
 */

const db = require("../config/database");

const AsignaturasController = {
  // --- 1. LISTAR ASIGNATURAS / MATERIAS ---
  async getAll(req, res) {
    try {
      const userId = req.headers["x-user-id"];
      const userEmail = req.headers["x-user-email"];
      const userRole = req.headers["x-user-role"];
      const { periodoId } = req.query;

      let query = "";
      const params = [];

      if (userRole === "ESTUDIANTE") {
        // Estudiante: Consulta materias matriculadas en el periodo con sus notas
        query = `
          SELECT 
            m.id AS materiaId,
            m.codigo,
            m.nombre AS materiaNombre,
            m.creditos,
            mat.id AS matriculaId,
            mat.estado AS estadoMatricula,
            p.nombre AS periodoNombre,
            u.nombre AS docenteNombre,
            n.corte1,
            n.corte2,
            n.corte3,
            n.nota_final AS notaFinal
          FROM matriculas mat
          INNER JOIN materias m ON mat.materia_id = m.id
          INNER JOIN periodos_academicos p ON mat.periodo_id = p.id
          LEFT JOIN usuarios u ON m.docente_id = u.id
          LEFT JOIN notas n ON n.matricula_id = mat.id
          WHERE mat.estudiante_id = ?
        `;
        params.push(userId);

        if (periodoId) {
          query += ` AND mat.periodo_id = ?`;
          params.push(periodoId);
        }

        query += ` ORDER BY m.nombre ASC`;

      } else if (userRole === "PROFESOR" || userRole === "DOCENTE") {
        // Docente: Consulta solo las asignaturas que dicta
        query = `
          SELECT 
            m.id, 
            m.codigo, 
            m.nombre, 
            m.creditos, 
            p.nombre AS programaNombre
          FROM materias m
          LEFT JOIN programas p ON m.programa_id = p.id
          WHERE m.docente_id = ? OR m.docente_id = (SELECT id FROM usuarios WHERE email = ?)
          ORDER BY m.id DESC
        `;
        params.push(userId, userEmail);

      } else {
        // Admin: Consulta global de materias
        query = `
          SELECT 
            m.id, 
            m.codigo, 
            m.nombre, 
            m.creditos, 
            m.programa_id AS programaId,
            m.docente_id AS docenteId,
            p.nombre AS programaNombre,
            u.nombre AS docenteNombre
          FROM materias m
          LEFT JOIN programas p ON m.programa_id = p.id
          LEFT JOIN usuarios u ON m.docente_id = u.id
          ORDER BY m.id DESC
        `;
      }

      const [rows] = await db.query(query, params);
      return res.json(rows);
    } catch (error) {
      console.error("Error en getAll materias/asignaturas:", error);
      return res.status(500).json({ mensaje: "Error al obtener asignaturas" });
    }
  },

  // --- 2. OBTENER POR ID ---
  async getById(req, res) {
    try {
      const { id } = req.params;
      const [rows] = await db.query(
        `SELECT m.*, p.nombre AS programaNombre 
         FROM materias m 
         LEFT JOIN programas p ON m.programa_id = p.id 
         WHERE m.id = ?`,
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ mensaje: "Asignatura no encontrada" });
      }

      return res.json(rows[0]);
    } catch (error) {
      console.error("Error en getById asignatura:", error);
      return res.status(500).json({ mensaje: "Error al consultar asignatura" });
    }
  },

  // --- 3. CREAR ASIGNATURA (ADMIN) ---
  async create(req, res) {
    try {
      const { codigo, nombre, creditos, programaId, docenteId } = req.body;

      if (!codigo || !nombre) {
        return res.status(400).json({ mensaje: "El código y el nombre son obligatorios" });
      }

      const [exist] = await db.query("SELECT id FROM materias WHERE codigo = ?", [codigo]);
      if (exist.length > 0) {
        return res.status(400).json({ mensaje: "El código de asignatura ya existe" });
      }

      const [result] = await db.query(
        `INSERT INTO materias (codigo, nombre, creditos, programa_id, docente_id) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          codigo,
          nombre,
          creditos || 3,
          programaId || null,
          docenteId || null
        ]
      );

      return res.status(201).json({
        id: result.insertId,
        codigo,
        nombre,
        creditos,
        programaId,
        docenteId
      });
    } catch (error) {
      console.error("Error en create asignatura:", error);
      return res.status(500).json({ mensaje: "Error al crear asignatura" });
    }
  },

  // --- 4. ACTUALIZAR ASIGNATURA (ADMIN) ---
  async update(req, res) {
    try {
      const { id } = req.params;
      const { codigo, nombre, creditos, programaId, docenteId } = req.body;

      const [rows] = await db.query("SELECT id FROM materias WHERE id = ?", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ mensaje: "Asignatura no encontrada" });
      }

      await db.query(
        `UPDATE materias 
         SET codigo = ?, nombre = ?, creditos = ?, programa_id = ?, docente_id = ? 
         WHERE id = ?`,
        [
          codigo,
          nombre,
          creditos,
          programaId || null,
          docenteId || null,
          id
        ]
      );

      return res.json({ id: Number(id), codigo, nombre, creditos, programaId, docenteId });
    } catch (error) {
      console.error("Error en update asignatura:", error);
      return res.status(500).json({ mensaje: "Error al actualizar asignatura" });
    }
  },

  // --- 5. ELIMINAR ASIGNATURA (ADMIN) ---
  async delete(req, res) {
    try {
      const { id } = req.params;
      const [rows] = await db.query("SELECT id FROM materias WHERE id = ?", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ mensaje: "Asignatura no encontrada" });
      }

      await db.query("DELETE FROM materias WHERE id = ?", [id]);
      return res.json({ mensaje: "Asignatura eliminada correctamente" });
    } catch (error) {
      console.error("Error en delete asignatura:", error);
      return res.status(500).json({ mensaje: "Error al eliminar asignatura" });
    }
  },

  async getDocentes(req, res) {
    try {
      const [rows] = await db.query(
        `SELECT id, nombre, email FROM usuarios WHERE rol IN ('PROFESOR', 'DOCENTE') ORDER BY nombre ASC`
      );
      return res.json(rows);
    } catch (error) {
      console.error("Error en getDocentes:", error);
      return res.status(500).json({ mensaje: "Error al consultar docentes" });
    }
  }
};

module.exports = AsignaturasController;