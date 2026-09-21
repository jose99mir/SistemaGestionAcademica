/**
 * @file User Model
 * @location ms-auth/models/userModel.js
 */

const pool = require("../config/database");

class UserModel {
  static async findByEmailAndRole(email, rolSeleccionado) {
    const query = `
      SELECT 
        u.id,
        u.tipo_documento,
        u.documento,
        u.nombre,
        u.email,
        u.password_hash,
        u.activo,
        r.nombre AS rol
      FROM usuarios u
      INNER JOIN usuario_rol ur ON u.id = ur.usuario_id
      INNER JOIN roles r ON ur.rol_id = r.id
      WHERE LOWER(u.email) = LOWER(?)
        AND LOWER(r.nombre) = LOWER(?)
        AND ur.activo = 1
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [email, rolSeleccionado]);
    if (!rows.length) return null;
    return { ...rows[0], activo: Boolean(rows[0].activo) };
  }

  static async findByEmail(email) {
    const query = `
      SELECT id, tipo_documento, documento, nombre, email, password_hash, activo 
      FROM usuarios 
      WHERE LOWER(email) = LOWER(?) 
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [email]);
    if (!rows.length) return null;
    return { ...rows[0], activo: Boolean(rows[0].activo) };
  }
}

module.exports = UserModel;