const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");

// Captura login en cualquier variación de subruta que envíe el Gateway
router.post(["/login", "/auth/login", "/api/auth/login"], (req, res) => AuthController.login(req, res));

// Captura verify en cualquier variación
router.get(["/verify", "/auth/verify", "/api/auth/verify"], (req, res) => AuthController.verify(req, res));

module.exports = router;