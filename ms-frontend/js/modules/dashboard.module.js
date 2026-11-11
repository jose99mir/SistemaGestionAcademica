/**
 * @file Dashboard Module - Frontend
 * @location ms-frontend/js/modules/dashboard.module.js
 * @description Gestión de navegación, vistas dinámicas y lógica de UI para el Dashboard.
 */

import { AuthModule } from './auth.module.js';
import { SoporteModule } from './soporte.module.js';
import { UsersModule } from './users.module.js';
import { ProgramasModule } from './programas.module.js';
import { PeriodosModule } from './periodos.module.js';
import { AsignaturasModule } from './asignaturas.module.js';
import { MatriculasModule } from './matriculas.module.js';
import { NotasModule } from './notas.module.js';
import { HomeDashboardModule } from './home-dashboard.module.js';

export const DashboardModule = {
  configMenus: {
    ESTUDIANTE: [
      { id: 'dashboard', label: 'Panel Principal', icon: 'fa-gauge-high' },
      { id: 'materias', label: 'Mis Materias', icon: 'fa-book' },
      { id: 'notas', label: 'Calificaciones', icon: 'fa-clipboard-check' },
      { id: 'pqrs', label: 'Gestión PQRS / Tickets', icon: 'fa-life-ring' }
    ],
    PROFESOR: [
      { id: 'dashboard', label: 'Panel Docente', icon: 'fa-gauge-high' },
      { id: 'cursos', label: 'Mis Cursos', icon: 'fa-book' },
      { id: 'notas', label: 'Cargar Notas', icon: 'fa-clipboard-list' },
      { id: 'pqrs', label: 'Soporte Técnico', icon: 'fa-life-ring' }
    ],
    ADMIN: [
      { id: 'dashboard', label: 'Panel General', icon: 'fa-gauge-high' },
      { id: 'usuarios', label: 'Gestión Usuarios', icon: 'fa-users' },
      { id: 'programas', label: 'Gestión Programas', icon: 'fa-graduation-cap' },
      { id: 'periodos', label: 'Periodos Académicos', icon: 'fa-calendar-days' },
      { id: 'materias', label: 'Gestión Asignaturas', icon: 'fa-book' },
      { id: 'matriculas', label: 'Matrículas', icon: 'fa-user-graduate' },
      { id: 'notas', label: 'Calificaciones', icon: 'fa-clipboard-check' },
      { id: 'pqrs', label: 'Administrar Tickets PQRS', icon: 'fa-life-ring' }
    ]
  },

  init() {
    const user = AuthModule.getUser();
    if (!user || !AuthModule.getToken()) {
      window.location.href = '../auth/login.html';
      return;
    }

    const dateEl = document.getElementById('current-date');
    if (dateEl) {
      dateEl.innerText = new Date().toLocaleDateString('es-CO', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
    }

    document.getElementById('sb-name').innerText = user.nombre || user.email;
    document.getElementById('sb-avatar').innerText = (user.nombre || user.email).charAt(0).toUpperCase();
    document.getElementById('sb-role').innerText = `Rol: ${user.rol}`;

    document.getElementById('btnLogout')?.addEventListener('click', () => AuthModule.logout());

    this.renderMenu(user.rol);
    this.navegarA('dashboard', user);
  },

  renderMenu(rol) {
    const nav = document.getElementById('sb-menu');
    const items = this.configMenus[rol] || this.configMenus.ESTUDIANTE;

    nav.innerHTML = items.map(m => `
      <a data-page="${m.id}" class="nav-item">
        <i class="fa-solid ${m.icon}"></i> ${m.label}
      </a>
    `).join('');

    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget.getAttribute('data-page');
        const user = AuthModule.getUser();
        this.navegarA(target, user);
      });
    });
  },

  async navegarA(vistaId, user) {
    const container = document.getElementById('page-container');
    const title = document.getElementById('page-title');
    const sub = document.getElementById('page-sub');

    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-page') === vistaId);
    });

    switch (vistaId) {
      case 'dashboard':
        title.innerText = `Bienvenido/a, ${user.nombre || 'Usuario'}`;
        sub.innerText = `Panel de Control — Rol: ${user.rol}`;
        // Renderizado del Dashboard Dinámico según el Rol
        if (HomeDashboardModule && typeof HomeDashboardModule.init === 'function') {
          await HomeDashboardModule.init(container, user);
        }
        break;

      case 'usuarios':
        title.innerText = 'Gestión Global de Usuarios';
        sub.innerText = 'Módulo para gestión de usuarios';
        await this.renderModuloHtml(container, '../usuarios/usuarios.html', 'usuarios');
        if (UsersModule && typeof UsersModule.init === 'function') {
          UsersModule.init();
        }
        break;

      case 'programas':
        title.innerText = 'Gestión de Programas Académicos';
        sub.innerText = 'Módulo para gestión de programas académicos';
        await this.renderModuloHtml(container, '../admin/programas.html', 'programas');
        if (ProgramasModule && typeof ProgramasModule.init === 'function') {
          ProgramasModule.init();
        }
        break;

      case 'periodos':
        title.innerText = 'Gestión de Periodos Académicos';
        sub.innerText = 'Módulo para gestión de periodos académicos';
        await this.renderModuloHtml(container, '../admin/periodos.html', 'periodos');
        if (PeriodosModule && typeof PeriodosModule.init === 'function') {
          PeriodosModule.init();
        }
        break;

      case 'materias':
      case 'cursos':
        title.innerText = 'Gestión de Asignaturas';
        sub.innerText = 'Módulo para gestión de asignaturas';
        await this.renderModuloHtml(container, '../admin/asignaturas.html', 'asignaturas');
        requestAnimationFrame(() => {
          if (AsignaturasModule && typeof AsignaturasModule.init === 'function') { 
            AsignaturasModule.init();
          }
        });
        break;

      case 'matriculas':
        title.innerText = 'Gestión Global de Matrículas';
        sub.innerText = 'Asignación de estudiantes a materias y periodos académicos';
        await this.renderModuloHtml(container, '../admin/matriculas.html', 'matriculas');
        if (MatriculasModule && typeof MatriculasModule.init === 'function') { 
          await MatriculasModule.init(); 
        }
        break;

      case 'notas':
      case 'calificaciones':
        const userRole = user ? user.rol : '';
        if (userRole === 'ESTUDIANTE') {
          title.innerText = 'Mi Historial Académico';
          sub.innerText = 'Consulta de calificaciones por periodo y asignatura';
        } else if (userRole === 'DOCENTE' || userRole === 'PROFESOR') {
          title.innerText = 'Registro de Calificaciones';
          sub.innerText = 'Planilla de notas para asignaturas a cargo';
        } else {
          title.innerText = 'Gestión Global de Calificaciones';
          sub.innerText = 'Consulta y edición de notas de todas las asignaturas';
        }

        await this.renderModuloHtml(container, '../admin/notas.html', 'notas');
        if (NotasModule && typeof NotasModule.init === 'function') { 
          await NotasModule.init(); 
        }
        break;

      case 'pqrs':
        title.innerText = 'Gestión de Tickets y PQRS';
        sub.innerText = 'Módulo para gestión de Tickets y PQRS';
        await this.renderModuloHtml(container, '../soporte/soporte.html', 'soporte');
        requestAnimationFrame(() => {
          if (SoporteModule && typeof SoporteModule.init === 'function') {
            SoporteModule.init();
          }
        });
        break;
    }
  },

  async renderModuloHtml(container, urlVista, nombreModulo) {
    container.innerHTML = `<p>Cargando módulo de ${nombreModulo}...</p>`;
    try {
      const response = await fetch(urlVista);
      if (!response.ok) throw new Error(`No se pudo encontrar la vista (${urlVista})`);
      
      const html = await response.text();
      container.innerHTML = html;

      const scripts = container.querySelectorAll('script');
      scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
        newScript.textContent = oldScript.textContent;
        oldScript.parentNode.replaceChild(newScript, oldScript);
      });
    } catch (err) {
      container.innerHTML = `<div class="card"><p style="color:var(--red, #ef4444)">Error al cargar ${nombreModulo}: ${err.message}</p></div>`;
    }
  }
};

export default DashboardModule;