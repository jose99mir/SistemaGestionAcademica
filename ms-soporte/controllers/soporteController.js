/**
 * @file Soporte Controller - ms-soporte
 * @description Lógica de negocio para radicación y resolución de PQRS.
 * @iso ISO/IEC 25010 - Mantenibilidad
 */

const SoporteModel = require("../models/soporteModel");

class SoporteController {
  static async registrarPqrs(req, res) {
    const { usuario_id, tipo, asunto, descripcion } = req.body || {};

    if (!usuario_id || !tipo || !asunto || !descripcion) {
      return res.status(400).json({ error: "Campos requeridos: usuario_id, tipo, asunto, descripcion" });
    }

    try {
      const id = await SoporteModel.createPqrs({ usuario_id, tipo, asunto, descripcion });
      return res.status(201).json({ id, mensaje: "Solicitud PQRS radicada exitosamente" });
    } catch (err) {
      return res.status(500).json({ error: "Error al radicar PQRS", detalle: err.message });
    }
  }

  static async listAll(req, res) {
    try {
      const solicitudes = await SoporteModel.findAll();
      return res.json(solicitudes);
    } catch (err) {
      return res.status(500).json({ error: "Error al consultar las PQRS", detalle: err.message });
    }
  }

  static async getByUsuario(req, res) {
    const { usuario_id } = req.params;
    try {
      const solicitudes = await SoporteModel.findByUsuario(usuario_id);
      return res.json(solicitudes);
    } catch (err) {
      return res.status(500).json({ error: "Error al consultar historial de PQRS", detalle: err.message });
    }
  }

  static async responder(req, res) {
    const { id } = req.params;
    const { estado, respuesta } = req.body || {};

    if (!respuesta) {
      return res.status(400).json({ error: "El campo 'respuesta' es obligatorio" });
    }

    try {
      const updated = await SoporteModel.responderPqrs(id, { estado, respuesta });
      if (!updated) {
        return res.status(404).json({ error: "Solicitud PQRS no encontrada" });
      }
      return res.json({ mensaje: "Respuesta registrada y ticket actualizado" });
    } catch (err) {
      return res.status(500).json({ error: "Error al actualizar PQRS", detalle: err.message });
    }
  }
}

module.exports = SoporteController;