/**
 * @file soporteController.js
 * @description Controlador del microservicio de soporte (PQRS).
 */

const SoporteModel = require("../models/soporteModel");

const SoporteController = {
  // GET /api/soporte/todos
  async getAll(req, res) {
    try {
      const tickets = await SoporteModel.getAll();
      return res.status(200).json(Array.isArray(tickets) ? tickets : []);
    } catch (error) {
      console.error("[SoporteController.getAll ERROR]:", error);
      return res.status(500).json({ 
        mensaje: "Error al consultar todas las PQRS en la base de datos.", 
        error: error.message 
      });
    }
  },

  // GET /api/soporte/usuario/:usuarioId
  async getByUsuario(req, res) {
    try {
      const { usuarioId } = req.params;

      // Si por alguna razon llega el valor "todos", "null" o "undefined"
      if (usuarioId === "todos" || usuarioId === "ALL") {
        const todos = await SoporteModel.getAll();
        return res.status(200).json(Array.isArray(todos) ? todos : []);
      }

      if (!usuarioId || usuarioId === "undefined" || usuarioId === "null") {
        return res.status(400).json({ mensaje: "El ID de usuario proporcionado no es válido." });
      }

      const misPqrs = await SoporteModel.getByUsuario(usuarioId);
      return res.status(200).json(Array.isArray(misPqrs) ? misPqrs : []);
    } catch (error) {
      console.error("[SoporteController.getByUsuario ERROR]:", error);
      return res.status(500).json({ 
        mensaje: "Error al consultar las PQRS del usuario.", 
        error: error.message 
      });
    }
  },

  // POST /api/soporte/
  async crear(req, res) {
    try {
      const { tipo, asunto, descripcion, usuario_id } = req.body;
      const headerUserId = req.headers["x-user-id"];
      const finalUserId = usuario_id || headerUserId;

      if (!asunto || !descripcion || !finalUserId) {
        return res.status(400).json({ mensaje: "Faltan campos obligatorios para radicar la PQR." });
      }

      const insertId = await SoporteModel.crear(tipo || "PETICION", asunto, descripcion, finalUserId);
      return res.status(201).json({ mensaje: "PQR radicada con éxito.", id: insertId });
    } catch (error) {
      console.error("[SoporteController.crear ERROR]:", error);
      return res.status(500).json({ mensaje: "Error al crear la PQR.", error: error.message });
    }
  },

  // PUT /api/soporte/responder/:id
  async responder(req, res) {
    try {
      const { id } = req.params;
      const { respuesta } = req.body;

      if (!respuesta || !respuesta.trim()) {
        return res.status(400).json({ mensaje: "Debe ingresar un texto de respuesta." });
      }

      const exito = await SoporteModel.responder(id, respuesta);
      if (!exito) {
        return res.status(404).json({ mensaje: "No se encontró el ticket especificado." });
      }

      return res.status(200).json({ mensaje: "Respuesta guardada correctamente." });
    } catch (error) {
      console.error("[SoporteController.responder ERROR]:", error);
      return res.status(500).json({ mensaje: "Error al responder la PQR.", error: error.message });
    }
  },

  // DELETE /api/soporte/:id
  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const eliminado = await SoporteModel.eliminar(id);

      if (!eliminado) {
        return res.status(404).json({ mensaje: "Ticket no encontrado." });
      }

      return res.status(200).json({ mensaje: "PQR eliminada correctamente." });
    } catch (error) {
      console.error("[SoporteController.eliminar ERROR]:", error);
      return res.status(500).json({ mensaje: "Error al eliminar la PQR.", error: error.message });
    }
  }
};

module.exports = SoporteController;