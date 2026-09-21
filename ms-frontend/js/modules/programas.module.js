/**
 * @file Programas Module - Frontend
 * @location ms-frontend/js/modules/programas.module.js
 * @description Gestión de programas académicos vía API Gateway (ms-academico) y control del DOM.
 */

import { AuthModule } from './auth.module.js';
import { PaginationHelper } from './pagination.component.js';

export const ProgramasModule = {
  pagination: null,

  // --- INICIALIZACIÓN ---
  init() {
    // Instanciar el helper si no existe
    this.pagination = new PaginationHelper({
      containerId: 'programs-pagination',
      rowsPerPage: 5,
      onPageChange: () => this.renderTable()
    });

    this.initEvents();
    this.loadData();
  },

  // --- REGISTRO DE EVENTOS DEL DOM ---
  initEvents() {
    document.getElementById('btn-open-program-create')?.addEventListener('click', () => this.openProgramModal());
    document.getElementById('btn-close-program-modal')?.addEventListener('click', () => this.closeProgramModal());

    document.getElementById('programForm')?.addEventListener('submit', (e) => this.handleProgramFormSubmit(e));

    const tbody = document.getElementById('programs-table-body');
    if (tbody) {
      tbody.onclick = (e) => {
        const btnEdit = e.target.closest('.btn-edit');
        const btnDelete = e.target.closest('.btn-delete');

        if (btnEdit) {
          const program = JSON.parse(btnEdit.dataset.program);
          this.openEditProgramModal(program);
        } else if (btnDelete) {
          const id = btnDelete.dataset.id;
          this.deleteProgram(id);
        }
      };
    }
  },

  // --- PETICIONES HTTP ---
  async getProgramas() {
    const res = await fetch('/api/academico/programas', {
      headers: { 'Authorization': `Bearer ${AuthModule.getToken()}` }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.mensaje || 'Error al obtener programas');
    return data;
  },

  async createPrograma(payload) {
    const res = await fetch('/api/academico/programas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AuthModule.getToken()}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.mensaje || 'Error al crear el programa');
    return data;
  },

  async updatePrograma(id, payload) {
    const res = await fetch(`/api/academico/programas/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AuthModule.getToken()}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.mensaje || 'Error al actualizar el programa');
    return data;
  },

  async deletePrograma(id) {
    const res = await fetch(`/api/academico/programas/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${AuthModule.getToken()}` }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.mensaje || 'Error al eliminar el programa');
    return data;
  },

  // --- CARGA Y RENDERIZADO ---
  async loadData() {
    try {
      const responseData = await this.getProgramas();
      
      let lista = [];
      if (Array.isArray(responseData)) {
        lista = responseData;
      } else if (responseData && Array.isArray(responseData.programas)) {
        lista = responseData.programas;
      } else if (responseData && Array.isArray(responseData.data)) {
        lista = responseData.data;
      }
      
      this.pagination.setData(lista);
      this.renderTable();
    } catch (err) {
      console.error('Error al cargar datos:', err);
      this.showMainAlert(err.message, true);
    }
  },

  renderTable() {
    const tbody = document.getElementById('programs-table-body');
    if (!tbody) return;

    // Asegurar re-asociación del contenedor en el DOM actual
    if (this.pagination) {
      this.pagination.container = document.getElementById('programs-pagination');
    }

    const paginatedPrograms = this.pagination.getPaginatedData();

    if (!paginatedPrograms.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center">No existen programas registrados.</td></tr>';
      this.pagination.render();
      return;
    }

    tbody.innerHTML = paginatedPrograms.map(p => {
      const isActivo = p.activo !== undefined ? p.activo : true;
      const statusBadge = isActivo 
        ? '<span class="badge-active">Activo</span>' 
        : '<span class="badge-inactive">Inactivo</span>';

      const programJson = JSON.stringify(p).replace(/'/g, "&apos;");

      return `
        <tr>
          <td>${p.id}</td>
          <td><b>${p.codigo || 'N/A'}</b></td>
          <td>${p.nombre}</td>
          <td>${p.facultad || 'N/A'}</td>
          <td>${statusBadge}</td>
          <td>
            <button class="action-btn btn-edit" data-program='${programJson}' title="Editar"><i class="fa-solid fa-pen-to-square"></i></button>
            <button class="action-btn btn-delete" data-id="${p.id}" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>
      `;
    }).join('');

    this.pagination.render();
  },

  // --- CONTROL DE MODALES ---
  openProgramModal() {
    this.hideModalAlert();
    const form = document.getElementById('programForm');
    if (form) form.reset();
    
    const idInput = document.getElementById('programId');
    if (idInput) idInput.value = '';

    const title = document.getElementById('programModalTitle');
    if (title) title.innerText = 'Crear Nuevo Programa';

    const statusContainer = document.getElementById('programStatusContainer');
    if (statusContainer) statusContainer.style.display = 'none';

    const modal = document.getElementById('programModal');
    if (modal) modal.style.display = 'flex';
  },

  openEditProgramModal(program) {
    this.hideModalAlert();
    const form = document.getElementById('programForm');
    if (form) form.reset();

    const title = document.getElementById('programModalTitle');
    if (title) title.innerText = 'Editar Programa';

    document.getElementById('programId').value = program.id;
    document.getElementById('programCode').value = program.codigo || '';
    document.getElementById('programName').value = program.nombre || '';
    document.getElementById('programFacultad').value = program.facultad || '';
    
    const statusContainer = document.getElementById('programStatusContainer');
    if (statusContainer) statusContainer.style.display = 'block';

    const activeCheckbox = document.getElementById('programActive');
    if (activeCheckbox) activeCheckbox.checked = Boolean(program.activo);

    const modal = document.getElementById('programModal');
    if (modal) modal.style.display = 'flex';
  },

  closeProgramModal() {
    this.hideModalAlert();
    const modal = document.getElementById('programModal');
    if (modal) modal.style.display = 'none';
  },

  // --- MANEJADORES DE FORMULARIOS Y ACCIONES ---
  async handleProgramFormSubmit(e) {
    e.preventDefault();
    this.hideModalAlert();

    const id = document.getElementById('programId').value;
    const payload = {
      codigo: document.getElementById('programCode').value,
      nombre: document.getElementById('programName').value,
      facultad: document.getElementById('programFacultad').value,
      activo: document.getElementById('programActive') ? document.getElementById('programActive').checked : true
    };

    try {
      if (id) {
        await this.updatePrograma(id, payload);
        this.showMainAlert('Programa actualizado exitosamente');
      } else {
        await this.createPrograma(payload);
        this.showMainAlert('Programa creado exitosamente');
      }
      this.closeProgramModal();
      this.loadData();
    } catch (err) {
      this.showModalAlert(err.message, true);
    }
  },

  async deleteProgram(id) {
    if (!confirm('¿Está seguro de que desea inactivar este programa?')) return;
    try {
      await this.deletePrograma(id);
      this.showMainAlert('Programa inactivado exitosamente');
      this.loadData();
    } catch (err) {
      this.showMainAlert(err.message, true);
    }
  },

  // --- CAJAS DE ALERTA Y MENSAJES ---
  showModalAlert(msg, isError = false) {
    const alertBox = document.getElementById('program-modal-alert');
    if (!alertBox) return;
    alertBox.innerText = msg;
    alertBox.className = `alert-box ${isError ? 'alert-error' : 'alert-success'}`;
    alertBox.style.display = 'block';
  },

  hideModalAlert() {
    const alertBox = document.getElementById('program-modal-alert');
    if (alertBox) alertBox.style.display = 'none';
  },

  showMainAlert(msg, isError = false) {
    const alertBox = document.getElementById('main-program-alert');
    if (!alertBox) return;
    alertBox.innerText = msg;
    alertBox.className = `alert-box ${isError ? 'alert-error' : 'alert-success'}`;
    alertBox.style.display = 'block';
    setTimeout(() => { if (alertBox) alertBox.style.display = 'none'; }, 4000);
  }
};

export default ProgramasModule;