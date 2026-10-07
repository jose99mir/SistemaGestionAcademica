/**
 * @file Soporte Module
 * @location ms-frontend/js/modules/soporte.module.js
 * @description Lógica del lado del cliente para cargar y gestionar las PQRS.
 */

import { PaginationHelper } from './pagination.component.js';

export const SoporteModule = {
  pagination: null,
  currentUserRole: null,

  init() {
    if (!this.pagination) {
      this.pagination = new PaginationHelper({
        containerId: 'pqr-pagination',
        rowsPerPage: 5,
        onPageChange: () => this.renderTable()
      });
    }

    this.bindEvents();
    this.loadPqrs();
  },

  bindEvents() {
    document.getElementById('btn-open-create-pqr')?.addEventListener('click', () => this.openCreateModal());
    document.getElementById('btn-close-create-modal')?.addEventListener('click', () => this.closeCreateModal());
    document.getElementById('btn-close-view-modal')?.addEventListener('click', () => this.closeViewModal());

    document.getElementById('createPqrForm')?.addEventListener('submit', (e) => this.handleCreateSubmit(e));
    document.getElementById('adminResponseForm')?.addEventListener('submit', (e) => this.handleAdminSubmit(e));

    const tbody = document.getElementById('pqr-table-body');
    if (tbody) {
      tbody.onclick = (e) => {
        const btnView = e.target.closest('.btn-view');
        const btnDelete = e.target.closest('.btn-delete');

        if (btnView) {
          const item = JSON.parse(btnView.dataset.pqr);
          this.openViewModal(item);
        } else if (btnDelete) {
          const id = btnDelete.dataset.id;
          this.handleDelete(id);
        }
      };
    }
  },

  async fetchPqrs() {
    const res = await fetch('/api/soporte', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Error al obtener la lista de PQRS');
    return data;
  },

  async loadPqrs() {
    try {
      const response = await this.fetchPqrs();
      this.currentUserRole = response.userRole;
      this.pagination.setData(response.pqrs || []);
      this.renderTable();
    } catch (err) {
      this.showAlert('soporte-main-alert', err.message);
    }
  },

  renderTable() {
    const tbody = document.getElementById('pqr-table-body');
    if (!tbody) return;

    const data = this.pagination.getPaginatedData();
    const isAdmin = this.currentUserRole === 'ADMIN';

    if (!data.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay registros de solicitudes disponibles.</td></tr>';
      this.pagination.render();
      return;
    }

    tbody.innerHTML = data.map(p => {
      const fecha = new Date(p.creado_en).toLocaleDateString('es-CO');
      const pqrJson = JSON.stringify(p).replace(/'/g, "&apos;");

      let badge = '<span class="badge-role" style="background:#fef3c7; color:#92400e;">PENDIENTE</span>';
      if (p.estado === 'RESUELTO') {
        badge = '<span class="badge-active">RESUELTO</span>';
      } else if (p.estado === 'RECHAZADO') {
        badge = '<span class="badge-inactive">RECHAZADO</span>';
      } else if (p.estado === 'EN_PROCESO') {
        badge = '<span class="badge-role" style="background:#e0f2fe; color:#0369a1;">EN PROCESO</span>';
      }

      return `
        <tr>
          <td>${p.id}</td>
          <td><b>${p.tipo_documento || 'CC'} ${p.documento || ''}</b></td>
          <td><span class="badge-role">${p.tipo}</span></td>
          <td>${p.asunto}</td>
          <td>${fecha}</td>
          <td>${badge}</td>
          <td>
            <button class="action-btn btn-edit btn-view" data-pqr='${pqrJson}' title="Ver o Responder">
              <i class="fa-solid fa-eye"></i>
            </button>
            ${isAdmin ? `<button class="action-btn btn-delete" data-id="${p.id}" title="Eliminar"><i class="fa-solid fa-trash"></i></button>` : ''}
          </td>
        </tr>
      `;
    }).join('');

    this.pagination.render();
  },

  openCreateModal() {
    this.hideAlert('create-pqr-alert');
    document.getElementById('createPqrForm').reset();
    document.getElementById('createPqrModal').style.display = 'flex';
  },

  closeCreateModal() {
    this.hideAlert('create-pqr-alert');
    document.getElementById('createPqrModal').style.display = 'none';
  },

  openViewModal(pqr) {
    this.hideAlert('view-pqr-alert');
    document.getElementById('viewPqrTitle').innerText = `PQR #${pqr.id} - ${pqr.tipo}`;
    document.getElementById('viewPqrUser').innerText = `${pqr.usuario_nombre} (${pqr.tipo_documento || 'CC'} ${pqr.documento})`;
    document.getElementById('viewPqrAsunto').innerText = pqr.asunto;
    document.getElementById('viewPqrDescripcion').innerText = pqr.descripcion;

    const isAdmin = this.currentUserRole === 'ADMIN';
    const userContainer = document.getElementById('userResponseContainer');
    const adminContainer = document.getElementById('adminResponseFormContainer');

    if (isAdmin) {
      userContainer.style.display = 'none';
      adminContainer.style.display = 'block';
      document.getElementById('adminPqrId').value = pqr.id;
      document.getElementById('adminRespuestaText').value = pqr.respuesta || '';
      document.getElementById('adminPqrEstado').value = pqr.estado === 'PENDIENTE' ? 'RESUELTO' : pqr.estado;
    } else {
      adminContainer.style.display = 'none';
      userContainer.style.display = 'block';

      const respBox = document.getElementById('viewPqrRespuesta');
      if (pqr.respuesta && pqr.respuesta.trim()) {
        respBox.style.background = '#ecfdf5';
        respBox.style.border = '1px solid #a7f3d0';
        respBox.style.color = '#065f46';
        respBox.innerText = pqr.respuesta;
      } else {
        respBox.style.background = '#fffbeb';
        respBox.style.border = '1px solid #fde68a';
        respBox.style.color = '#92400e';
        respBox.innerHTML = '<i class="fa-solid fa-clock"></i> <i>Tu solicitud está en revisión por el área de soporte. Pronto recibirás una respuesta.</i>';
      }
    }

    document.getElementById('viewPqrModal').style.display = 'flex';
  },

  closeViewModal() {
    this.hideAlert('view-pqr-alert');
    document.getElementById('viewPqrModal').style.display = 'none';
  },

  async handleCreateSubmit(e) {
    e.preventDefault();
    this.hideAlert('create-pqr-alert');

    const body = {
      tipo: document.getElementById('pqrTipo').value,
      asunto: document.getElementById('pqrAsunto').value,
      descripcion: document.getElementById('pqrDescripcion').value
    };

    try {
      const res = await fetch('/api/soporte', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Error al guardar la PQR');

      this.closeCreateModal();
      this.loadPqrs();
    } catch (err) {
      this.showAlert('create-pqr-alert', err.message);
    }
  },

  async handleAdminSubmit(e) {
    e.preventDefault();
    this.hideAlert('view-pqr-alert');

    const id = document.getElementById('adminPqrId').value;
    const body = {
      respuesta: document.getElementById('adminRespuestaText').value,
      estado: document.getElementById('adminPqrEstado').value
    };

    try {
      const res = await fetch(`/api/soporte/${id}/responder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Error al guardar la respuesta');

      this.closeViewModal();
      this.loadPqrs();
    } catch (err) {
      this.showAlert('view-pqr-alert', err.message);
    }
  },

  async handleDelete(id) {
    if (!confirm('¿Confirmas la eliminación de este registro de PQR?')) return;

    try {
      const res = await fetch(`/api/soporte/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Error al eliminar la PQR');

      this.loadPqrs();
    } catch (err) {
      this.showAlert('soporte-main-alert', err.message);
    }
  },

  showAlert(elementId, msg) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.innerText = msg;
    el.style.display = 'block';
  },

  hideAlert(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.style.display = 'none';
  }
};

export default SoporteModule;