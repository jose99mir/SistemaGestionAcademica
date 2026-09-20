/**
 * @file Programa Model
 * @location ms-academico/models/programaModel.js
 */

const pool = require("../config/database");

class ProgramaModel {
  // Obtener todos los programas (o solo los activos si soloActivos = true)
  static async getAll(soloActivos = false) {
    let query = "SELECT id, codigo, nombre, facultad, activo FROM programas";
    if (soloActivos) {
      query += " WHERE activo = 1";
    }
    query += " ORDER BY id DESC";

    const [rows] = await pool.execute(query);
    return rows.map(r => ({ ...r, activo: Boolean(r.activo) }));
  }

  // Buscar programa por ID
  static async getById(id) {
    const query = "SELECT id, codigo, nombre, facultad, activo FROM programas WHERE id = ? LIMIT 1";
    const [rows] = await pool.execute(query, [id]);
    if (!rows.length) return null;
    return { ...rows[0], activo: Boolean(rows[0].activo) };
  }

  // Buscar programa por código (para evitar duplicados)
  static async getByCodigo(codigo) {
    const query = "SELECT id FROM programas WHERE LOWER(codigo) = LOWER(?) LIMIT 1";
    const [rows] = await pool.execute(query, [codigo]);
    return rows.length ? rows[0] : null;
  }

  // Crear un nuevo programa
  static async create(codigo, nombre, facultad) {
    const query = "INSERT INTO programas (codigo, nombre, facultad, activo) VALUES (?, ?, ?, 1)";
    const [result] = await pool.execute(query, [codigo, nombre, facultad]);
    return result.insertId;
  }

  // Actualizar un programa
  static async update(id, codigo, nombre, facultad, activo) {
    const query = `
      UPDATE programas 
      SET codigo = ?, nombre = ?, facultad = ?, activo = ? 
      WHERE id = ?
    `;
    const [result] = await pool.execute(query, [
      codigo, 
      nombre, 
      facultad, 
      activo ? 1 : 0, 
      id
    ]);
    return result.affectedRows > 0;
  }

  // Borrado Lógico: Inactivar programa (NO elimina de la base de datos)
  static async inactivate(id) {
    const query = "UPDATE programas SET activo = 0 WHERE id = ?";
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = ProgramaModel;