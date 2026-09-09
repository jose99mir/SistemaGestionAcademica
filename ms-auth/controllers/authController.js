/**
 * @file Auth Controller
 * @location ms-auth/controllers/authController.js
 */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");

class AuthController {
  // ==========================================
  // AUTENTICACIÓN
  // ==========================================
  
  static async login(req, res) {
    try {
      const { email, password, rol } = req.body || {};

      if (!email || !password || !rol) {
        return res.status(400).json({ error: "El correo, la contraseña y el rol son obligatorios" });
      }

      const cleanEmail = String(email).trim().toLowerCase();
      const cleanPassword = String(password).trim();
      const cleanRol = String(rol).trim();

      const user = await UserModel.findByEmailAndRole(cleanEmail, cleanRol);

      if (!user) {
        const usuarioExiste = await UserModel.findByEmail(cleanEmail);
        if (usuarioExiste) {
          return res.status(401).json({ error: `El usuario existe pero no tiene asignado el rol de ${cleanRol}` });
        }
        return res.status(401).json({ error: "Credenciales inválidas" });
      }

      const isActivo = user.activo === true || user.activo === 1 || user.activo === "1";
      if (!isActivo) {
        return res.status(401).json({ error: "El usuario se encuentra inactivo" });
      }

      let isMatch = false;

      // ✅ 1. Validar contra Hash Bcrypt
      if (user.password_hash && user.password_hash.startsWith("$2")) {
        try {
          isMatch = await bcrypt.compare(cleanPassword, user.password_hash);
        } catch (err) {
          console.error("--> [ms-auth BCRYPT ERROR]:", err.message);
        }
      } 
      // ✅ 2. Soporte exclusivo para contraseñas heredadas sin encriptar
      else if (user.password_hash && cleanPassword === user.password_hash) {
        isMatch = true;
      }

      if (!isMatch) {
        return res.status(401).json({ error: "Credenciales inválidas" });
      }

      const secret = process.env.JWT_SECRET || "secreto_super_seguro";
      const token = jwt.sign(
        { id: user.id, email: user.email, rol: user.rol, nombre: user.nombre },
        secret,
        { expiresIn: "8h" }
      );

      const userData = { id: user.id, nombre: user.nombre || "Usuario", email: user.email, rol: user.rol };

      return res.json({
        mensaje: "Autenticación exitosa",
        token,
        usuario: userData,
        user: userData,
        nombre: userData.nombre,
        rol: userData.rol
      });

    } catch (error) {
      console.error("--> [ms-auth LOGIN ERROR]:", error);
      return res.status(500).json({ error: "Error interno del servidor", detalle: error.message });
    }
  }

  static async verify(req, res) {
    res.json({ status: "OK", message: "Token válido" });
  }

  // ==========================================
  // GESTIÓN DE USUARIOS (CRUD)
  // ==========================================

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
      const { nombre, email, password, roles } = req.body || {};

      if (!nombre || !email || !password) {
        return res.status(400).json({ error: "Nombre, email y contraseña son obligatorios" });
      }

      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "El correo electrónico ya se encuentra registrado" });
      }

      const hash = await bcrypt.hash(password, 10);
      await UserModel.createUser(nombre.trim(), email.trim().toLowerCase(), hash, roles);

      return res.json({ mensaje: "Usuario creado correctamente" });
    } catch (error) {
      console.error("--> [ms-auth CREATE USER ERROR]:", error);
      return res.status(500).json({ error: "Error al crear usuario", detalle: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre, email, password, activo, roles } = req.body || {};

      // 1. Caso de uso: Actualizar exclusivamente la contraseña
      if (password && !nombre && !email) {
        if (password.trim().length < 6) {
          return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
        }
        const passwordHash = await bcrypt.hash(password.trim(), 10);
        await UserModel.updatePasswordOnly(id, passwordHash);
        return res.json({ mensaje: "Contraseña actualizada correctamente" });
      }

      // 2. Caso de uso: Actualización normal de perfil
      if (!nombre || !email) {
        return res.status(400).json({ error: "Nombre y email son obligatorios" });
      }

      let passwordHash = null;
      if (password && password.trim().length > 0) {
        passwordHash = await bcrypt.hash(password.trim(), 10);
      }

      await UserModel.updateUser(id, nombre.trim(), email.trim().toLowerCase(), passwordHash, activo, roles);
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

module.exports = AuthController;