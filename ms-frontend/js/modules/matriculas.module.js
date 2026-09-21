/**
 * @file matriculas.module.js
 * @description Módulo cliente para la gestión interactiva de matrículas.
 */

import { AuthModule } from './auth.module.js';
import { PaginationHelper } from './pagination.component.js';

export const MatriculasModule = {
  paginationMain: null,
  paginationModal: null,
  currentData: [],
  selectedEstudiantes: new Map(),

  async init() {
    window.MatriculasModule = this;

    this.paginationMain = new PaginationHelper({
      containerId: 'matriculas-pagination',
      rowsPerPage: 5,
      onPageChange: () => this.renderTable()
    });

    this.paginationModal = new PaginationHelper({
      containerId: 'modal-grid-pagination',
      rowsPerPage: 5,
      onPageChange: () => this.renderGrid()
    });

    this.bindEvents();
    await this.loadPeriodosCombo();
    await this.loadData();
  },

  bindEvents() {
    const user = AuthModule.getUser() || {};
    const isAdmin = user.rol === 'ADMIN';

    if (isAdmin) {
      const btnCreate = document.getElementById('btn-open-matricula-modal');
      if (btnCreate) {
        btnCreate.style.display = 'inline-flex';
        btnCreate.onclick = () => this.openModal();
      }

      document.getElementById('btn-close-matricula-modal')?.addEventListener('click', () => this.closeModal());
      document.getElementById('matriculaForm')?.addEventListener('submit', (e) => this.handleSubmit(e));

      const inputBusqueda = document.getElementById('inputBuscarEstudiante');
      if (inputBusqueda) {
        inputBusqueda.addEventListener('input', (e) => this.handleLiveSearch(e.target.value));
      }
    }

    document.getElementById('select-matricula-periodo-filtro')?.addEventListener('change', () => this.loadData());
  },

  async loadPeriodosCombo() {
    try {
      const res = await fetch('/api/academico/periodos', {
        headers: { 'Authorization': `Bearer ${AuthModule.getToken()}` }
      });
      const data = await res.json();
      const periodos = Array.isArray(data) ? data : (data.data || []);

      const selectFiltro = document.getElementById('select-matricula-periodo-filtro');
      const selectModal = document.getElementById('matriculaPeriodoSelect');

      const options = '<option value="">-- Seleccione Periodo --</option>' +
        periodos.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');

      if (selectFiltro) selectFiltro.innerHTML = '<option value="">-- Todos los Periodos --</option>' + options;
      if (selectModal) selectModal.innerHTML = options;
    } catch (err) {
      console.error('Error cargando periodos:', err);
    }
  },

  async loadMateriasCombo() {
    try {
      const res = await fetch('/api/academico/asignaturas', {
        headers: { 
          'Authorization': `Bearer ${AuthModule.getToken()}`,
          'x-user-role': AuthModule.getUser()?.rol 
        }
      });
      const data = await res.json();
      const materias = Array.isArray(data) ? data : [];

      const selectModal = document.getElementById('matriculaMateriaSelect');
      if (selectModal) {
        selectModal.innerHTML = '<option value="">-- Seleccione Asignatura --</option>' +
          materias.map(m => `<option value="${m.id}">${m.codigo || ''} - ${m.nombre || m.materiaNombre}</option>`).join('');
      }
    } catch (err) {
      console.error('Error cargando materias:', err);
    }
  },

  async loadData() {
    try {
      const user = AuthModule.getUser() || {};
      const periodoId = document.getElementById('select-matricula-periodo-filtro')?.value || '';

      let url = '/api/academico/matriculas';
      if (periodoId) url += `?periodoId=${periodoId}`;

      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${AuthModule.getToken()}`,
          'x-user-id': user.id || '',
          'x-user-role': user.rol || 'ADMIN'
        }
      });

      const raw = await res.json();
      this.currentData = Array.isArray(raw) ? raw : (raw.data || []);
      
      this.paginationMain.setData(this.currentData);
      this.renderTable();
    } catch (err) {
      console.error('Error cargando matriculas:', err);
    }
  },

  renderTable() {
    const tbody = document.getElementById('matriculas-table-body');
    if (!tbody) return;

    const user = AuthModule.getUser() || {};
    const isAdmin = user.rol === 'ADMIN';
    const items = this.paginationMain.getPaginatedData();

    if (!items.length) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center" style="padding: 20px; color: var(--muted);">No hay registros de matrícula.</td></tr>`;
      this.paginationMain.render();
      return;
    }

    tbody.innerHTML = items.map(item => `
      <tr>
        <td><b>${item.materiaCodigo || ''}</b> ${item.materiaNombre}</td>
        <td>${item.periodoNombre}</td>
        <td>${item.profesorNombre || 'Sin Profesor'}</td>
        <td class="text-center"><span class="badge-role">${item.totalEstudiantes} Alumnos</span></td>
        ${isAdmin ? `
          <td class="text-center">
            <button type="button" class="action-btn btn-edit" onclick="window.MatriculasModule.editItem(${item.materiaId},${item.periodoId || 0})" title="Gestionar Grupo">
              <i class="fa-solid fa-users-gear"></i>
            </button>
          </td>
        ` : ''}
      </tr>
    `).join('');

    this.paginationMain.render();
  },

  async handleLiveSearch(query) {
    const box = document.getElementById('resultadosBusquedaEstudiante');
    if (!query || query.trim().length < 2) {
      box.style.display = 'none';
      return;
    }

    try {
      const res = await fetch(`/api/academico/matriculas/estudiantes/buscar?q=${encodeURIComponent(query)}`, {
        headers: { 'Authorization': `Bearer ${AuthModule.getToken()}` }
      });
      const estudiantes = await res.json();

      if (!Array.isArray(estudiantes) || estudiantes.length === 0) {
        box.innerHTML = '<div style="padding: 10px; color: var(--muted);">No se encontraron estudiantes.</div>';
      } else {
        box.innerHTML = estudiantes.map(e => `
          <div class="search-result-item" onclick="window.MatriculasModule.addEstudianteToGrid(${e.id}, '${e.documento || 'S/D'}', '${e.nombre}', '${e.email}')">
            <b>${e.documento || 'S/D'}</b> - ${e.nombre}
          </div>
        `).join('');
      }
      box.style.display = 'block';
    } catch (err) {
      console.error('Error buscando estudiantes:', err);
    }
  },

  addEstudianteToGrid(id, documento, nombre, email, estadoMatricula = 'ACTIVA') {
    this.selectedEstudiantes.set(id, { id, documento, nombre, email, estadoMatricula });
    document.getElementById('resultadosBusquedaEstudiante').style.display = 'none';
    document.getElementById('inputBuscarEstudiante').value = '';
    
    this.updateModalPagination();
  },

  removeEstudianteFromGrid(id) {
    this.selectedEstudiantes.delete(id);
    this.updateModalPagination();
  },

  // Cambia el valor del ENUM de la matrícula ('ACTIVA', 'FINALIZADA', 'CANCELADA')
  changeEstadoMatricula(id, estado) {
    const estudiante = this.selectedEstudiantes.get(id);
    if (estudiante) {
      estudiante.estadoMatricula = estado;
      this.selectedEstudiantes.set(id, estudiante);
    }
  },

  updateModalPagination() {
    const list = Array.from(this.selectedEstudiantes.values());
    this.paginationModal.setData(list);
    this.renderGrid();
  },

  renderGrid() {
    const tbody = document.getElementById('gridEstudiantesBody');
    const countSpan = document.getElementById('countEstudiantesGrid');
    const allItems = Array.from(this.selectedEstudiantes.values());

    if (countSpan) countSpan.innerText = allItems.length;

    const pageItems = this.paginationModal.getPaginatedData();

    if (allItems.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center" style="color: var(--muted); padding: 15px;">No hay estudiantes agregados al grupo.</td></tr>`;
      this.paginationModal.render();
      return;
    }

    tbody.innerHTML = pageItems.map(e => `
      <tr>
        <td><b>${e.documento}</b></td>
        <td>${e.nombre}</td>
        <td>${e.email}</td>
        <td class="text-center">
          <select 
            class="input-full" 
            style="margin: 0; padding: 4px 8px; font-size: 0.85rem; font-weight: 600;"
            onchange="window.MatriculasModule.changeEstadoMatricula(${e.id}, this.value)"
          >
            <option value="ACTIVA" ${e.estadoMatricula === 'ACTIVA' ? 'selected' : ''}>ACTIVA</option>
            <option value="FINALIZADA" ${e.estadoMatricula === 'FINALIZADA' ? 'selected' : ''}>FINALIZADA</option>
            <option value="CANCELADA" ${e.estadoMatricula === 'CANCELADA' ? 'selected' : ''}>CANCELADA</option>
          </select>
        </td>
        <td class="text-center">
          <button type="button" class="action-btn btn-delete" onclick="window.MatriculasModule.removeEstudianteFromGrid(${e.id})">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </td>
      </tr>
    `).join('');

    this.paginationModal.render();
  },

  async openModal() {
    this.selectedEstudiantes.clear();
    await this.loadMateriasCombo();
    document.getElementById('matriculaForm').reset();
    document.getElementById('matriculaMateriaSelect').disabled = false;
    document.getElementById('matriculaPeriodoSelect').disabled = false;
    this.updateModalPagination();
    document.getElementById('matriculaModal').style.display = 'flex';
  },

  async editItem(materiaId, periodoId) {
    try {
      this.selectedEstudiantes.clear();
      await this.loadMateriasCombo();

      if (periodoId && periodoId > 0) {
        const res = await fetch(`/api/academico/matriculas/detalle/${materiaId}/${periodoId}`, {
          headers: { 'Authorization': `Bearer ${AuthModule.getToken()}` }
        });
        const matriculados = await res.json();

        if (Array.isArray(matriculados)) {
          matriculados.forEach(m => {
            this.selectedEstudiantes.set(m.estudianteId, {
              id: m.estudianteId,
              documento: m.documento || 'S/D',
              nombre: m.estudianteNombre,
              email: m.estudianteEmail,
              estadoMatricula: m.estadoMatricula || 'ACTIVA'
            });
          });
        }
      }

      document.getElementById('matriculaMateriaSelect').value = materiaId;
      document.getElementById('matriculaPeriodoSelect').value = periodoId || '';
      document.getElementById('matriculaMateriaSelect').disabled = true;
      document.getElementById('matriculaPeriodoSelect').disabled = Boolean(periodoId);

      this.updateModalPagination();
      document.getElementById('matriculaModal').style.display = 'flex';
    } catch (err) {
      console.error('Error cargando detalle para edición:', err);
    }
  },

  closeModal() {
    document.getElementById('matriculaModal').style.display = 'none';
  },

  async handleSubmit(e) {
    e.preventDefault();

    const materiaId = document.getElementById('matriculaMateriaSelect').value;
    const periodoId = document.getElementById('matriculaPeriodoSelect').value;

    const estudiantes = Array.from(this.selectedEstudiantes.values()).map(e => ({
      id: e.id,
      estadoMatricula: e.estadoMatricula || 'ACTIVA'
    }));

    if (!materiaId || !periodoId) {
      alert('Debe seleccionar Materia y Periodo');
      return;
    }

    try {
      const res = await fetch('/api/academico/matriculas/guardar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AuthModule.getToken()}`
        },
        body: JSON.stringify({ materiaId, periodoId, estudiantesIds: estudiantes })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || 'Error al guardar');

      this.closeModal();
      await this.loadData();
    } catch (err) {
      alert(err.message);
    }
  }
};

export default MatriculasModule;