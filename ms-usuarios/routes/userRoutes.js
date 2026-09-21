/**
 * @file User Routes - ms-usuarios
 * @description Mapeo de endpoints REST para la gestión de usuarios.
 */

const express = require("express");
const router = express.Router();
const UserController = require("../controllers/userController");

// ==========================================
// RUTAS DE GESTIÓN DE USUARIOS (CRUD)
// ==========================================
router.get("/users", UserController.list);
router.post("/users", UserController.create);
router.put("/users/:id", UserController.update);
router.delete("/users/:id", UserController.delete);

module.exports = router;