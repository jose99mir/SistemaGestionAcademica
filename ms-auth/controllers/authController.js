/**
 * @file Auth Controller
 * @location ms-auth/controllers/authController.js
 * @description Exclusivo para la lógica de inicio de sesión y tokens.
 */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");

class AuthController {
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

      // 1. Validar contra Hash Bcrypt
      if (user.password_hash && user.password_hash.startsWith("$2")) {
        try {
          isMatch = await bcrypt.compare(cleanPassword, user.password_hash);
        } catch (err) {
          console.error("--> [ms-auth BCRYPT ERROR]:", err.message);
        }
      } 
      // 2. Soporte para contraseñas heredadas sin encriptar
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
}

module.exports = AuthController;