/**
 * @file Soporte Model - ms-soporte
 * @description Operaciones en base de datos para solicitudes de PQRS.
 * @iso ISO/IEC 27001 - Trazabilidad e Integridad de la Información
 */

const pool = require("../config/database");

class SoporteModel {
  /**
   * Crea una nueva solicitud PQRS
   */
  static async createPqrs({ usuario_id, tipo, asunto, descripcion }) {
    const query = `
      INSERT INTO pqrs (usuario_id, tipo, asunto, descripcion, estado)
      VALUES (?, ?, ?, ?, 'PENDIENTE')
    `;
    const [result] = await pool.execute(query, [usuario_id, tipo, asunto, descripcion]);
    return result.insertId;
  }

  /**
   * Obtiene la lista completa de solicitudes (uso Administrativo)
   */
  static async findAll() {
    const query = `
      SELECT 
        p.id, p.tipo, p.asunto, p.descripcion, p.estado, p.respuesta, p.creado_en,
        u.nombre AS usuario_nombre, u.email AS usuario_email, u.rol AS usuario_rol
      FROM pqrs p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      ORDER BY p.creado_en DESC
    `;
    const [rows] = await pool.execute(query);
    return rows;
  }

  /**
   * Obtiene las solicitudes de un usuario específico
   * @param {number} usuarioId 
   */
  static async findByUsuario(usuarioId) {
    const query = `
      SELECT id, tipo, asunto, descripcion, estado, respuesta, creado_en
      FROM pqrs
      WHERE usuario_id = ?
      ORDER BY creado_en DESC
    `;
    const [rows] = await pool.execute(query, [usuarioId]);
    return rows;
  }

  /**
   * Responde y actualiza el estado de una PQRS
   */
  static async responderPqrs(id, { estado, respuesta }) {
    const query = `
      UPDATE pqrs 
      SET estado = ?, respuesta = ?
      WHERE id = ?
    `;
    const [result] = await pool.execute(query, [estado || 'RESUELTO', respuesta, id]);
    return result.affectedRows > 0;
  }
}

module.exports = SoporteModel;