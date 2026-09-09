/**
 * @file User Model
 * @description Capa de acceso a datos para la autenticación de usuarios.
 * @iso ISO/IEC 27001 - Integridad de Datos
 */

const pool = require("../config/database");

class UserModel {
  /**
   * Busca un usuario por su dirección de correo electrónico
   * @param {string} email - Correo a buscar
   * @returns {Promise<Object|null>}
   */
  static async findByEmail(email) {
    const query = `
      SELECT id, nombre, email, rol, activo, password_hash 
      FROM usuarios 
      WHERE email = ? 
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [email]);
    return rows.length ? rows[0] : null;
  }

  /**
   * Verifica y asegura que el campo password_hash exista
   */
  static async checkSchema() {
    const query = `
      SELECT COUNT(*) AS c 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'password_hash'
    `;
    const [cols] = await pool.execute(query);
    if (!Number(cols[0].c)) {
      await pool.execute("ALTER TABLE usuarios ADD COLUMN password_hash VARCHAR(255) NULL");
    }
  }

  /**
   * Asigna contraseña por defecto cifrada a usuarios sin hash
   * @param {string} defaultHash - Hash generado con bcrypt
   */
  static async updateMissingHashes(defaultHash) {
    const [rows] = await pool.execute(
      "SELECT id FROM usuarios WHERE password_hash IS NULL OR password_hash = ''"
    );
    if (rows.length) {
      for (const row of rows) {
        await pool.execute("UPDATE usuarios SET password_hash = ? WHERE id = ?", [defaultHash, row.id]);
      }
    }
  }
}

module.exports = UserModel;