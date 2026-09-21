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
        container.innerHTML = `
          <div class="alert green">
            <div class="icon-circle"><i class="fa-solid fa-circle-check"></i></div>
            <div>
              <h3>Sesión Activa</h3>
              <p>Has ingresado correctamente con el rol de <strong>${user.rol}</strong>.</p>
            </div>
          </div>`;
        break;

      case 'usuarios':
        title.innerText = 'Gestión Global de Usuarios';
        sub.innerText = 'Módulo CRUD conectado al microservicio ms-auth';
        await this.renderModuloHtml(container, '../usuarios/usuarios.html', 'usuarios');
        if (UsersModule && typeof UsersModule.init === 'function') {
          UsersModule.init();
        }
        break;

      case 'programas':
        title.innerText = 'Gestión de Programas Académicos';
        sub.innerText = 'Módulo CRUD conectado al microservicio ms-academico';
        await this.renderModuloHtml(container, '../admin/programas.html', 'programas');
        if (ProgramasModule && typeof ProgramasModule.init === 'function') {
          ProgramasModule.init();
        }
        break;

      case 'periodos':
        title.innerText = 'Gestión de Periodos Académicos';
        sub.innerText = 'Módulo CRUD conectado al microservicio ms-academico';
        await this.renderModuloHtml(container, '../admin/periodos.html', 'periodos');
        if (PeriodosModule && typeof PeriodosModule.init === 'function') {
          PeriodosModule.init();
        }
        break;

      case 'materias':
        title.innerText = 'Gestión de Asignaturas';
        sub.innerText = 'Módulo CRUD y carga docente conectado a ms-academico';
        await this.renderModuloHtml(container, '../admin/asignaturas.html', 'asignaturas');
        requestAnimationFrame(() => {
          if (AsignaturasModule && typeof AsignaturasModule.init === 'function') { AsignaturasModule.init();}
      });
      break;

      case 'matriculas':
       title.innerText = 'Gestión Global de Matrículas';
       sub.innerText = 'Asignación de estudiantes a materias y periodos académicos';
       await this.renderModuloHtml(container, '../admin/matriculas.html', 'matriculas');
        if (MatriculasModule && typeof MatriculasModule.init === 'function') { await MatriculasModule.init(); }
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
    
      if (NotasModule && typeof NotasModule.init === 'function') {await NotasModule.init();}
      break;
      

      case 'pqrs':
        title.innerText = 'Gestión de Tickets y PQRS';
        sub.innerText = 'Módulo CRUD conectado a microservicio de soporte';
        await this.renderModuloPqrs(container, user);
        break;

      default:
        title.innerText = 'Módulo en desarrollo';
        sub.innerText = `Vista: ${vistaId}`;
        container.innerHTML = `<div class="card"><p>Módulo para el rol ${user.rol} en construcción.</p></div>`;
    }
  },

  async renderModuloHtml(container, urlVista, nombreModulo) {
    container.innerHTML = `<p>Cargando módulo de ${nombreModulo}...</p>`;
    try {
      const response = await fetch(urlVista);
      if (!response.ok) throw new Error(`No se pudo encontrar la vista (${urlVista})`);
      
      const html = await response.text();
      container.innerHTML = html;

      // Re-ejecutar scripts internos
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
  },

  async renderModuloPqrs(container, user) {
    container.innerHTML = '<p>Cargando registros...</p>';
    try {
      const tickets = await SoporteModule.getPqrsUsuario(user.id);
      
      let html = `
        <div class="card" style="margin-bottom: 20px;">
          <h3>Radicar Nueva Solicitud</h3>
          <form id="formPqrs">
            <input type="hidden" id="pqrs-id">
            <div class="field">
              <label>Tipo</label>
              <select id="pqrs-tipo" required>
                <option value="Petición">Petición</option>
                <option value="Queja">Queja</option>
                <option value="Reclamo">Reclamo</option>
              </select>
            </div>
            <div class="field">
              <label>Asunto</label>
              <input type="text" id="pqrs-asunto" required placeholder="Escribe el asunto">
            </div>
            <div class="field">
              <label>Descripción</label>
              <input type="text" id="pqrs-desc" required placeholder="Detalle de la solicitud">
            </div>
            <button type="submit" class="btn-primary" style="width: auto; padding: 10px 20px;">Guardar Ticket</button>
          </form>
        </div>

        <div class="card">
          <h3>Listado de Tickets</h3>
          <table>
            <thead>
              <tr><th>ID</th><th>Tipo</th><th>Asunto</th><th>Descripción</th><th>Acciones</th></tr>
            </thead>
            <tbody>`;

      if (!tickets || tickets.length === 0) {
        html += '<tr><td colspan="5">No hay tickets registrados.</td></tr>';
      } else {
        tickets.forEach(t => {
          html += `
            <tr>
              <td>${t.id}</td>
              <td>${t.tipo}</td>
              <td><strong>${t.asunto}</strong></td>
              <td>${t.descripcion}</td>
              <td>
                <button class="btn-edit btn-navy" data-id="${t.id}" data-tipo="${t.tipo}" data-asunto="${t.asunto}" data-desc="${t.descripcion}">Editar</button>
                <button class="btn-del btn-navy" data-id="${t.id}" style="background:var(--red, #ef4444);">Eliminar</button>
              </td>
            </tr>`;
        });
      }

      html += '</tbody></table></div>';
      container.innerHTML = html;

      document.getElementById('formPqrs').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('pqrs-id').value;
        const tipo = document.getElementById('pqrs-tipo').value;
        const asunto = document.getElementById('pqrs-asunto').value;
        const descripcion = document.getElementById('pqrs-desc').value;

        if (id) {
          await SoporteModule.actualizarPqrs(id, { tipo, asunto, descripcion });
        } else {
          await SoporteModule.enviarPqrs(tipo, asunto, descripcion, user.id);
        }
        this.renderModuloPqrs(container, user);
      });

      document.querySelectorAll('.btn-edit').forEach(b => {
        b.addEventListener('click', (e) => {
          const ds = e.currentTarget.dataset;
          document.getElementById('pqrs-id').value = ds.id;
          document.getElementById('pqrs-tipo').value = ds.tipo;
          document.getElementById('pqrs-asunto').value = ds.asunto;
          document.getElementById('pqrs-desc').value = ds.desc;
        });
      });

      document.querySelectorAll('.btn-del').forEach(b => {
        b.addEventListener('click', async (e) => {
          const id = e.currentTarget.dataset.id;
          if (confirm(`¿Desea eliminar el ticket #${id}?`)) {
            await SoporteModule.eliminarPqrs(id);
            this.renderModuloPqrs(container, user);
          }
        });
      });

    } catch (err) {
      container.innerHTML = '<div class="card"><p style="color:var(--red, #ef4444)">Error al consultar las PQRS.</p></div>';
    }
  },

  // --- 1. ABRIR MODAL PARA CREAR ---
  async openModal() {
    this.hideAlerts();
    document.getElementById('asignaturaForm')?.reset();
    document.getElementById('asignaturaId').value = '';

    // ESPERA ASÍNCRONA: Llena los comboboxes de Programas y Profesores ANTES de mostrar el modal
    await this.loadCombosOptions();

    const modalTitle = document.getElementById('asignaturaModalTitle');
    if (modalTitle) modalTitle.innerText = 'Nueva Asignatura';

    const modal = document.getElementById('asignaturaModal');
    if (modal) modal.style.display = 'flex';
  },

  // --- 2. ABRIR MODAL PARA EDITAR ---
  async editItem(id) {
    try {
      this.hideAlerts();

      // ESPERA ASÍNCRONA: Carga las opciones para que los <select> ya tengan los <option> listos al asignar el valor
      await this.loadCombosOptions();

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

      // Asigna las opciones seleccionadas
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
  }
};

export default DashboardModule;