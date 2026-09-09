/**
 * @file User Controller - ms-usuarios
 * @description Lógica de negocio y validaciones de datos para la gestión de usuarios.
 * @iso ISO/IEC 27001 - Confidencialidad y Control de Acceso
 */

const bcrypt = require("bcryptjs");
const UserModel = require("../models/userModel");

class UserController {
  /**
   * Lista todos los usuarios
   */
  static async getAll(req, res) {
    try {
      const users = await UserModel.findAll();
      return res.json(users);
    } catch (err) {
      return res.status(500).json({ error: "Error al consultar usuarios", detalle: err.message });
    }
  }

  /**
   * Obtiene un usuario por ID
   */
  static async getById(req, res) {
    try {
      const user = await UserModel.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      return res.json(user);
    } catch (err) {
      return res.status(500).json({ error: "Error al consultar usuario", detalle: err.message });
    }
  }

  /**
   * Registra o crea un nuevo usuario cifrando su contraseña
   */
  static async create(req, res) {
    const { nombre, email, rol, password } = req.body || {};

    if (!nombre || !email || !rol) {
      return res.status(400).json({ error: "Campos requeridos: nombre, email, rol" });
    }

    try {
      const rawPassword = password || "123456";
      const password_hash = await bcrypt.hash(rawPassword, 10);

      const insertId = await UserModel.create({
        nombre,
        email: email.toLowerCase(),
        rol,
        password_hash
      });

      return res.status(201).json({
        id: insertId,
        nombre,
        email: email.toLowerCase(),
        rol,
        mensaje: "Usuario creado exitosamente"
      });
    } catch (err) {
      return res.status(500).json({ error: "Error al crear usuario", detalle: err.message });
    }
  }

  /**
   * Actualiza datos de un usuario existente
   */
  static async update(req, res) {
    const id = req.params.id;
    const { nombre, email, rol, activo } = req.body || {};

    try {
      const updated = await UserModel.update(id, { nombre, email, rol, activo });
      if (!updated) {
        return res.status(404).json({ error: "Usuario no encontrado o sin cambios" });
      }
      return res.json({ mensaje: "Usuario actualizado correctamente" });
    } catch (err) {
      return res.status(500).json({ error: "Error al actualizar usuario", detalle: err.message });
    }
  }

  /**
   * Elimina un usuario
   */
  static async delete(req, res) {
    const id = req.params.id;
    try {
      const deleted = await UserModel.delete(id);
      if (!deleted) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      return res.json({ mensaje: "Usuario eliminado correctamente" });
    } catch (err) {
      return res.status(500).json({ error: "Error al eliminar usuario", detalle: err.message });
    }
  }
}

module.exports = UserController;