/**
 * @file Periodos Module - Frontend
 * @location ms-frontend/js/modules/periodos.module.js
 * @description Gestión de periodos académicos vía API Gateway (ms-academico) y control del DOM.
 */

import { AuthModule } from './auth.module.js';

export const PeriodosModule = {
  // --- INICIALIZACIÓN ---
  init() {
    this.initEvents();
    this.loadData();
  },

  // --- REGISTRO DE EVENTOS DEL DOM ---
  initEvents() {
    document.getElementById('btn-open-period-create')?.addEventListener('click', () => this.openPeriodModal());
    document.getElementById('btn-close-period-modal')?.addEventListener('click', () => this.closePeriodModal());

    document.getElementById('periodForm')?.addEventListener('submit', (e) => this.handlePeriodFormSubmit(e));

    // Delegación de eventos en la tabla
    const tbody = document.getElementById('periodos-table-body');
    if (tbody) {
      tbody.onclick = (e) => {
        const btnEdit = e.target.closest('.btn-edit');
        const btnDelete = e.target.closest('.btn-delete');

        if (btnEdit) {
          const period = JSON.parse(btnEdit.dataset.period);
          this.openEditPeriodModal(period);
        } else if (btnDelete) {
          const id = btnDelete.dataset.id;
          this.deletePeriod(id);
        }
      };
    }
  },

  // --- PETICIONES HTTP ---
  async getPeriodos() {
    const res = await fetch('/api/academico/periodos', {
      headers: { 'Authorization': `Bearer ${AuthModule.getToken()}` }
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || data?.mensaje || 'Error al obtener periodos');
    return data;
  },

  async createPeriodo(payload) {
    const res = await fetch('/api/academico/periodos', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AuthModule.getToken()}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || data?.mensaje || 'Error al crear periodo');
    return data;
  },

  async updatePeriodo(id, payload) {
    const res = await fetch(`/api/academico/periodos/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AuthModule.getToken()}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || data?.mensaje || 'Error al actualizar periodo');
    return data;
  },

  async deletePeriodo(id) {
    const res = await fetch(`/api/academico/periodos/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${AuthModule.getToken()}` }
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || data?.mensaje || 'Error al inactivar periodo');
    return data;
  },

  // --- CARGA Y RENDERIZADO ---
  async loadData() {
    try {
      const periodos = await this.getPeriodos();
      this.renderTable(periodos);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      this.showMainAlert(err.message, true);
    }
  },

  renderTable(periodos) {
    const tbody = document.getElementById('periodos-table-body');
    if (!tbody) return;

    if (!periodos || !periodos.length) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center">No existen periodos académicos registrados.</td></tr>';
      return;
    }

    tbody.innerHTML = periodos.map(p => {
      const isActivo = Boolean(p.activo);
      const statusBadge = isActivo 
        ? '<span class="badge-active">Activo</span>' 
        : '<span class="badge-inactive">Inactivo</span>';

      const periodJson = JSON.stringify(p).replace(/'/g, "&apos;");

      return `
        <tr>
          <td><b>#${p.id}</b></td>
          <td>${p.nombre}</td>
          <td>${statusBadge}</td>
          <td>
            <button class="action-btn btn-edit" data-period='${periodJson}' title="Editar"><i class="fa-solid fa-pen-to-square"></i></button>
            <button class="action-btn btn-delete" data-id="${p.id}" title="Inactivar"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>
      `;
    }).join('');
  },

  // --- CONTROL DE MODALES ---
  openPeriodModal() {
    this.hideModalAlert();
    const form = document.getElementById('periodForm');
    if (form) form.reset();

    const idInput = document.getElementById('periodId');
    if (idInput) idInput.value = '';

    const title = document.getElementById('periodModalTitle');
    if (title) title.innerText = 'Nuevo Periodo Académico';

    const statusContainer = document.getElementById('periodStatusContainer');
    if (statusContainer) statusContainer.style.display = 'none';

    const modal = document.getElementById('periodModal');
    if (modal) modal.style.display = 'flex';
  },

  openEditPeriodModal(period) {
    this.hideModalAlert();
    const form = document.getElementById('periodForm');
    if (form) form.reset();

    const title = document.getElementById('periodModalTitle');
    if (title) title.innerText = 'Editar Periodo Académico';

    document.getElementById('periodId').value = period.id;
    document.getElementById('periodName').value = period.nombre || '';

    const statusContainer = document.getElementById('periodStatusContainer');
    if (statusContainer) statusContainer.style.display = 'block';

    const activeCheckbox = document.getElementById('periodActive');
    if (activeCheckbox) activeCheckbox.checked = Boolean(period.activo);

    const modal = document.getElementById('periodModal');
    if (modal) modal.style.display = 'flex';
  },

  closePeriodModal() {
    this.hideModalAlert();
    const modal = document.getElementById('periodModal');
    if (modal) modal.style.display = 'none';
  },

  // --- MANEJADORES DE FORMULARIOS Y ACCIONES ---
  async handlePeriodFormSubmit(e) {
    e.preventDefault();
    this.hideModalAlert();

    const id = document.getElementById('periodId').value;
    const payload = {
      nombre: document.getElementById('periodName').value.trim(),
      activo: document.getElementById('periodActive') ? (document.getElementById('periodActive').checked ? 1 : 0) : 1
    };

    try {
      if (id) {
        await this.updatePeriodo(id, payload);
        this.showMainAlert('Periodo académico actualizado exitosamente');
      } else {
        await this.createPeriodo(payload);
        this.showMainAlert('Periodo académico creado exitosamente');
      }
      this.closePeriodModal();
      this.loadData();
    } catch (err) {
      this.showModalAlert(err.message, true);
    }
  },

  async deletePeriod(id) {
    if (!confirm('¿Desea inactivar este periodo académico?')) return;
    try {
      await this.deletePeriodo(id);
      this.showMainAlert('Periodo académico inactivado exitosamente');
      this.loadData();
    } catch (err) {
      this.showMainAlert(err.message, true);
    }
  },

  // --- CAJAS DE ALERTA Y MENSAJES ---
  showModalAlert(msg, isError = false) {
    const alertBox = document.getElementById('period-modal-alert');
    if (!alertBox) return;
    alertBox.innerText = msg;
    alertBox.className = `alert-box ${isError ? 'alert-error' : 'alert-success'}`;
    alertBox.style.display = 'block';
  },

  hideModalAlert() {
    const alertBox = document.getElementById('period-modal-alert');
    if (alertBox) alertBox.style.display = 'none';
  },

  showMainAlert(msg, isError = false) {
    const alertBox = document.getElementById('main-period-alert');
    if (!alertBox) return;
    alertBox.innerText = msg;
    alertBox.className = `alert-box ${isError ? 'alert-error' : 'alert-success'}`;
    alertBox.style.display = 'block';
    setTimeout(() => { if (alertBox) alertBox.style.display = 'none'; }, 4000);
  }
};

export default PeriodosModule;