/**
 * @file Auth & Users Routes
 * @location ms-auth/routes/authRoutes.js
 * @description Mapea los endpoints de autenticación y gestión de usuarios.
 */

const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");

// ==========================================
// RUTAS DE AUTENTICACIÓN
// ==========================================
router.post("/login", AuthController.login);
router.get("/verify", AuthController.verify);

module.exports = router;