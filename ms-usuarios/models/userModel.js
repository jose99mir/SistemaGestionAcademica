/**
 * @file User Model - ms-usuarios
 * @description Capa de datos para consultar y gestionar la tabla usuarios y sus perfiles asociados.
 * @iso ISO/IEC 27001 - Integridad de Datos
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

  static async findByDocumento(documento) {
    const query = `
      SELECT id, tipo_documento, documento, nombre, email, password_hash, activo 
      FROM usuarios 
      WHERE documento = ? 
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [documento]);
    if (!rows.length) return null;
    return { ...rows[0], activo: Boolean(rows[0].activo) };
  }

  static async getAllUsers() {
    const query = `
      SELECT 
        u.id, 
        u.tipo_documento,
        u.documento,
        u.nombre, 
        u.email, 
        u.activo,
        GROUP_CONCAT(r.nombre SEPARATOR ', ') AS roles,
        GROUP_CONCAT(r.id SEPARATOR ',') AS roles_ids
      FROM usuarios u
      LEFT JOIN usuario_rol ur ON u.id = ur.usuario_id AND ur.activo = 1
      LEFT JOIN roles r ON ur.rol_id = r.id
      GROUP BY u.id
      ORDER BY u.id DESC
    `;
    const [rows] = await pool.execute(query);
    return rows;
  }

  static async getAllRoles() {
    const [rows] = await pool.execute("SELECT id, nombre FROM roles ORDER BY id ASC");
    return rows;
  }

  static async createUser(tipoDocumento, documento, nombre, email, passwordHash, roleIds) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [resUser] = await connection.execute(
        "INSERT INTO usuarios (tipo_documento, documento, nombre, email, password_hash, activo) VALUES (?, ?, ?, ?, ?, 1)",
        [tipoDocumento, documento, nombre, email, passwordHash]
      );
      const userId = resUser.insertId;

      if (Array.isArray(roleIds) && roleIds.length > 0) {
        for (const roleId of roleIds) {
          await connection.execute(
            "INSERT INTO usuario_rol (usuario_id, rol_id, activo) VALUES (?, ?, 1)",
            [userId, Number(roleId)]
          );
        }
      }

      await connection.commit();
      return userId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async updateUser(id, tipoDocumento, documento, nombre, email, passwordHash, activo, roleIds) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      if (passwordHash) {
        await connection.execute(
          "UPDATE usuarios SET tipo_documento = ?, documento = ?, nombre = ?, email = ?, password_hash = ?, activo = ? WHERE id = ?",
          [tipoDocumento, documento, nombre, email, passwordHash, activo ? 1 : 0, id]
        );
      } else {
        await connection.execute(
          "UPDATE usuarios SET tipo_documento = ?, documento = ?, nombre = ?, email = ?, activo = ? WHERE id = ?",
          [tipoDocumento, documento, nombre, email, activo ? 1 : 0, id]
        );
      }

      await connection.execute("DELETE FROM usuario_rol WHERE usuario_id = ?", [id]);

      if (Array.isArray(roleIds) && roleIds.length > 0) {
        for (const roleId of roleIds) {
          await connection.execute(
            "INSERT INTO usuario_rol (usuario_id, rol_id, activo) VALUES (?, ?, 1)",
            [id, Number(roleId)]
          );
        }
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async updatePasswordOnly(id, passwordHash) {
    const [result] = await pool.execute(
      "UPDATE usuarios SET password_hash = ? WHERE id = ?",
      [passwordHash, id]
    );
    return result.affectedRows > 0;
  }

  static async deleteUser(id) {
    const [result] = await pool.execute("DELETE FROM usuarios WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
}

module.exports = UserModel;