-- ========================================================
-- SCRIPT DE BASE DE DATOS UNIFICADA: portal_academico
-- Estándar de Seguridad: ISO/IEC 27001 (Hashes Bcrypt)
-- ========================================================

CREATE DATABASE IF NOT EXISTS portal_academico CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE portal_academico;

-- 1. TABLA: usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('ADMIN', 'DOCENTE', 'ESTUDIANTE') NOT NULL DEFAULT 'ESTUDIANTE',
  activo TINYINT(1) DEFAULT 1,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. TABLA: programas
CREATE TABLE IF NOT EXISTS programas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  facultad VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

-- 3. TABLA: periodos_academicos
CREATE TABLE IF NOT EXISTS periodos_academicos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(20) NOT NULL,
  activo TINYINT(1) DEFAULT 1
) ENGINE=InnoDB;

-- 4. TABLA: materias
CREATE TABLE IF NOT EXISTS materias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  creditos INT NOT NULL DEFAULT 3,
  programa_id INT NOT NULL,
  docente_id INT NULL,
  FOREIGN KEY (programa_id) REFERENCES programas(id) ON DELETE CASCADE,
  FOREIGN KEY (docente_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 5. TABLA: matriculas
CREATE TABLE IF NOT EXISTS matriculas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  estudiante_id INT NOT NULL,
  materia_id INT NOT NULL,
  periodo_id INT NOT NULL,
  estado ENUM('ACTIVA', 'CANCELADA', 'FINALIZADA') DEFAULT 'ACTIVA',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (estudiante_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE,
  FOREIGN KEY (periodo_id) REFERENCES periodos_academicos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. TABLA: notas
CREATE TABLE IF NOT EXISTS notas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  matricula_id INT NOT NULL UNIQUE,
  corte1 DECIMAL(3,2) DEFAULT 0.00,
  corte2 DECIMAL(3,2) DEFAULT 0.00,
  corte3 DECIMAL(3,2) DEFAULT 0.00,
  nota_final DECIMAL(3,2) DEFAULT 0.00,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (matricula_id) REFERENCES matriculas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. TABLA: evaluaciones_docente
CREATE TABLE IF NOT EXISTS evaluaciones_docente (
  id INT AUTO_INCREMENT PRIMARY KEY,
  estudiante_id INT NOT NULL,
  docente_id INT NOT NULL,
  puntaje INT NOT NULL,
  comentarios TEXT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (estudiante_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (docente_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. TABLA: pqrs
CREATE TABLE IF NOT EXISTS pqrs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  tipo ENUM('PETICION', 'QUEJA', 'RECLAMO', 'SUGERENCIA') NOT NULL,
  asunto VARCHAR(150) NOT NULL,
  descripcion TEXT NOT NULL,
  estado ENUM('PENDIENTE', 'EN_PROCESO', 'RESUELTO', 'RECHAZADO') DEFAULT 'PENDIENTE',
  respuesta TEXT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ========================================================
-- POBLADO DE DATOS (Contraseña para todos: 123456)
-- ========================================================

-- Insertar Usuarios con IDs correctos (1 al 4)
INSERT INTO usuarios (id, nombre, email, password_hash, rol, activo) VALUES
(1, 'Administrador General', 'admin@instituto.edu.co', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6L6532mE18m14vmu', 'ADMIN', 1),
(2, 'Dr. Roberto Gómez', 'roberto.gomez@instituto.edu.co', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6L6532mE18m14vmu', 'DOCENTE', 1),
(3, 'Carlos Daniel Martínez', 'carlos.estudiante@instituto.edu.co', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6L6532mE18m14vmu', 'ESTUDIANTE', 1),
(4, 'Laura Sofia Rios', 'laura.estudiante@instituto.edu.co', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6L6532mE18m14vmu', 'ESTUDIANTE', 1)
ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash);

-- Programas
INSERT INTO programas (id, codigo, nombre, facultad) VALUES
(1, 'ING-SIST', 'Ingeniería de Sistemas', 'Facultad de Ingeniería'),
(2, 'LIC-MAT', 'Licenciatura en Matemáticas', 'Facultad de Educación')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- Periodo Académico
INSERT INTO periodos_academicos (id, nombre, activo) VALUES
(1, '2026-1', 1)
ON DUPLICATE KEY UPDATE activo = VALUES(activo);

-- Materias (Asignadas al Docente ID 2)
INSERT INTO materias (id, codigo, nombre, creditos, programa_id, docente_id) VALUES
(1, 'SIS-101', 'Arquitectura de Software', 4, 1, 2),
(2, 'SIS-102', 'Bases de Datos Avanzadas', 3, 1, 2),
(3, 'MAT-201', 'Cálculo Multivariable', 4, 2, 2)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- Matrículas (Estudiantes 3 y 4)
INSERT INTO matriculas (id, estudiante_id, materia_id, periodo_id, estado) VALUES
(1, 3, 1, 1, 'ACTIVA'), -- Carlos cursa Arquitectura
(2, 3, 2, 1, 'ACTIVA'), -- Carlos cursa Bases de Datos
(3, 4, 1, 1, 'ACTIVA')  -- Laura cursa Arquitectura
ON DUPLICATE KEY UPDATE estado = VALUES(estado);

-- Notas
INSERT INTO notas (id, matricula_id, corte1, corte2, corte3, nota_final) VALUES
(1, 1, 4.50, 4.00, 0.00, 2.55),
(2, 2, 3.80, 4.20, 0.00, 2.40),
(3, 3, 5.00, 4.80, 0.00, 2.94)
ON DUPLICATE KEY UPDATE corte1 = VALUES(corte1);

-- PQRS
INSERT INTO pqrs (id, usuario_id, tipo, asunto, descripcion, estado, respuesta) VALUES
(1, 3, 'PETICION', 'Certificado de Estudio', 'Solicito la expedición de certificado del periodo 2026-1.', 'EN_PROCESO', 'Su solicitud fue recibida y se encuentra en trámite.')
ON DUPLICATE KEY UPDATE estado = VALUES(estado);