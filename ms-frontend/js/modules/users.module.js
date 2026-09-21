/**
 * @file Users Module
 * @location ms-frontend/js/modules/users.module.js
 * @description Módulo autocontenido que gestiona peticiones HTTP, eventos del DOM, modales y lógica de usuarios.
 */

import { PaginationHelper } from './pagination.component.js';

export const UsersModule = {
  // Estado interno del módulo
  availableRoles: [],
  currentEditingUserId: null,
  pagination: null,

  // --- INICIALIZACIÓN ---
  init() {
    if (!this.pagination) {
      this.pagination = new PaginationHelper({
        containerId: 'users-pagination',
        rowsPerPage: 5,
        onPageChange: () => this.renderTable()
      });
    }

    this.initEvents();
    this.loadData();
  },

  // --- REGISTRO DE EVENTOS DOM ---
  initEvents() {
    document.getElementById('btn-open-create')?.addEventListener('click', () => this.openCreateModal());
    document.getElementById('btn-close-user-modal')?.addEventListener('click', () => this.closeUserModal());
    document.getElementById('btn-open-pass-modal')?.addEventListener('click', () => this.openPassModal());
    document.getElementById('btn-close-pass-modal')?.addEventListener('click', () => this.closePassModal());

    document.getElementById('userForm')?.addEventListener('submit', (e) => this.handleUserFormSubmit(e));
    document.getElementById('passForm')?.addEventListener('submit', (e) => this.handlePassFormSubmit(e));

    // Delegación de eventos para la tabla
    const tbody = document.getElementById('users-table-body');
    if (tbody) {
      tbody.onclick = (e) => {
        const btnEdit = e.target.closest('.btn-edit');
        const btnDelete = e.target.closest('.btn-delete');

        if (btnEdit) {
          const user = JSON.parse(btnEdit.dataset.user);
          this.openEditModal(user);
        } else if (btnDelete) {
          const id = btnDelete.dataset.id;
          this.handleDeleteUser(id);
        }
      };
    }
  },

  // --- PETICIONES HTTP ---
  async getUsers() {
    const res = await fetch('/api/usuarios/users', {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Error al obtener la lista de usuarios');
    return data;
  },

  async createUser(userData) {
    const res = await fetch('/api/usuarios/users', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(userData)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Error al crear el usuario');
    return data;
  },

  async updateUser(id, userData) {
    const res = await fetch(`/api/usuarios/users/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(userData)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Error al actualizar datos del usuario');
    return data;
  },

  async updateUserPassword(id, password) {
    const res = await fetch(`/api/usuarios/users/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ password })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Error al actualizar la contraseña');
    return data;
  },

  async deleteUser(id) {
    const res = await fetch(`/api/usuarios/users/${id}`, {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Error al eliminar el usuario');
    return data;
  },

  // --- CARGA Y RENDERIZADO ---
  async loadData() {
    try {
      const data = await this.getUsers();
      this.availableRoles = data.roles || [];
      
      this.pagination.setData(data.users || []);
      
      this.renderRolesChecklist();
      this.renderTable();
    } catch (err) {
      this.showMainAlert(err.message, true);
    }
  },

  renderTable() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    const paginatedUsers = this.pagination.getPaginatedData();

    if (!paginatedUsers.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">No existen usuarios registrados.</td></tr>';
      this.pagination.render();
      return;
    }

    tbody.innerHTML = paginatedUsers.map(u => {
      const roleBadges = u.roles 
        ? u.roles.split(', ').map(r => `<span class="badge-role">${r}</span>`).join('') 
        : '<span class="no-role">Sin Rol</span>';
      
      const statusBadge = u.activo 
        ? '<span class="badge-active">Activo</span>' 
        : '<span class="badge-inactive">Inactivo</span>';

      const userJson = JSON.stringify(u).replace(/'/g, "&apos;");

      return `
        <tr>
          <td>${u.id}</td>
          <td>${u.tipo_documento || 'CC'} ${u.documento || ''}</td>
          <td><b>${u.nombre}</b></td>
          <td>${u.email}</td>
          <td>${roleBadges}</td>
          <td>${statusBadge}</td>
          <td>
            <button class="action-btn btn-edit" data-user='${userJson}' title="Editar"><i class="fa-solid fa-pen-to-square"></i></button>
            <button class="action-btn btn-delete" data-id="${u.id}" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>
      `;
    }).join('');

    this.pagination.render();
  },

  renderRolesChecklist() {
    const container = document.getElementById('rolesChecklist');
    if (!container) return;

    container.innerHTML = this.availableRoles.map(r => `
      <label>
        <input type="checkbox" name="roles" value="${r.id}"> ${r.nombre}
      </label>
    `).join('');
  },

  // --- CONTROL DE MODALES ---
  openCreateModal() {
    this.hideModalAlert();
    this.currentEditingUserId = null;
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('userTipoDocumento').value = 'CC';
    document.getElementById('modalTitle').innerText = 'Crear Nuevo Usuario';
    
    document.getElementById('creationPasswordFields').style.display = 'block';
    document.getElementById('userPassword').required = true;
    document.getElementById('userConfirmPassword').required = true;
    document.getElementById('editPasswordBtnContainer').style.display = 'none';
    document.getElementById('statusContainer').style.display = 'none';
    
    document.getElementById('userModal').style.display = 'flex';
  },

  openEditModal(user) {
    this.hideModalAlert();
    this.currentEditingUserId = user.id;
    document.getElementById('userForm').reset();
    document.getElementById('modalTitle').innerText = 'Editar Usuario';
    document.getElementById('userId').value = user.id;
    document.getElementById('userTipoDocumento').value = user.tipo_documento || 'CC';
    document.getElementById('userDocumento').value = user.documento || '';
    document.getElementById('userName').value = user.nombre;
    document.getElementById('userEmail').value = user.email;
    
    document.getElementById('creationPasswordFields').style.display = 'none';
    document.getElementById('userPassword').required = false;
    document.getElementById('userConfirmPassword').required = false;
    document.getElementById('editPasswordBtnContainer').style.display = 'block';
    document.getElementById('statusContainer').style.display = 'block';
    document.getElementById('userActive').checked = Boolean(user.activo);

    const selectedIds = user.roles_ids ? user.roles_ids.toString().split(',').map(id => id.trim()) : [];
    document.querySelectorAll('input[name="roles"]').forEach(cb => {
      cb.checked = selectedIds.includes(cb.value.toString());
    });

    document.getElementById('userModal').style.display = 'flex';
  },

  closeUserModal() {
    this.hideModalAlert();
    document.getElementById('userModal').style.display = 'none';
  },

  openPassModal() {
    document.getElementById('passForm').reset();
    this.hidePassAlert();
    document.getElementById('userModal').style.display = 'none';
    document.getElementById('passModal').style.display = 'flex';
  },

  closePassModal() {
    this.hidePassAlert();
    document.getElementById('passModal').style.display = 'none';
    document.getElementById('userModal').style.display = 'flex';
  },

  // --- MANEJADORES DE FORMULARIOS Y ACCIONES ---
  async handleUserFormSubmit(e) {
    e.preventDefault();
    this.hideModalAlert();

    const id = document.getElementById('userId').value;
    const selectedRoles = Array.from(document.querySelectorAll('input[name="roles"]:checked')).map(cb => Number(cb.value));

    if (selectedRoles.length === 0) {
      this.showModalAlert('Debes seleccionar al menos un rol para el usuario.', true);
      return;
    }

    const payload = {
      tipo_documento: document.getElementById('userTipoDocumento').value,
      documento: document.getElementById('userDocumento').value,
      nombre: document.getElementById('userName').value,
      email: document.getElementById('userEmail').value,
      roles: selectedRoles,
      activo: document.getElementById('userActive').checked
    };

    if (!id) {
      const password = document.getElementById('userPassword').value;
      const confirmPassword = document.getElementById('userConfirmPassword').value;

      if (!password) {
        this.showModalAlert('La contraseña es obligatoria para usuarios nuevos.', true);
        return;
      }
      if (password !== confirmPassword) {
        this.showModalAlert('Las contraseñas no coinciden. Por favor verifícalas.', true);
        return;
      }
      if (password.length < 6) {
        this.showModalAlert('La contraseña debe tener al menos 6 caracteres.', true);
        return;
      }
      payload.password = password;
    }

    try {
      if (id) {
        await this.updateUser(id, payload);
        this.showMainAlert('Datos del usuario actualizados exitosamente');
      } else {
        await this.createUser(payload);
        this.showMainAlert('Usuario creado exitosamente');
      }
      this.closeUserModal();
      this.loadData();
    } catch (err) {
      this.showModalAlert(err.message, true);
    }
  },

  async handlePassFormSubmit(e) {
    e.preventDefault();
    this.hidePassAlert();

    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    if (newPassword !== confirmNewPassword) {
      this.showPassAlert('Las contraseñas no coinciden. Por favor verifícalas.', true);
      return;
    }

    if (newPassword.length < 6) {
      this.showPassAlert('La contraseña debe tener al menos 6 caracteres.', true);
      return;
    }

    try {
      await this.updateUserPassword(this.currentEditingUserId, newPassword);
      this.showMainAlert('Contraseña actualizada correctamente');
      document.getElementById('passModal').style.display = 'none';
      this.loadData();
    } catch (err) {
      this.showPassAlert(err.message, true);
    }
  },

  async handleDeleteUser(id) {
    if (!confirm('¿Está seguro de que desea eliminar este usuario?')) return;
    try {
      await this.deleteUser(id);
      this.showMainAlert('Usuario eliminado exitosamente');
      this.loadData();
    } catch (err) {
      this.showMainAlert(err.message, true);
    }
  },

  // --- CAJAS DE ALERTA Y MENSAJES ---
  showModalAlert(msg, isError = false) {
    const alertBox = document.getElementById('modal-alert');
    if (!alertBox) return;
    alertBox.innerText = msg;
    alertBox.className = `alert-box ${isError ? 'alert-error' : 'alert-success'}`;
    alertBox.style.display = 'block';
  },

  hideModalAlert() {
    const alertBox = document.getElementById('modal-alert');
    if (alertBox) alertBox.style.display = 'none';
  },

  showPassAlert(msg, isError = false) {
    const alertBox = document.getElementById('pass-modal-alert');
    if (!alertBox) return;
    alertBox.innerText = msg;
    alertBox.className = `alert-box ${isError ? 'alert-error' : 'alert-success'}`;
    alertBox.style.display = 'block';
  },

  hidePassAlert() {
    const alertBox = document.getElementById('pass-modal-alert');
    if (alertBox) alertBox.style.display = 'none';
  },

  showMainAlert(msg, isError = false) {
    const alertBox = document.getElementById('main-alert');
    if (!alertBox) return;
    alertBox.innerText = msg;
    alertBox.className = `alert-box ${isError ? 'alert-error' : 'alert-success'}`;
    alertBox.style.display = 'block';
    setTimeout(() => { alertBox.style.display = 'none'; }, 4000);
  }
};

export default UsersModule;