/**
 * @file Auth Routes
 * @location ms-auth/routes/authRoutes.js
 * @description Mapea los endpoints de autenticación y gestión de usuarios a AuthController.
 */

const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");

// Rutas de autenticación
router.post("/login", AuthController.login);
router.get("/verify", AuthController.verify);

// Rutas CRUD de usuarios
router.get("/users", AuthController.list);
router.post("/users", AuthController.create);
router.put("/users/:id", AuthController.update);
router.delete("/users/:id", AuthController.delete);

module.exports = router;