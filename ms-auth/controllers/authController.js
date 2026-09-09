const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

class AuthController {
  static async login(req, res) {
    try {
      const { email, password } = req.body || {};

      if (!email || !password) {
        return res.status(400).json({ error: "Email y contraseña son requeridos" });
      }

      const cleanEmail = String(email).trim().toLowerCase();
      const cleanPassword = String(password).trim();

      const [rows] = await pool.execute(
        "SELECT id, nombre, email, password_hash, rol, activo FROM usuarios WHERE LOWER(email) = ?",
        [cleanEmail]
      );

      if (rows.length === 0) {
        return res.status(401).json({ error: "Credenciales inválidas" });
      }

      const user = rows[0];

      if (!user.activo) {
        return res.status(401).json({ error: "Usuario inactivo" });
      }

      const isMatch = await bcrypt.compare(cleanPassword, user.password_hash);
      console.log(`--> [HASH MATCH RESULT]: ${isMatch}`);

      if (!isMatch) {
        return res.status(401).json({ error: "Credenciales inválidas" });
      }

      const secret = process.env.JWT_SECRET || "secreto_super_seguro";
      const token = jwt.sign(
        { id: user.id, email: user.email, rol: user.rol, nombre: user.nombre },
        secret,
        { expiresIn: "8h" }
      );

      const userData = {
        id: user.id,
        nombre: user.nombre || "Usuario",
        email: user.email,
        rol: user.rol
      };

      return res.json({
        mensaje: "Autenticación exitosa",
        token,
        usuario: userData,
        user: userData,
        nombre: userData.nombre,
        rol: userData.rol
      });

    } catch (error) {
      console.error("--> [ERROR IN LOGIN]:", error);
      return res.status(500).json({ 
        error: "Error interno del servidor", 
        detalle: error.message 
      });
    }
  }

  static async verify(req, res) {
    res.json({ status: "OK", message: "Token válido" });
  }
}

module.exports = AuthController;