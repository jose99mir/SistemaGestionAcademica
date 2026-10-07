/**
 * @file soporteModel.js
 * @location ms-soporte/models/soporteModel.js
 * @description Consultas MySQL para el microservicio ms-soporte.
 */

const db = require("../config/database");

const SoporteModel = {
  // --- MÉTODOS DE CONSULTA GENERAL ---
  async getAll() {
    const sql = `
      SELECT 
        p.id,
        p.usuario_id,
        p.tipo,
        p.asunto,
        p.descripcion,
        p.estado,
        COALESCE(p.respuesta, '') AS respuesta,
        p.creado_en,
        COALESCE(u.documento, 'N/A') AS remitente,
        COALESCE(u.rol, 'ESTUDIANTE') AS usuarioRol
      FROM pqrs p
      LEFT JOIN usuarios u ON p.usuario_id = u.id
      ORDER BY p.id DESC
    `;
    const [rows] = await db.query(sql);
    return rows;
  },

  async getByUsuario(usuarioId) {
    const sql = `
      SELECT 
        p.id,
        p.usuario_id,
        p.tipo,
        p.asunto,
        p.descripcion,
        p.estado,
        COALESCE(p.respuesta, '') AS respuesta,
        p.creado_en,
        COALESCE(u.documento, 'N/A') AS remitente,
        COALESCE(u.rol, 'ESTUDIANTE') AS usuarioRol
      FROM pqrs p
      LEFT JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.usuario_id = ?
      ORDER BY p.id DESC
    `;
    const [rows] = await db.query(sql, [usuarioId]);
    return rows;
  },

  // --- MÉTODOS DE MUTACIÓN ---
  async crear(tipo, asunto, descripcion, usuarioId) {
    const sql = `
      INSERT INTO pqrs (tipo, asunto, descripcion, usuario_id, estado, creado_en)
      VALUES (?, ?, ?, ?, 'PENDIENTE', NOW())
    `;
    const [result] = await db.query(sql, [tipo, asunto, descripcion, usuarioId]);
    return result.insertId;
  },

  async responder(id, respuesta, estado = 'RESUELTO') {
    const sql = `UPDATE pqrs SET respuesta = ?, estado = ? WHERE id = ?`;
    const [result] = await db.query(sql, [respuesta, estado, id]);
    return result.affectedRows > 0;
  },

  async eliminar(id) {
    const sql = `DELETE FROM pqrs WHERE id = ?`;
    const [result] = await db.query(sql, [id]);
    return result.affectedRows > 0;
  },

  // =========================================================================
  // ALIAS EN INGLÉS PARA COMPATIBILIDAD DIRECTA CON SOPORTECONTROLLER
  // =========================================================================
  async getAllPqrs() {
    return this.getAll();
  },

  async getPqrsByUsuario(usuarioId) {
    return this.getByUsuario(usuarioId);
  },

  async createPqr(usuarioId, tipo, asunto, descripcion) {
    // Si viene ordenado (userId, tipo, asunto, descripcion)
    if (typeof usuarioId === 'number' || typeof usuarioId === 'string') {
      return this.crear(tipo, asunto, descripcion, usuarioId);
    }
    // Si vino (tipo, asunto, descripcion, userId)
    return this.crear(usuarioId, tipo, asunto, descripcion);
  },

  async responderPqr(id, respuesta, estado = 'RESUELTO') {
    return this.responder(id, respuesta, estado);
  },

  async deletePqr(id) {
    return this.eliminar(id);
  }
};

module.exports = SoporteModel;