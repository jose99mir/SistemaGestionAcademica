/**
 * @file soporteModel.js
 * @description Consultas MySQL para el microservicio ms-soporte.
 */

const db = require("../config/database"); // Ajusta el path a tu conexion MySQL / Pool

const SoporteModel = {
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

  async crear(tipo, asunto, descripcion, usuarioId) {
    const sql = `
      INSERT INTO pqrs (tipo, asunto, descripcion, usuario_id, estado, creado_en)
      VALUES (?, ?, ?, ?, 'PENDIENTE', NOW())
    `;
    const [result] = await db.query(sql, [tipo, asunto, descripcion, usuarioId]);
    return result.insertId;
  },

  async responder(id, respuesta) {
    const sql = `UPDATE pqrs SET respuesta = ?, estado = 'RESUELTO' WHERE id = ?`;
    const [result] = await db.query(sql, [respuesta, id]);
    return result.affectedRows > 0;
  },

  async eliminar(id) {
    const sql = `DELETE FROM pqrs WHERE id = ?`;
    const [result] = await db.query(sql, [id]);
    return result.affectedRows > 0;
  }
};

module.exports = SoporteModel;