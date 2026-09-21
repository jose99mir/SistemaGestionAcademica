/**
 * @file notas.module.js
 * @description Módulo dinámico para la gestión de notas por rol.
 */

import { AuthModule } from './auth.module.js';
import { PaginationHelper } from './pagination.component.js';

export const NotasModule = {
  paginationMaterias: null,
  planillaData: [],
  selectedMateria: null,

  async init() {
    window.NotasModule = this;
    const user = AuthModule.getUser() || {};

    if (user.rol === 'ESTUDIANTE') {
      document.getElementById('notas-admin-docente-view').style.display = 'none';
      document.getElementById('notas-estudiante-view').style.display = 'block';

      this.bindEventsEstudiante();
      await this.loadPeriodosEstudianteCombo();
      await this.loadNotasEstudiante();
    } else {
      document.getElementById('notas-admin-docente-view').style.display = 'block';
      document.getElementById('notas-estudiante-view').style.display = 'none';

      this.paginationMaterias = new PaginationHelper({
        containerId: 'notas-materias-pagination',
        rowsPerPage: 5,
        onPageChange: () => this.renderMateriasTable()
      });

      this.bindEventsDocente();
      await this.loadPeriodosCombo();
      await this.loadMateriasDocente();
    }
  },

  bindEventsDocente() {
    document.getElementById('select-notas-periodo-filtro')?.addEventListener('change', () => this.loadMateriasDocente());
    document.getElementById('btn-close-planilla-modal')?.addEventListener('click', () => this.closePlanillaModal());
    document.getElementById('btn-save-planilla-notas')?.addEventListener('click', () => this.savePlanillaNotas());
  },

  bindEventsEstudiante() {
    document.getElementById('select-estudiante-periodo-filtro')?.addEventListener('change', () => this.loadNotasEstudiante());
  },

  closeDetalleEstudianteModal() {
    const modal = document.getElementById('modalDetalleNotaEstudiante');
    if (modal) modal.style.display = 'none';
  },

  closePlanillaModal() {
    const modal = document.getElementById('modalPlanillaNotas');
    if (modal) modal.style.display = 'none';
  },

  // Puebla el combo del estudiante trayendo SÓLO los periodos donde tiene materias matriculadas
  async loadPeriodosEstudianteCombo() {
    try {
      const user = AuthModule.getUser() || {};
      const res = await fetch('/api/academico/notas/estudiante/periodos', {
        headers: {
          'Authorization': `Bearer ${AuthModule.getToken()}`,
          'x-user-id': user.id || ''
        }
      });

      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

      const periodos = await res.json();
      const selectFiltro = document.getElementById('select-estudiante-periodo-filtro');

      if (selectFiltro) {
        selectFiltro.innerHTML = '<option value="">-- Todos los Periodos --</option>' +
          (Array.isArray(periodos) ? periodos : []).map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');
      }
    } catch (err) {
      console.error('Error cargando los periodos del estudiante:', err.message);
    }
  },

  async loadPeriodosCombo() {
    try {
      const res = await fetch('/api/academico/periodos', {
        headers: { 'Authorization': `Bearer ${AuthModule.getToken()}` }
      });
      
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

      const data = await res.json();
      const periodos = Array.isArray(data) ? data : (data.data || []);

      const selectFiltro = document.getElementById('select-notas-periodo-filtro');
      if (selectFiltro) {
        selectFiltro.innerHTML = '<option value="">-- Todos los Periodos --</option>' +
          periodos.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');
      }
    } catch (err) {
      console.error('Error cargando periodos:', err.message);
    }
  },

  async loadMateriasDocente() {
    try {
      const user = AuthModule.getUser() || {};
      const periodoId = document.getElementById('select-notas-periodo-filtro')?.value || '';

      let url = '/api/academico/notas/docente/materias';
      if (periodoId) url += `?periodoId=${periodoId}`;

      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${AuthModule.getToken()}`,
          'x-user-id': user.id || '',
          'x-user-role': user.rol || ''
        }
      });

      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

      const data = await res.json();
      const list = Array.isArray(data) ? data : [];

      this.paginationMaterias.setData(list);
      this.renderMateriasTable();
    } catch (err) {
      console.error('Error cargando asignaturas para calificaciones:', err.message);
    }
  },

  renderMateriasTable() {
    const tbody = document.getElementById('notas-materias-table-body');
    if (!tbody) return;

    const items = this.paginationMaterias.getPaginatedData();

    if (!items.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding: 20px; color: var(--muted);">No se encontraron asignaturas con alumnos matriculados.</td></tr>`;
      this.paginationMaterias.render();
      return;
    }

    tbody.innerHTML = items.map(item => `
      <tr>
        <td><b>${item.materiaCodigo || ''}</b></td>
        <td>${item.materiaNombre}</td>
        <td>${item.periodoNombre}</td>
        <td>${item.profesorNombre || 'Sin Profesor'}</td>
        <td class="text-center"><span class="badge-role">${item.totalEstudiantes} Alumnos</span></td>
        <td class="text-center">
          <button type="button" class="action-btn btn-edit" onclick="window.NotasModule.openPlanilla(${item.materiaId}, ${item.periodoId}, '${item.materiaNombre}', '${item.periodoNombre}')" title="Ingresar Calificaciones">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
        </td>
      </tr>
    `).join('');

    this.paginationMaterias.render();
  },

  async openPlanilla(materiaId, periodoId, materiaNombre, periodoNombre) {
    try {
      this.selectedMateria = { materiaId, periodoId };
      document.getElementById('planillaModalTitle').innerText = materiaNombre;
      document.getElementById('planillaModalSub').innerText = `Periodo Académico: ${periodoNombre}`;

      const res = await fetch(`/api/academico/notas/docente/planilla/${materiaId}/${periodoId}`, {
        headers: { 'Authorization': `Bearer ${AuthModule.getToken()}` }
      });

      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

      const data = await res.json();
      this.planillaData = Array.isArray(data) ? data : [];

      this.renderGridPlanilla();
      document.getElementById('modalPlanillaNotas').style.display = 'flex';
    } catch (err) {
      console.error('Error al abrir planilla:', err.message);
    }
  },

  renderGridPlanilla() {
    const tbody = document.getElementById('gridPlanillaBody');
    if (!tbody) return;

    if (this.planillaData.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding: 15px; color: var(--muted);">No hay alumnos matriculados activos.</td></tr>`;
      return;
    }

    tbody.innerHTML = this.planillaData.map((e, index) => `
      <tr>
        <td><b>${e.documento || 'S/D'}</b></td>
        <td>${e.estudianteNombre}</td>
        <td class="text-center">
          <input type="number" step="0.1" min="0" max="5" class="input-full" style="margin:0; text-align:center;" 
            value="${e.corte1}" onchange="window.NotasModule.updateNotaMemory(${index}, 'corte1', this.value)">
        </td>
        <td class="text-center">
          <input type="number" step="0.1" min="0" max="5" class="input-full" style="margin:0; text-align:center;" 
            value="${e.corte2}" onchange="window.NotasModule.updateNotaMemory(${index}, 'corte2', this.value)">
        </td>
        <td class="text-center">
          <input type="number" step="0.1" min="0" max="5" class="input-full" style="margin:0; text-align:center;" 
            value="${e.corte3}" onchange="window.NotasModule.updateNotaMemory(${index}, 'corte3', this.value)">
        </td>
        <td class="text-center">
          <b id="definitiva-${index}" style="color: var(--navy); font-size: 1rem;">${Number(e.notaFinal).toFixed(1)}</b>
        </td>
      </tr>
    `).join('');
  },

  updateNotaMemory(index, corteKey, value) {
    const val = parseFloat(value) || 0;
    this.planillaData[index][corteKey] = val;

    const c1 = this.planillaData[index].corte1 || 0;
    const c2 = this.planillaData[index].corte2 || 0;
    const c3 = this.planillaData[index].corte3 || 0;

    const notaFinal = (c1 * 0.3) + (c2 * 0.3) + (c3 * 0.4);
    this.planillaData[index].notaFinal = parseFloat(notaFinal.toFixed(1));

    const elementDef = document.getElementById(`definitiva-${index}`);
    if (elementDef) elementDef.innerText = this.planillaData[index].notaFinal.toFixed(1);
  },

  async savePlanillaNotas() {
    try {
      const payload = this.planillaData.map(e => ({
        matriculaId: e.matriculaId,
        corte1: e.corte1,
        corte2: e.corte2,
        corte3: e.corte3,
        notaFinal: e.notaFinal
      }));

      const res = await fetch('/api/academico/notas/docente/guardar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AuthModule.getToken()}`
        },
        body: JSON.stringify({ notas: payload })
      });

      if (!res.ok) throw new Error('Error al guardar las calificaciones');

      alert('Calificaciones guardadas exitosamente.');
      this.closePlanillaModal();
    } catch (err) {
      alert(err.message);
    }
  },

  async loadNotasEstudiante() {
    try {
      const user = AuthModule.getUser() || {};
      const periodoId = document.getElementById('select-estudiante-periodo-filtro')?.value || '';

      let url = '/api/academico/notas/estudiante';
      if (periodoId) url += `?periodoId=${periodoId}`;

      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${AuthModule.getToken()}`,
          'x-user-id': user.id || ''
        }
      });

      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

      const data = await res.json();
      const list = Array.isArray(data) ? data : [];

      this.renderVistaEstudiante(list);
    } catch (err) {
      console.error('Error cargando historial de notas:', err.message);
    }
  },

renderVistaEstudiante(list) {
    const container = document.getElementById('estudiante-periodos-container');
    if (!container) return;

    if (!Array.isArray(list) || list.length === 0) {
      container.innerHTML = `<div class="card" style="text-align: center; padding: 30px; color: var(--muted);">No tiene asignaturas registradas para el periodo seleccionado.</div>`;
      return;
    }

    // Obtener el periodo seleccionado en el filtro desplegable
    const selectFiltro = document.getElementById('select-estudiante-periodo-filtro');
    const periodoSeleccionadoId = selectFiltro ? selectFiltro.value : '';

    const periodosMap = new Map();
    list.forEach(item => {
      const pNombre = item.periodoNombre || 'Periodo Sin Nombre';
      if (!periodosMap.has(pNombre)) {
        periodosMap.set(pNombre, []);
      }
      periodosMap.get(pNombre).push(item);
    });

    let html = '';

    // Si el usuario seleccionó "Todos los Periodos" (value vacío ''), mostramos un título global general
    if (!periodoSeleccionadoId) {
      html += `
        <div style="margin-bottom: 25px;">
          <h4 style="font-size: 1.1rem; color: var(--navy); margin-bottom: 12px; font-weight: 700; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-layer-group" style="color: var(--primary-color);"></i> Todos los Periodos Académicos
          </h4>
        </div>
      `;
    }

    // Agrupación y renderizado de las tarjetas por cada periodo
    periodosMap.forEach((materias, periodoNombre) => {
      html += `
        <div style="margin-bottom: 25px;">
          <!-- Se muestra el título individual del periodo si hay filtro seleccionado o como subtítulo si son todos -->
          <h4 style="font-size: 1.05rem; color: var(--navy); margin-bottom: 12px; font-weight: 700; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-calendar-check" style="color: var(--primary-color);"></i> ${periodoNombre}
          </h4>

          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 15px;">
            ${materias.map(m => `
              <div class="materia-bubble-card" onclick="window.NotasModule.openDetalleEstudiante('${m.materiaNombre}', '${m.materiaCodigo}', ${m.corte1},${m.corte2}, ${m.corte3},${m.notaFinal})" 
                   style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; cursor: pointer; transition: all 0.2s ease-in-out; box-shadow: 0 2px 4px rgba(0,0,0,0.03);">
                
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                  <span style="font-size: 0.75rem; font-weight: 700; color: var(--muted); text-transform: uppercase;">${m.materiaCodigo || 'ASIG'}</span>
                  <span class="badge-role" style="font-size: 0.7rem;">${m.creditos} Créditos</span>
                </div>

                <h5 style="margin: 0 0 12px 0; font-size: 1rem; color: var(--navy); font-weight: 700; line-height: 1.3;">${m.materiaNombre}</h5>

                <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 8px 12px; border-radius: 8px;">
                  <span style="font-size: 0.8rem; font-weight: 600; color: var(--muted);">Definitiva:</span>
                  <span style="font-size: 1.2rem; font-weight: 800; color: ${m.notaFinal >= 3.0 ? '#10b981' : '#ef4444'};">
                    ${Number(m.notaFinal).toFixed(1)}
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  openDetalleEstudiante(nombre, codigo, c1, c2, c3, final) {
    document.getElementById('modalEstudianteMateriaNombre').innerText = nombre;
    document.getElementById('modalEstudianteMateriaCodigo').innerText = `Código: ${codigo || 'S/C'}`;

    document.getElementById('detCorte1').innerText = Number(c1).toFixed(1);
    document.getElementById('detCorte2').innerText = Number(c2).toFixed(1);
    document.getElementById('detCorte3').innerText = Number(c3).toFixed(1);
    document.getElementById('detNotaFinal').innerText = Number(final).toFixed(1);

    document.getElementById('modalDetalleNotaEstudiante').style.display = 'flex';
  },

  // Llena el selector únicamente con los periodos en los que el estudiante tiene matrículas
async loadPeriodosEstudianteCombo() {
    try {
      const user = AuthModule.getUser() || {};
      const userId = user.id || user.usuario_id || user.sub;

      if (!userId) {
        console.warn('No se encontró ID de usuario logueado en AuthModule.');
        return;
      }

      const res = await fetch('/api/academico/notas/estudiante/periodos', {
        headers: {
          'Authorization': `Bearer ${AuthModule.getToken()}`,
          'x-user-id': String(userId)
        }
      });

      if (!res.ok) {
        throw new Error(`Error en servidor: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      console.log('DEBUG FRONTEND - Datos recibidos del backend:', data);

      // Extrae la lista tanto si viene como arreglo directo [] o envuelta en { data: [] }
      const periodos = Array.isArray(data) ? data : (data.data || []);

      // Intentar obtener el elemento del DOM
      let selectFiltro = document.getElementById('select-estudiante-periodo-filtro');

      // Si por timing aún no existe en el DOM, esperar 100ms
      if (!selectFiltro) {
        await new Promise(resolve => setTimeout(resolve, 100));
        selectFiltro = document.getElementById('select-estudiante-periodo-filtro');
      }

      if (selectFiltro) {
        if (periodos.length === 0) {
          selectFiltro.innerHTML = '<option value="">-- Sin Periodos Matriculados --</option>';
        } else {
          // Asegura mapear las claves 'id' y 'nombre' devueltas por MySQL
          const optionsHtml = '<option value="">-- Todos los Periodos --</option>' +
            periodos.map(p => `<option value="${p.id}">${p.nombre || p.periodo_nombre || p.id}</option>`).join('');
          
          selectFiltro.innerHTML = optionsHtml;
        }
      } else {
        console.error('El elemento #select-estudiante-periodo-filtro no existe en la vista HTML.');
      }
    } catch (err) {
      console.error('Error cargando los periodos del estudiante:', err.message);
    }
  },

  // Consulta el historial académico filtrado
  async loadNotasEstudiante() {
    try {
      const user = AuthModule.getUser() || {};
      const periodoId = document.getElementById('select-estudiante-periodo-filtro')?.value || '';

      let url = '/api/academico/notas/estudiante';
      if (periodoId) url += `?periodoId=${periodoId}`;

      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${AuthModule.getToken()}`,
          'x-user-id': user.id || ''
        }
      });

      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

      const data = await res.json();
      const list = Array.isArray(data) ? data : [];

      this.renderVistaEstudiante(list);
    } catch (err) {
      console.error('Error cargando historial de notas:', err.message);
    }
  }

};

export default NotasModule;