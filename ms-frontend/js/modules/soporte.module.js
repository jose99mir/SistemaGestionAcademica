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
    window.SoporteModule = this;

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
      this.showMainAlert(err.message, true);
    }
  },

  renderTable() {
    const tbody = document.getElementById('pqr-table-body');
    if (!tbody) return;

    const data = this.pagination.getPaginatedData();
    const isAdmin = this.currentUserRole === 'ADMIN';

    if (!data.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center" style="padding: 20px; color: var(--muted);">No hay registros de solicitudes disponibles.</td></tr>';
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
    this.hideAlerts();
    document.getElementById('createPqrForm').reset();
    document.getElementById('createPqrModal').style.display = 'flex';
  },

  closeCreateModal() {
    this.hideAlerts();
    document.getElementById('createPqrModal').style.display = 'none';
  },

  openViewModal(pqr) {
    this.hideAlerts();
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
    this.hideAlerts();
    document.getElementById('viewPqrModal').style.display = 'none';
  },

  async handleCreateSubmit(e) {
    e.preventDefault();
    this.hideAlerts();

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

      // 1. Cierra el modal de inmediato
      this.closeCreateModal();

      // 2. Muestra la alerta de éxito en la vista principal
      this.showMainAlert('Solicitud PQR enviada exitosamente');

      // 3. Recarga los datos en segundo plano
      this.loadPqrs();

    } catch (err) {
      // Si falla la petición, la alerta de error se muestra DENTRO del modal
      this.showModalAlert('create-pqr-alert', err.message, true);
    }
  },

  async handleAdminSubmit(e) {
    e.preventDefault();
    this.hideAlerts();

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

      // 1. Cierra el modal de lectura/respuesta de inmediato
      this.closeViewModal();

      // 2. Muestra la alerta de éxito en la vista principal
      this.showMainAlert('Respuesta enviada correctamente');

      // 3. Recarga los datos en segundo plano
      this.loadPqrs();

    } catch (err) {
      // Si falla la petición, la alerta de error se muestra DENTRO del modal de visualización
      this.showModalAlert('view-pqr-alert', err.message, true);
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

      this.showMainAlert('Registro PQR eliminado exitosamente');
      this.loadPqrs();
    } catch (err) {
      this.showMainAlert(err.message, true);
    }
  },

  // ==========================================
  // CAJAS DE ALERTA Y MENSAJES (Mismo comportamiento que los demás módulos)
  // ==========================================

  showMainAlert(msg, isError = false) {
    const alertBox = document.getElementById('soporte-main-alert');
    if (!alertBox) return;
    alertBox.innerText = msg;
    alertBox.className = `alert-box ${isError ? 'alert-error' : 'alert-success'}`;
    alertBox.style.display = 'block';
    setTimeout(() => { alertBox.style.display = 'none'; }, 4000);
  },

  showModalAlert(elementId, msg, isError = false) {
    const alertBox = document.getElementById(elementId);
    if (!alertBox) return;
    alertBox.innerText = msg;
    alertBox.className = `alert-box ${isError ? 'alert-error' : 'alert-success'}`;
    alertBox.style.display = 'block';
  },

  hideAlerts() {
    const bMain = document.getElementById('soporte-main-alert');
    const bCreate = document.getElementById('create-pqr-alert');
    const bView = document.getElementById('view-pqr-alert');
    if (bMain) bMain.style.display = 'none';
    if (bCreate) bCreate.style.display = 'none';
    if (bView) bView.style.display = 'none';
  }
};

export default SoporteModule;