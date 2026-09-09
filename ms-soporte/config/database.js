/**
 * @file Database Configuration - ms-soporte
 * @description Conexión MySQL aislada para la gestión del módulo de PQRS.
 * @iso ISO/IEC 25010 - Mantenibilidad
 */

const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  user: process.env.DB_USER || "admin",
  password: process.env.DB_PASSWORD || "admin123",
  database: process.env.DB_NAME || "portal_academico",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;