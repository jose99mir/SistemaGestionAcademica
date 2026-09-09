/**
 * @file Soporte Module - Frontend
 * @description Radicación y trazabilidad del módulo PQRS.
 */

import { AuthModule } from './auth.module.js';

export const SoporteModule = {
  async enviarPqrs(tipo, asunto, descripcion, usuarioId) {
    const res = await fetch('/api/soporte', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AuthModule.getToken()}`
      },
      body: JSON.stringify({ tipo, asunto, descripcion, usuario_id: usuarioId })
    });
    return res.json();
  },

  async getPqrsUsuario(usuarioId) {
    const res = await fetch(`/api/soporte/usuario/${usuarioId}`, {
      headers: { 'Authorization': `Bearer ${AuthModule.getToken()}` }
    });
    return res.json();
  }
};