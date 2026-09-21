/**
 * @file Asignatura Model
 * @description Estructura de la tabla 'asignaturas' en ms-academico.
 */

/* 
Estructura SQL de referencia:
CREATE TABLE asignaturas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  creditos INT NOT NULL DEFAULT 3,
  programa_id INT NULL,
  docente_id INT NULL,
  docente_email VARCHAR(120) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
*/

export class Asignatura {
  constructor({ id, codigo, nombre, creditos, programa_id, docente_id, docente_email }) {
    this.id = id;
    this.codigo = codigo;
    this.nombre = nombre;
    this.creditos = creditos;
    this.programaId = programa_id;
    this.docenteId = docente_id;
    this.docenteEmail = docente_email;
  }
}