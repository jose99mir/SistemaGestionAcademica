/**
 * @file Main Dashboard Controller
 * @location ms-frontend/js/main.js
 */

import { AuthModule } from './modules/auth.module.js';
import { UsersModule } from './modules/users.module.js';
import { AcademicoModule } from './modules/academico.module.js';
import { NotasModule } from './modules/notas.module.js';
import { SoporteModule } from './modules/soporte.module.js';

document.addEventListener('DOMContentLoaded', () => {
  const user = AuthModule.getUser();

  // Guard de sesión
  if (!user || !AuthModule.getToken()) {
    window.location.href = '../auth/login.html';
    return;
  }

  // Render información de usuario en layout
  const userInfo = document.getElementById('userInfo');
  if (userInfo) userInfo.innerText = `${user.nombre || 'Usuario'} | ${user.rol}`;

  const welcomeMsg = document.getElementById('welcomeMsg');
  if (welcomeMsg) welcomeMsg.innerText = `Rol: ${user.rol} | Email: ${user.email}`;

  // Botones de Navegación del Dashboard
  const btnMaterias = document.getElementById('btnMaterias');
  const btnNotas = document.getElementById('btnNotas');
  const btnSoporte = document.getElementById('btnSoporte');
  const btnUsuarios = document.getElementById('btnUsuarios');
  const btnLogout = document.getElementById('btnLogout');

  if (btnMaterias) btnMaterias.addEventListener('click', () => cargarMaterias(user));
  if (btnNotas) btnNotas.addEventListener('click', () => cargarNotas(user));
  if (btnSoporte) btnSoporte.addEventListener('click', () => cargarSoporte(user));
  
  // Invocación delegada exclusivamente a UsersModule
  if (btnUsuarios) btnUsuarios.addEventListener('click', () => UsersModule.initUsersView());
  
  if (btnLogout) btnLogout.addEventListener('click', () => AuthModule.logout());
});

// Funciones para Materias, Notas y Soporte siguen consumiendo sus propios módulos de forma modular