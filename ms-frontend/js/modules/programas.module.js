/**
 * @file Programas Module - Frontend
 * @location ms-frontend/js/modules/programas.module.js
 * @description Gestión de programas académicos vía API Gateway (ms-academico).
 */

import { AuthModule } from './auth.module.js';

export const ProgramasModule = {
  /**
   * Obtiene la lista completa de programas académicos.
   */
  async getProgramas() {
    const res = await fetch('/api/academico/programas', {
      headers: { 
        'Authorization': `Bearer ${AuthModule.getToken()}` 
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.mensaje || 'Error al obtener programas');
    return data.programas || data;
  },

  /**
   * Crea un nuevo programa académico.
   * @param {Object} payload { codigo, nombre, facultad }
   */
  async createPrograma(payload) {
    const res = await fetch('/api/academico/programas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AuthModule.getToken()}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.mensaje || 'Error al crear el programa');
    return data;
  },

  /**
   * Actualiza un programa existente.
   */
  async updatePrograma(id, payload) {
    const res = await fetch(`/api/academico/programas/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AuthModule.getToken()}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.mensaje || 'Error al actualizar el programa');
    return data;
  },

  /**
   * Inactiva/Elimina un programa académico.
   */
  async deletePrograma(id) {
    const res = await fetch(`/api/academico/programas/${id}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${AuthModule.getToken()}` 
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.mensaje || 'Error al eliminar el programa');
    return data;
  }
};

export default ProgramasModule;