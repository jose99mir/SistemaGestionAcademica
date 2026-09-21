/**
 * @file Asignaturas Module - Frontend
 * @location ms-frontend/js/modules/asignaturas.module.js
 */

import { AuthModule } from './auth.module.js';
import { PaginationHelper } from './pagination.component.js';

export const AsignaturasModule = {
  pagination: null,
  currentData: [],

  async init() {
    // Exposición global para callbacks inline
    window.AsignaturasModule = this;

    this.pagination = new PaginationHelper({
      containerId: 'asignaturas-pagination',
      rowsPerPage: 5,
      onPageChange: () => this.renderTable()
    });

    const user = AuthModule.getUser() || {};
    const isEstudiante = user.rol === 'ESTUDIANTE';

    if (isEstudiante) {
      const comboCont = document.getElementById('filter-periodo-container');
      if (comboCont) comboCont.style.display = 'block';
      await this.loadPeriodosCombo();

      document.getElementById('select-periodo-filtro')?.addEventListener('change', () => {
        this.loadData();
      });
    }

    this.renderHeaderByRole(user.rol);
    this.bindEvents();
    await this.loadData();
  },

  bindEvents() {
    const user = AuthModule.getUser() || {};
    const isAdmin = user.rol === 'ADMIN';

    if (isAdmin) {
      const btnCreate = document.getElementById('btn-open-asignatura-create');
      if (btnCreate) {
        btnCreate.style.display = 'inline-flex';
        btnCreate.onclick = () => this.openModal();
      }

      const btnCancel = document.getElementById('btn-close-asignatura-modal');
      if (btnCancel) {
        btnCancel.onclick = () => this.closeModal();
      }

      const form = document.getElementById('asignaturaForm');
      if (form) {
        form.onsubmit = (e) => this.handleSubmit(e);
      }
    }
  },

  async loadPeriodosCombo() {
    try {
      const res = await fetch('/api/academico/periodos', {
        headers: { 'Authorization': `Bearer ${AuthModule.getToken()}` }
      });
      const periodos = await res.json();
      const select = document.getElementById('select-periodo-filtro');

      if (select && Array.isArray(periodos)) {
        select.innerHTML = '<option value="">-- Todos los Periodos --</option>' + 
          periodos.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');
      }
    } catch (err) {
      console.error('Error cargando periodos:', err);
    }
  },

  renderHeaderByRole(rol) {
    const thead = document.getElementById('asignaturas-table-head');
    if (!thead) return;

    if (rol === 'ESTUDIANTE') {
      thead.innerHTML = `
        <tr>
          <th>Código</th>
          <th>Materia</th>
          <th>Créditos</th>
          <th>Docente</th>
          <th>Corte 1</th>
          <th>Corte 2</th>
          <th>Corte 3</th>
          <th>Nota Final</th>
          <th>Estado</th>
        </tr>`;
    } else {
      thead.innerHTML = `
        <tr>
          <th style="width: 60px;">ID</th>
          <th style="width: 100px;">Código</th>
          <th>Asignatura</th>
          <th>Programa Académico</th>
          <th>Créditos</th>
          ${rol === 'ADMIN' ? '<th class="text-center" style="width: 100px;">Acciones</th>' : ''}
        </tr>`;
    }
  },

  async loadData() {
    try {
      const user = AuthModule.getUser() || {};
      const periodoSelect = document.getElementById('select-periodo-filtro');
      const periodoId = periodoSelect ? periodoSelect.value : '';

      let url = '/api/academico/asignaturas';
      if (periodoId) url += `?periodoId=${periodoId}`;

      const res = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${AuthModule.getToken()}`,
          'x-user-id': user.id,
          'x-user-role': user.rol,
          'x-user-email': user.email
        }
      });

      if (!res.ok) throw new Error('Error al consultar asignaturas');
      
      const data = await res.json();
      this.currentData = Array.isArray(data) ? data : [];
      this.pagination.setData(this.currentData);
      this.renderTable();
    } catch (err) {
      console.error('Error cargando asignaturas:', err);
      this.showAlert(err.message, true);
    }
  },

  renderTable() {
    const tbody = document.getElementById('asignaturas-table-body');
    if (!tbody) return;

    const user = AuthModule.getUser() || {};
    const items = this.pagination.getPaginatedData();

    if (!items.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" class="text-center" style="padding: 20px; color: var(--muted);">
            No hay asignaturas registradas.
          </td>
        </tr>`;
      this.pagination.render();
      return;
    }

    if (user.rol === 'ESTUDIANTE') {
      tbody.innerHTML = items.map(item => `
        <tr>
          <td><b>${item.codigo || 'N/A'}</b></td>
          <td>${item.materiaNombre || item.nombre}</td>
          <td>${item.creditos || 0}</td>
          <td>${item.docenteNombre || 'Sin asignar'}</td>
          <td>${item.corte1 ?? '0.00'}</td>
          <td>${item.corte2 ?? '0.00'}</td>
          <td>${item.corte3 ?? '0.00'}</td>
          <td><b>${item.notaFinal ?? '0.00'}</b></td>
          <td>
            <span class="${item.estadoMatricula === 'ACTIVA' ? 'badge-active' : 'badge-inactive'}">
              ${item.estadoMatricula || 'ACTIVA'}
            </span>
          </td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = items.map(item => `
        <tr>
          <td>${item.id}</td>
          <td><b>${item.codigo || 'N/A'}</b></td>
          <td>${item.nombre || item.materiaNombre}</td>
          <td>${item.programaNombre || 'General'}</td>
          <td><span class="badge-role">${item.creditos || 0} Créditos</span></td>
          ${user.rol === 'ADMIN' ? `
            <td class="text-center">
              <button type="button" class="action-btn btn-edit" onclick="window.AsignaturasModule.editItem(${item.id})" title="Editar">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button type="button" class="action-btn btn-delete" onclick="window.AsignaturasModule.deleteItem(${item.id})" title="Eliminar">
                <i class="fa-solid fa-trash"></i>
              </button>
            </td>
          ` : ''}
        </tr>
      `).join('');
    }

    this.pagination.render();
  },

  // --- ACCIÓN DE EDICIÓN ---
  async editItem(id) {
    try {
      this.hideAlerts();
      
      const res = await fetch(`/api/academico/asignaturas/${id}`, {
        headers: {
          'Authorization': `Bearer ${AuthModule.getToken()}`,
          'x-user-role': AuthModule.getUser()?.rol
        }
      });

      if (!res.ok) throw new Error('No se pudieron obtener los detalles de la asignatura');
      const item = await res.json();

      const form = document.getElementById('asignaturaForm');
      if (form) form.reset();
      
      const modalTitle = document.getElementById('asignaturaModalTitle');
      if (modalTitle) modalTitle.innerText = 'Editar Asignatura';

      document.getElementById('asignaturaId').value = item.id;
      document.getElementById('asignaturaCode').value = item.codigo || '';
      document.getElementById('asignaturaName').value = item.nombre || item.materiaNombre || '';
      document.getElementById('asignaturaCreditos').value = item.creditos || 3;

      if (document.getElementById('asignaturaPrograma')) {
        document.getElementById('asignaturaPrograma').value = item.programa_id || item.programaId || '';
      }

      const modal = document.getElementById('asignaturaModal');
      if (modal) modal.style.display = 'flex';

    } catch (err) {
      console.error('Error al editar asignatura:', err);
      this.showAlert(err.message, true);
    }
  },

  // --- ACCIÓN DE ELIMINACIÓN ---
  async deleteItem(id) {
    if (!confirm('¿Desea eliminar esta asignatura permanentemente?')) return;

    try {
      const res = await fetch(`/api/academico/asignaturas/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${AuthModule.getToken()}`,
          'x-user-role': AuthModule.getUser()?.rol
        }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || 'Error al eliminar');

      this.showAlert('Asignatura eliminada correctamente');
      await this.loadData();
    } catch (err) {
      this.showAlert(err.message, true);
    }
  },

  // --- CONTROL MODAL Y SUBMIT ---
  openModal() {
    this.hideAlerts();
    document.getElementById('asignaturaForm')?.reset();
    document.getElementById('asignaturaId').value = '';
    document.getElementById('asignaturaModalTitle').innerText = 'Nueva Asignatura';
    document.getElementById('asignaturaModal').style.display = 'flex';
  },

  closeModal() {
    this.hideAlerts();
    document.getElementById('asignaturaModal').style.display = 'none';
  },

  async handleSubmit(e) {
    e.preventDefault();
    this.hideAlerts();

    const id = document.getElementById('asignaturaId').value;
    const isEdit = Boolean(id);

    const payload = {
      codigo: document.getElementById('asignaturaCode').value,
      nombre: document.getElementById('asignaturaName').value,
      creditos: parseInt(document.getElementById('asignaturaCreditos').value, 10),
      programaId: document.getElementById('asignaturaPrograma')?.value || null
    };

    const url = isEdit ? `/api/academico/asignaturas/${id}` : '/api/academico/asignaturas';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AuthModule.getToken()}`,
          'x-user-role': AuthModule.getUser()?.rol
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || 'Error al guardar la asignatura');

      this.showAlert(isEdit ? 'Asignatura actualizada' : 'Asignatura creada exitosamente');
      this.closeModal();
      await this.loadData();
    } catch (err) {
      this.showModalAlert(err.message, true);
    }
  },

  // --- ALERTAS ---
  showAlert(msg, isError = false) {
    const box = document.getElementById('main-asignatura-alert');
    if (!box) return;
    box.innerText = msg;
    box.className = `alert-box ${isError ? 'alert-error' : 'alert-success'}`;
    box.style.display = 'block';
    setTimeout(() => { if (box) box.style.display = 'none'; }, 4000);
  },

  showModalAlert(msg, isError = false) {
    const box = document.getElementById('asignatura-modal-alert');
    if (!box) return;
    box.innerText = msg;
    box.className = `alert-box ${isError ? 'alert-error' : 'alert-success'}`;
    box.style.display = 'block';
  },

  hideAlerts() {
    const b1 = document.getElementById('main-asignatura-alert');
    const b2 = document.getElementById('asignatura-modal-alert');
    if (b1) b1.style.display = 'none';
    if (b2) b2.style.display = 'none';
  },
  // --- CARGA DE COMBOS (PROGRAMAS Y DOCENTES) ---
  async loadCombosOptions() {
    try {
      // 1. Cargar Programas
      const resProg = await fetch('/api/academico/programas', {
        headers: { 'Authorization': `Bearer ${AuthModule.getToken()}` }
      });
      if (resProg.ok) {
        const programas = await resProg.json();
        const selectProg = document.getElementById('asignaturaPrograma');
        if (selectProg && Array.isArray(programas)) {
          selectProg.innerHTML = '<option value="">-- Seleccione un Programa --</option>' + 
            programas.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');
        }
      }

      // 2. Cargar Docentes
      const resDoc = await fetch('/api/academico/docentes', {
        headers: { 'Authorization': `Bearer ${AuthModule.getToken()}` }
      });
      if (resDoc.ok) {
        const docentes = await resDoc.json();
        const selectDoc = document.getElementById('asignaturaDocente');
        if (selectDoc && Array.isArray(docentes)) {
          selectDoc.innerHTML = '<option value="">-- Seleccione un Profesor (Opcional) --</option>' + 
            docentes.map(d => `<option value="${d.id}">${d.nombre} (${d.email})</option>`).join('');
        }
      }
    } catch (err) {
      console.error("Error poblando comboboxes:", err);
    }
  },

  // --- ABRIR MODAL CREACIÓN ---
  async openModal() {
    this.hideAlerts();
    await this.loadCombosOptions(); // Poblar opciones antes de desplegar
    document.getElementById('asignaturaForm')?.reset();
    document.getElementById('asignaturaId').value = '';
    document.getElementById('asignaturaModalTitle').innerText = 'Nueva Asignatura';
    document.getElementById('asignaturaModal').style.display = 'flex';
  },

  // --- ABRIR MODAL EDICIÓN ---
  async editItem(id) {
    try {
      this.hideAlerts();
      await this.loadCombosOptions(); // Poblar opciones antes de seleccionar valores
      
      const res = await fetch(`/api/academico/asignaturas/${id}`, {
        headers: {
          'Authorization': `Bearer ${AuthModule.getToken()}`,
          'x-user-role': AuthModule.getUser()?.rol
        }
      });

      if (!res.ok) throw new Error('No se pudieron obtener los detalles de la asignatura');
      const item = await res.json();

      document.getElementById('asignaturaId').value = item.id;
      document.getElementById('asignaturaCode').value = item.codigo || '';
      document.getElementById('asignaturaName').value = item.nombre || item.materiaNombre || '';
      document.getElementById('asignaturaCreditos').value = item.creditos || 3;

      if (document.getElementById('asignaturaPrograma')) {
        document.getElementById('asignaturaPrograma').value = item.programa_id || item.programaId || '';
      }

      if (document.getElementById('asignaturaDocente')) {
        document.getElementById('asignaturaDocente').value = item.docente_id || item.docenteId || '';
      }

      const modalTitle = document.getElementById('asignaturaModalTitle');
      if (modalTitle) modalTitle.innerText = 'Editar Asignatura';

      const modal = document.getElementById('asignaturaModal');
      if (modal) modal.style.display = 'flex';

    } catch (err) {
      console.error('Error al editar asignatura:', err);
      this.showAlert(err.message, true);
    }
  },

  // --- SUBMIT DEL FORMULARIO ---
  async handleSubmit(e) {
    e.preventDefault();
    this.hideAlerts();

    const id = document.getElementById('asignaturaId').value;
    const isEdit = Boolean(id);

    const payload = {
      codigo: document.getElementById('asignaturaCode').value,
      nombre: document.getElementById('asignaturaName').value,
      creditos: parseInt(document.getElementById('asignaturaCreditos').value, 10),
      programaId: document.getElementById('asignaturaPrograma')?.value || null,
      docenteId: document.getElementById('asignaturaDocente')?.value || null
    };

    const url = isEdit ? `/api/academico/asignaturas/${id}` : '/api/academico/asignaturas';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AuthModule.getToken()}`,
          'x-user-role': AuthModule.getUser()?.rol
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || 'Error al guardar la asignatura');

      this.showAlert(isEdit ? 'Asignatura actualizada' : 'Asignatura creada exitosamente');
      this.closeModal();
      await this.loadData();
    } catch (err) {
      this.showModalAlert(err.message, true);
    }
  },
  // --- CARGA DE COMBOS (PROGRAMAS Y DOCENTES) ---
  async loadCombosOptions() {
    try {
      // 1. Cargar Programas Académicos
      const resProg = await fetch('/api/academico/programas', {
        headers: { 'Authorization': `Bearer ${AuthModule.getToken()}` }
      });

      if (resProg.ok) {
        const rawProg = await resProg.json();
        // Extrae el arreglo si viene directo o dentro de .data / .programas
        const programas = Array.isArray(rawProg) ? rawProg : (rawProg.data || rawProg.programas || []);
        
        const selectProg = document.getElementById('asignaturaPrograma');
        if (selectProg) {
          if (programas.length === 0) {
            selectProg.innerHTML = '<option value="">-- No hay programas registrados --</option>';
          } else {
            selectProg.innerHTML = '<option value="">-- Seleccione un Programa --</option>' + 
              programas.map(p => `<option value="${p.id}">${p.nombre || p.nombre_programa}</option>`).join('');
          }
        }
      }

      // 2. Cargar Profesores / Docentes
      const resDoc = await fetch('/api/academico/docentes', {
        headers: { 'Authorization': `Bearer ${AuthModule.getToken()}` }
      });

      if (resDoc.ok) {
        const rawDoc = await resDoc.json();
        const docentes = Array.isArray(rawDoc) ? rawDoc : (rawDoc.data || rawDoc.docentes || []);
        
        const selectDoc = document.getElementById('asignaturaDocente');
        if (selectDoc) {
          if (docentes.length === 0) {
            selectDoc.innerHTML = '<option value="">-- No hay profesores disponibles --</option>';
          } else {
            selectDoc.innerHTML = '<option value="">-- Seleccione un Profesor (Opcional) --</option>' + 
              docentes.map(d => `<option value="${d.id}">${d.nombre} (${d.email || ''})</option>`).join('');
          }
        }
      }
    } catch (err) {
      console.error("Error al poblar los selectores del modal:", err);
    }
  }
};

export default AsignaturasModule;