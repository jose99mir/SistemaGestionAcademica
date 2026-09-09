/**
 * @file Users Module
 * @location js/modules/users.module.js
 * @description Módulo frontend para las peticiones HTTP del CRUD de usuarios.
 */

export const UsersModule = {
  async getUsers() {
    const res = await fetch('/api/auth/users', {
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
    const res = await fetch('/api/auth/users', {
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
    const res = await fetch(`/api/auth/users/${id}`, {
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
    const res = await fetch(`/api/auth/users/${id}`, {
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
    const res = await fetch(`/api/auth/users/${id}`, {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Error al eliminar el usuario');
    return data;
  }
};