/**
 * @file soporteController.js
 * @location ms-soporte/controllers/soporteController.js
 */

const SoporteModel = require("../models/soporteModel");

// Función auxiliar para extraer el payload del token si no vienen cabeceras
function parseJwtPayload(authHeader) {
  if (!authHeader) return null;
  try {
    const token = authHeader.split(" ")[1];
    if (!token) return null;
    const base64Payload = token.split(".")[1];
    return JSON.parse(Buffer.from(base64Payload, "base64").toString("utf-8"));
  } catch (e) {
    return null;
  }
}

const SoporteController = {
  async getPqrs(req, res) {
    try {
      let userId = req.headers["x-user-id"];
      let userRole = req.headers["x-user-role"];

      // Fallback si no vinieron los headers del gateway
      if (!userId) {
        const decoded = parseJwtPayload(req.headers["authorization"]);
        if (decoded) {
          userId = decoded.id || decoded.usuario_id || decoded.sub;
          userRole = decoded.rol || decoded.role;
        }
      }

      if (!userId) {
        return res.status(401).json({ mensaje: "Usuario no autenticado" });
      }

      const roleUpper = (userRole || "ESTUDIANTE").toUpperCase();

      let pqrs = [];
      if (roleUpper === "ADMIN") {
        pqrs = await SoporteModel.getAllPqrs();
      } else {
        pqrs = await SoporteModel.getPqrsByUsuario(userId);
      }

      return res.json({ pqrs, userRole: roleUpper });
    } catch (error) {
      console.error("[ms-soporte getPqrs Error]:", error);
      return res.status(500).json({ mensaje: "Error al consultar las PQRS", error: error.message });
    }
  },

  async createPqr(req, res) {
    try {
      let userId = req.headers["x-user-id"];

      if (!userId) {
        const decoded = parseJwtPayload(req.headers["authorization"]);
        if (decoded) {
          userId = decoded.id || decoded.usuario_id || decoded.sub;
        }
      }

      if (!userId) {
        return res.status(401).json({ mensaje: "Usuario no autenticado" });
      }

      const { tipo, asunto, descripcion } = req.body || {};
      if (!tipo || !asunto || !descripcion) {
        return res.status(400).json({ mensaje: "Campos requeridos incompletos" });
      }

      const pqrId = await SoporteModel.createPqr(userId, tipo.toUpperCase(), asunto.trim(), descripcion.trim());
      return res.status(201).json({ mensaje: "PQR creada correctamente", pqrId });
    } catch (error) {
      console.error("[ms-soporte createPqr Error]:", error);
      return res.status(500).json({ mensaje: "Error al registrar la PQR", error: error.message });
    }
  },

  async responderPqr(req, res) {
    try {
      let userRole = req.headers["x-user-role"];

      if (!userRole) {
        const decoded = parseJwtPayload(req.headers["authorization"]);
        if (decoded) {
          userRole = decoded.rol || decoded.role;
        }
      }

      const roleUpper = (userRole || "").toUpperCase();
      const { id } = req.params;
      const { respuesta, estado } = req.body || {};

      if (roleUpper !== "ADMIN") {
        return res.status(403).json({ mensaje: "No tiene permisos para responder solicitudes" });
      }

      if (!respuesta || !respuesta.trim()) {
        return res.status(400).json({ mensaje: "La respuesta no puede estar vacía" });
      }

      const actualizada = await SoporteModel.responderPqr(id, respuesta.trim(), estado || "RESUELTO");
      if (!actualizada) {
        return res.status(404).json({ mensaje: "PQR no encontrada" });
      }

      return res.json({ mensaje: "PQR respondida correctamente" });
    } catch (error) {
      console.error("[ms-soporte responderPqr Error]:", error);
      return res.status(500).json({ mensaje: "Error al procesar la respuesta", error: error.message });
    }
  },

  async deletePqr(req, res) {
    try {
      let userRole = req.headers["x-user-role"];

      if (!userRole) {
        const decoded = parseJwtPayload(req.headers["authorization"]);
        if (decoded) {
          userRole = decoded.rol || decoded.role;
        }
      }

      const roleUpper = (userRole || "").toUpperCase();
      const { id } = req.params;

      if (roleUpper !== "ADMIN") {
        return res.status(403).json({ mensaje: "No tiene permisos para eliminar registros" });
      }

      const eliminada = await SoporteModel.deletePqr(id);
      if (!eliminada) {
        return res.status(404).json({ mensaje: "PQR no encontrada" });
      }

      return res.json({ mensaje: "PQR eliminada correctamente" });
    } catch (error) {
      console.error("[ms-soporte deletePqr Error]:", error);
      return res.status(500).json({ mensaje: "Error al eliminar la PQR", error: error.message });
    }
  }
};

module.exports = SoporteController;