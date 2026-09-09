/**
 * @file User Model - ms-usuarios
 * @description Capa de datos para consultar y gestionar la tabla usuarios y sus perfiles asociados.
 * @iso ISO/IEC 27001 - Integridad de Datos
 */

const pool = require("../config/database");

class UserModel {
  /**
   * Obtiene la lista completa de usuarios (sin incluir hashes de contraseña)
   */
  static async findAll() {
    const query = `
      SELECT id, nombre, email, rol, activo, creado_en 
      FROM usuarios 
      ORDER BY id DESC
    `;
    const [rows] = await pool.execute(query);
    return rows;
  }

  /**
   * Obtiene un usuario específico por ID
   * @param {number} id 
   */
  static async findById(id) {
    const query = `
      SELECT id, nombre, email, rol, activo, creado_en 
      FROM usuarios 
      WHERE id = ? 
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [id]);
    return rows.length ? rows[0] : null;
  }

  /**
   * Crea un nuevo usuario en la base de datos
   * @param {Object} userData 
   */
  static async create({ nombre, email, rol, password_hash }) {
    const query = `
      INSERT INTO usuarios (nombre, email, rol, activo, password_hash) 
      VALUES (?, ?, ?, 1, ?)
    `;
    const [result] = await pool.execute(query, [nombre, email, rol, password_hash]);
    return result.insertId;
  }

  /**
   * Actualiza la información básica de un usuario
   * @param {number} id 
   * @param {Object} userData 
   */
  static async update(id, { nombre, email, rol, activo }) {
    const query = `
      UPDATE usuarios 
      SET nombre = ?, email = ?, rol = ?, activo = ? 
      WHERE id = ?
    `;
    const [result] = await pool.execute(query, [nombre, email, rol, activo ? 1 : 0, id]);
    return result.affectedRows > 0;
  }

  /**
   * Elimina un usuario por su ID
   * @param {number} id 
   */
  static async delete(id) {
    const query = "DELETE FROM usuarios WHERE id = ?";
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = UserModel;