export const AuthModule = {
  /**
   * Autentica al usuario contra la API pasando correo, contraseña y el rol activo seleccionado
   */
  async login(email, password, rolSeleccionado) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ 
        email, 
        password, 
        rol: rolSeleccionado 
      })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      // Retorna el mensaje de error procesado por el backend o un fallback
      throw new Error(data.error || data.message || 'Error al iniciar sesión');
    }

    // Guarda el Token JWT y los datos de la sesión en el almacenamiento local
    const usuario = data.usuario || data.user;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(usuario));

    return usuario;
  },

  /**
   * Obtiene la información del usuario actual desde localStorage
   */
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Obtiene el Token JWT desde localStorage
   */
  getToken() {
    return localStorage.getItem('token');
  },

  /**
   * Cierra la sesión activa y redirige a la vista de login
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '../auth/login.html';
  }
};