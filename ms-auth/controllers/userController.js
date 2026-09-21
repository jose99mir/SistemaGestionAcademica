/**
 * @file User Controller
 * @location ms-auth/controllers/userController.js
 * @description Exclusivo para operaciones de gestión de usuarios.
 */

const bcrypt = require("bcryptjs");
const UserModel = require("../models/userModel");

class UserController {
  static async list(req, res) {
    try {
      const users = await UserModel.getAllUsers();
      const roles = await UserModel.getAllRoles();
      return res.json({ users, roles });
    } catch (error) {
      console.error("--> [ms-auth LIST USERS ERROR]:", error);
      return res.status(500).json({ error: "Error al listar usuarios", detalle: error.message });
    }
  }

  static async create(req, res) {
    try {
      const { tipo_documento, documento, nombre, email, password, roles } = req.body || {};

      if (!documento || !nombre || !email || !password) {
        return res.status(400).json({ error: "Tipo de documento, documento, nombre, email y contraseña son obligatorios" });
      }

      const existingDoc = await UserModel.findByDocumento(documento.trim());
      if (existingDoc) {
        return res.status(400).json({ error: "El número de documento ya se encuentra registrado" });
      }

      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "El correo electrónico ya se encuentra registrado" });
      }

      const tipoDocValido = ['CC', 'TI', 'CE', 'PASAPORTE'].includes(tipo_documento) ? tipo_documento : 'CC';
      const hash = await bcrypt.hash(password, 10);
      
      await UserModel.createUser(tipoDocValido, documento.trim(), nombre.trim(), email.trim().toLowerCase(), hash, roles);

      return res.json({ mensaje: "Usuario creado correctamente" });
    } catch (error) {
      console.error("--> [ms-auth CREATE USER ERROR]:", error);
      return res.status(500).json({ error: "Error al crear usuario", detalle: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { tipo_documento, documento, nombre, email, password, activo, roles } = req.body || {};

      // 1. Actualización exclusiva de contraseña
      if (password && !nombre && !email) {
        if (password.trim().length < 6) {
          return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
        }
        const passwordHash = await bcrypt.hash(password.trim(), 10);
        await UserModel.updatePasswordOnly(id, passwordHash);
        return res.json({ mensaje: "Contraseña actualizada correctamente" });
      }

      // 2. Actualización de datos del perfil
      if (!documento || !nombre || !email) {
        return res.status(400).json({ error: "Documento, nombre y email son obligatorios" });
      }

      let passwordHash = null;
      if (password && password.trim().length > 0) {
        passwordHash = await bcrypt.hash(password.trim(), 10);
      }

      const tipoDocValido = ['CC', 'TI', 'CE', 'PASAPORTE'].includes(tipo_documento) ? tipo_documento : 'CC';

      await UserModel.updateUser(id, tipoDocValido, documento.trim(), nombre.trim(), email.trim().toLowerCase(), passwordHash, activo, roles);
      return res.json({ mensaje: "Usuario actualizado correctamente" });

    } catch (error) {
      console.error("--> [ms-auth UPDATE USER ERROR]:", error);
      return res.status(500).json({ error: "Error al actualizar usuario", detalle: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      await UserModel.deleteUser(id);
      return res.json({ mensaje: "Usuario eliminado correctamente" });
    } catch (error) {
      console.error("--> [ms-auth DELETE USER ERROR]:", error);
      return res.status(500).json({ error: "Error al eliminar usuario", detalle: error.message });
    }
  }
}

module.exports = UserController;