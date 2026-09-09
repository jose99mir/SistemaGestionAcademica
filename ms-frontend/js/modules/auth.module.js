/**
 * @file Auth Module - Frontend
 * @description Módulo de autenticación y gestión de tokens de sesión JWT local.
 * @iso ISO/IEC 27001 - Gestión de Sesión Segura
 */

export const AuthModule = {
  /**
   * Realiza la petición de autenticación contra el API Gateway
   */
  async login(email, password) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Credenciales inválidas');
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user;
  },

  /**
   * Cierra la sesión activa borrando credenciales locales
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  },

  /**
   * Obtiene el usuario almacenado en la sesión
   */
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Obtiene el token para incluir en los Headers HTTP
   */
  getToken() {
    return localStorage.getItem('token');
  }
};