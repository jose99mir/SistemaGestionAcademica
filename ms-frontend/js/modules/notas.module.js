/**
 * @file Notas Module - Frontend
 * @description Consulta de calificaciones por cortes y registro de evaluaciones.
 */

import { AuthModule } from './auth.module.js';

export const NotasModule = {
  async getNotasEstudiante(estudianteId) {
    const res = await fetch(`/api/notas/estudiante/${estudianteId}`, {
      headers: { 'Authorization': `Bearer ${AuthModule.getToken()}` }
    });
    return res.json();
  },

  async guardarNota(id, corte1, corte2, corte3) {
    const res = await fetch(`/api/notas/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AuthModule.getToken()}`
      },
      body: JSON.stringify({ corte1, corte2, corte3 })
    });
    return res.json();
  }
};