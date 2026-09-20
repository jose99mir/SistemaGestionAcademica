/**
 * @file Periodo Académico Model
 * @location ms-academico/models/periodoModel.js
 * @description Gestión de consultas SQL para la tabla periodos_academicos.
 */

const db = require("../config/database");

const PeriodoModel = {
  async getAll() {
    const [rows] = await db.query(
      "SELECT id, nombre, activo FROM periodos_academicos ORDER BY id DESC"
    );
    return rows;
  },

  async getById(id) {
    const [rows] = await db.query(
      "SELECT id, nombre, activo FROM periodos_academicos WHERE id = ?",
      [id]
    );
    return rows[0] || null;
  },

  async create(nombre, activo = 1) {
    const [result] = await db.query(
      "INSERT INTO periodos_academicos (nombre, activo) VALUES (?, ?)",
      [nombre, activo]
    );
    return { id: result.insertId, nombre, activo };
  },

  async update(id, nombre, activo) {
    await db.query(
      "UPDATE periodos_academicos SET nombre = ?, activo = ? WHERE id = ?",
      [nombre, activo, id]
    );
    return { id, nombre, activo };
  },

  async delete(id) {
    // Inactivación lógica (activo = 0)
    await db.query(
      "UPDATE periodos_academicos SET activo = 0 WHERE id = ?",
      [id]
    );
    return { id, activo: 0 };
  }
};

module.exports = PeriodoModel;