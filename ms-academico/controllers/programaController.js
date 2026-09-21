/**
 * @file Programa Controller
 * @location ms-auth/controllers/programaController.js
 */

const ProgramaModel = require("../models/programaModel");

class ProgramaController {
  // Listar programas
  static async list(req, res) {
    try {
      const { soloActivos } = req.query;
      const programas = await ProgramaModel.getAll(soloActivos === 'true');
      return res.json({ programas });
    } catch (error) {
      console.error("--> [PROGRAMA LIST ERROR]:", error);
      return res.status(500).json({ error: "Error al obtener programas", detalle: error.message });
    }
  }

  // Obtener un programa por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const programa = await ProgramaModel.getById(id);
      
      if (!programa) {
        return res.status(404).json({ error: "Programa no encontrado" });
      }

      return res.json({ programa });
    } catch (error) {
      console.error("--> [PROGRAMA GET ERROR]:", error);
      return res.status(500).json({ error: "Error al obtener programa", detalle: error.message });
    }
  }

  // Crear un nuevo programa
  static async create(req, res) {
    try {
      const { codigo, nombre, facultad } = req.body || {};

      if (!codigo || !nombre || !facultad) {
        return res.status(400).json({ error: "El código, nombre y facultad son obligatorios" });
      }

      const existingCode = await ProgramaModel.getByCodigo(codigo.trim());
      if (existingCode) {
        return res.status(400).json({ error: "El código del programa ya está registrado" });
      }

      const newId = await ProgramaModel.create(
        codigo.trim().toUpperCase(), 
        nombre.trim(), 
        facultad.trim()
      );

      return res.status(201).json({ 
        mensaje: "Programa creado correctamente", 
        id: newId 
      });
    } catch (error) {
      console.error("--> [PROGRAMA CREATE ERROR]:", error);
      return res.status(500).json({ error: "Error al crear programa", detalle: error.message });
    }
  }

  // Actualizar un programa
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { codigo, nombre, facultad, activo } = req.body || {};

      if (!codigo || !nombre || !facultad) {
        return res.status(400).json({ error: "El código, nombre y facultad son obligatorios" });
      }

      // Validar si el código ya lo usa otro programa
      const existingCode = await ProgramaModel.getByCodigo(codigo.trim());
      if (existingCode && existingCode.id !== Number(id)) {
        return res.status(400).json({ error: "El código ya pertenece a otro programa" });
      }

      const updated = await ProgramaModel.update(
        id, 
        codigo.trim().toUpperCase(), 
        nombre.trim(), 
        facultad.trim(), 
        activo
      );

      if (!updated) {
        return res.status(404).json({ error: "Programa no encontrado" });
      }

      return res.json({ mensaje: "Programa actualizado correctamente" });
    } catch (error) {
      console.error("--> [PROGRAMA UPDATE ERROR]:", error);
      return res.status(500).json({ error: "Error al actualizar programa", detalle: error.message });
    }
  }

  // Borrado lógico (Inactivar)
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const inactivated = await ProgramaModel.inactivate(id);

      if (!inactivated) {
        return res.status(404).json({ error: "Programa no encontrado" });
      }

      return res.json({ mensaje: "Programa inactivado correctamente" });
    } catch (error) {
      console.error("--> [PROGRAMA INACTIVATE ERROR]:", error);
      return res.status(500).json({ error: "Error al inactivar programa", detalle: error.message });
    }
   }

   async list(req, res) {
   try {
    const [rows] = await db.query("SELECT id, nombre FROM programas ORDER BY nombre ASC");
    return res.json(rows); // Retorna arreglo directo [...]
   } catch (error) {
    console.error("Error en list programas:", error);
    return res.status(500).json({ mensaje: "Error al obtener programas" });
   }
  }
}

module.exports = ProgramaController;