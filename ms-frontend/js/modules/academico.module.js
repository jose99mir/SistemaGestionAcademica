/**
 * @file Academico Module - Frontend
 * @description Módulo cliente para la gestión de asignaturas y matrículas.
 */

import { AuthModule } from './auth.module.js';

export const AcademicoModule = {
  async getMaterias() {
    const res = await fetch('/api/academico/materias', {
      headers: { 'Authorization': `Bearer ${AuthModule.getToken()}` }
    });
    return res.json();
  },

  async getMatriculas(estudianteId) {
    const res = await fetch(`/api/academico/matriculas/${estudianteId}`, {
      headers: { 'Authorization': `Bearer ${AuthModule.getToken()}` }
    });
    return res.json();
  },

  async matricular(materiaId, estudianteId) {
    const res = await fetch('/api/academico/matriculas', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AuthModule.getToken()}`
      },
      body: JSON.stringify({ materia_id: materiaId, estudiante_id: estudianteId })
    });
    return res.json();
  }
};