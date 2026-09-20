/**
 * @file Auth & Users Routes
 * @location ms-auth/routes/authRoutes.js
 * @description Mapea los endpoints de autenticación y gestión de usuarios.
 */

const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");
const UserController = require("../controllers/userController");

// ==========================================
// RUTAS DE AUTENTICACIÓN
// ==========================================
router.post("/login", AuthController.login);
router.get("/verify", AuthController.verify);

// ==========================================
// RUTAS DE GESTIÓN DE USUARIOS (CRUD)
// ==========================================
router.get("/users", UserController.list);
router.post("/users", UserController.create);
router.put("/users/:id", UserController.update);
router.delete("/users/:id", UserController.delete);

module.exports = router;