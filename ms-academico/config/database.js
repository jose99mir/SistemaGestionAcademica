/**
 * @file Database Configuration - ms-academico
 * @description Conexión a la base de datos unificada para gestión de materias y programas.
 * @iso ISO/IEC 25010 - Mantenibilidad y Desacoplamiento
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