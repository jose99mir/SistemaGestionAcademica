/**
 * @file Auth Module
 * @location ms-frontend/js/modules/auth.module.js
 */

export const AuthModule = {
  selectedRol: 'ESTUDIANTE',

  initLoginPage() {
    if (this.getUser() && this.getToken()) {
      window.location.href = '../dashboard/dashboard.html';
      return;
    }

    const form = document.getElementById('loginForm');
    const roleButtons = document.querySelectorAll('.role-btn');

    if (!form) return;

    roleButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetRole = e.currentTarget.getAttribute('data-role');
        this.setRole(targetRole);
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleLoginSubmit();
    });
  },

  setRole(rol) {
    this.selectedRol = rol;
    const errorContainer = document.getElementById('error-message');
    if (errorContainer) {
      errorContainer.classList.remove('show');
    }

    document.querySelectorAll('.role-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-role') === rol);
    });
  },

  async handleLoginSubmit() {
    const errorContainer = document.getElementById('error-message');
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');

    if (errorContainer) errorContainer.classList.remove('show');

    const email = emailInput ? emailInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';

    try {
      await this.login(email, password, this.selectedRol);
      window.location.href = '../dashboard/dashboard.html';
    } catch (err) {
      if (errorContainer) {
        errorContainer.innerText = err.message;
        errorContainer.classList.add('show');
      }
    }
  },

  async login(email, password, rolSeleccionado) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, rol: rolSeleccionado })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || data.message || 'Credenciales inválidas');
    }

    const usuario = data.usuario || data.user;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(usuario));

    return usuario;
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken() {
    return localStorage.getItem('token');
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '../auth/login.html';
  }
};