/**
 * @file Periodo Académico Controller
 * @location ms-academico/controllers/periodoController.js
 * @description Lógica de negocio y manejo de peticiones HTTP para periodos académicos.
 */

const PeriodoModel = require("../models/periodoModel");

const PeriodoController = {
  async list(req, res) {
    try {
      const periodos = await PeriodoModel.getAll();
      res.json(periodos);
    } catch (error) {
      console.error("[PeriodoController.list]", error);
      res.status(500).json({ error: "Error al listar los periodos académicos" });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const periodo = await PeriodoModel.getById(id);
      if (!periodo) {
        return res.status(404).json({ error: "Periodo académico no encontrado" });
      }
      res.json(periodo);
    } catch (error) {
      console.error("[PeriodoController.getById]", error);
      res.status(500).json({ error: "Error al obtener el periodo académico" });
    }
  },

  async create(req, res) {
    try {
      const { nombre, activo } = req.body;
      if (!nombre) {
        return res.status(400).json({ error: "El nombre del periodo es obligatorio" });
      }
      const nuevoPeriodo = await PeriodoModel.create(nombre, activo ?? 1);
      res.status(201).json({ mensaje: "Periodo creado exitosamente", periodo: nuevoPeriodo });
    } catch (error) {
      console.error("[PeriodoController.create]", error);
      res.status(500).json({ error: "Error al crear el periodo académico" });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre, activo } = req.body;
      
      const periodoExistente = await PeriodoModel.getById(id);
      if (!periodoExistente) {
        return res.status(404).json({ error: "Periodo académico no encontrado" });
      }

      const periodoActualizado = await PeriodoModel.update(
        id,
        nombre ?? periodoExistente.nombre,
        activo ?? periodoExistente.activo
      );
      res.json({ mensaje: "Periodo actualizado exitosamente", periodo: periodoActualizado });
    } catch (error) {
      console.error("[PeriodoController.update]", error);
      res.status(500).json({ error: "Error al actualizar el periodo académico" });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const periodoExistente = await PeriodoModel.getById(id);
      if (!periodoExistente) {
        return res.status(404).json({ error: "Periodo académico no encontrado" });
      }

      await PeriodoModel.delete(id);
      res.json({ mensaje: "Periodo inactivado exitosamente", id });
    } catch (error) {
      console.error("[PeriodoController.delete]", error);
      res.status(500).json({ error: "Error al inactivar el periodo académico" });
    }
  }
};

module.exports = PeriodoController;