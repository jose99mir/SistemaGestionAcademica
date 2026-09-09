/**
 * @file Main App
 * @location js/main.js
 * @description Punto de entrada principal con los eventos de login, dashboard y secciones dinámicas.
 */

import { AuthModule } from './modules/auth.module.js';
import { AcademicoModule } from './modules/academico.module.js';
import { NotasModule } from './modules/notas.module.js';
import { SoporteModule } from './modules/soporte.module.js';
import { UsersModule } from './modules/users.module.js';

document.addEventListener('DOMContentLoaded', () => {
  const user = AuthModule.getUser();

  // 1. Manejo del formulario de Login
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const email = document.getElementById('email').value;
        const pass = document.getElementById('password').value;
        const loggedUser = await AuthModule.login(email, pass);
        alert(`Bienvenido ${loggedUser.nombre || ''}`);
        window.location.reload();
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // 2. Manejo de Sesión / Dashboard
  if (user) {
    console.log(`[Portal Académico] Sesión iniciada como: ${user.nombre || 'Usuario'} (${user.rol})`);

    const loginSection = document.getElementById('loginSection');
    const dashboardSection = document.getElementById('dashboardSection');
    if (loginSection) loginSection.style.display = 'none';
    if (dashboardSection) dashboardSection.style.display = 'block';

    const userInfo = document.getElementById('userInfo');
    if (userInfo) userInfo.innerText = `${user.nombre || 'Usuario'} | ${user.rol}`;

    const welcomeMsg = document.getElementById('welcomeMsg');
    if (welcomeMsg) welcomeMsg.innerText = `Rol: ${user.rol} | Email: ${user.email}`;

    // Escuchadores de eventos para los botones principales
    const btnMaterias = document.getElementById('btnMaterias');
    const btnNotas = document.getElementById('btnNotas');
    const btnSoporte = document.getElementById('btnSoporte');
    const btnUsuarios = document.getElementById('btnUsuarios');
    const btnLogout = document.getElementById('btnLogout');

    if (btnMaterias) btnMaterias.addEventListener('click', () => cargarMaterias(user));
    if (btnNotas) btnNotas.addEventListener('click', () => cargarNotas(user));
    if (btnSoporte) btnSoporte.addEventListener('click', () => cargarSoporte(user));
    if (btnUsuarios) btnUsuarios.addEventListener('click', () => cargarUsuarios(user));
    if (btnLogout) btnLogout.addEventListener('click', () => AuthModule.logout());
  }
});

// ==========================================
// SECCIÓN: GESTIÓN DE USUARIOS
// ==========================================
async function cargarUsuarios(user) {
  const display = document.getElementById('contentDisplay');
  if (!display) return;

  display.innerHTML = `<p style="color: #fff;">Cargando gestión de usuarios...</p>`;

  try {
    const response = await fetch('views/admin/usuarios.html');
    if (!response.ok) throw new Error('No se pudo cargar la vista de usuarios');
    
    const html = await response.text();
    display.innerHTML = html;

    const scripts = display.querySelectorAll('script');
    scripts.forEach(oldScript => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });

  } catch (error) {
    console.error(error);
    display.innerHTML = `<p style="color: #ef4444;">Error al cargar el módulo de usuarios.</p>`;
  }
}

// ==========================================
// SECCIÓN: MATERIAS
// ==========================================
async function cargarMaterias(user) {
  const display = document.getElementById('contentDisplay');
  if (!display) return;

  display.innerHTML = `<p style="color: #fff;">Cargando materias...</p>`;

  try {
    const materias = await AcademicoModule.getMaterias();
    
    if (!materias || materias.length === 0) {
      display.innerHTML = `<p style="color: #fff;">No tienes materias registradas.</p>`;
      return;
    }

    let html = `
      <div style="padding: 1.5rem; background: #1e293b; border-radius: 8px; margin-top: 1rem; color: #fff;">
        <h3>Mis Materias</h3>
        <ul style="list-style: none; padding: 0; margin-top: 1rem;">
    `;

    materias.forEach(m => {
      html += `
        <li style="padding: 0.75rem 0; border-bottom: 1px solid #334155;">
          <strong>${m.nombre}</strong> - Código: ${m.codigo || 'N/A'}
        </li>
      `;
    });

    html += `</ul></div>`;
    display.innerHTML = html;
  } catch (error) {
    console.error(error);
    display.innerHTML = `<p style="color: #ef4444;">Error al cargar las materias.</p>`;
  }
}

// ==========================================
// SECCIÓN: NOTAS
// ==========================================
async function cargarNotas(user) {
  const display = document.getElementById('contentDisplay');
  if (!display) return;

  display.innerHTML = `<p style="color: #fff;">Cargando notas...</p>`;

  try {
    const notas = await NotasModule.getNotasEstudiante(user.id);

    if (!notas || notas.length === 0) {
      display.innerHTML = `<p style="color: #fff;">No hay calificaciones registradas para este usuario.</p>`;
      return;
    }

    let html = `
      <div style="padding: 1.5rem; background: #1e293b; border-radius: 8px; margin-top: 1rem; color: #fff;">
        <h3>Mis Notas</h3>
        <table style="width: 100%; text-align: left; margin-top: 1rem; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 2px solid #334155;">
              <th style="padding: 0.5rem;">Materia</th>
              <th style="padding: 0.5rem;">Corte 1</th>
              <th style="padding: 0.5rem;">Corte 2</th>
              <th style="padding: 0.5rem;">Corte 3</th>
            </tr>
          </thead>
          <tbody>
    `;

    notas.forEach(n => {
      html += `
        <tr style="border-bottom: 1px solid #334155;">
          <td style="padding: 0.5rem;">${n.materia || 'Asignatura'}</td>
          <td style="padding: 0.5rem;">${n.corte1 ?? '-'}</td>
          <td style="padding: 0.5rem;">${n.corte2 ?? '-'}</td>
          <td style="padding: 0.5rem;">${n.corte3 ?? '-'}</td>
        </tr>
      `;
    });

    html += `</tbody></table></div>`;
    display.innerHTML = html;
  } catch (error) {
    console.error(error);
    display.innerHTML = `<p style="color: #ef4444;">Error al cargar las calificaciones.</p>`;
  }
}

// ==========================================
// SECCIÓN: SOPORTE (PQRS)
// ==========================================
async function cargarSoporte(user) {
  const display = document.getElementById('contentDisplay');
  if (!display) return;

  display.innerHTML = `<p style="color: #fff;">Cargando solicitudes...</p>`;

  try {
    const pqrsList = await SoporteModule.getPqrsUsuario(user.id);

    let html = `
      <div style="padding: 1.5rem; background: #1e293b; border-radius: 8px; margin-top: 1rem; color: #fff;">
        <h3>Soporte PQRS</h3>
        
        <form id="pqrsForm" style="margin-bottom: 2rem; background: #0f172a; padding: 1rem; border-radius: 6px;">
          <h4 style="margin-bottom: 0.5rem;">Crear nueva solicitud</h4>
          
          <label style="display:block; margin-top:0.5rem;">Tipo:</label>
          <select id="pqrsTipo" style="width: 100%; padding: 0.4rem; margin-bottom: 0.5rem;">
            <option value="Petición">Petición</option>
            <option value="Queja">Queja</option>
            <option value="Reclamo">Reclamo</option>
            <option value="Sugerencia">Sugerencia</option>
          </select>

          <label style="display:block;">Asunto:</label>
          <input type="text" id="pqrsAsunto" required style="width: 100%; padding: 0.4rem; margin-bottom: 0.5rem;">

          <label style="display:block;">Descripción:</label>
          <textarea id="pqrsDescripcion" required style="width: 100%; padding: 0.4rem; margin-bottom: 0.5rem;"></textarea>

          <button type="submit" style="margin-top: 0.5rem;">Enviar Ticket</button>
        </form>

        <h4>Tus Solicitudes Radicadas</h4>
    `;

    if (!pqrsList || pqrsList.length === 0) {
      html += `<p style="margin-top: 0.5rem;">No has radicado solicitudes aún.</p>`;
    } else {
      html += `<ul style="list-style: none; padding: 0; margin-top: 0.5rem;">`;
      pqrsList.forEach(p => {
        html += `
          <li style="padding: 0.75rem 0; border-bottom: 1px solid #334155;">
            <strong>[${p.tipo}] ${p.asunto}</strong>
            <p style="font-size: 0.9rem; color: #94a3b8; margin: 0.2rem 0;">${p.descripcion}</p>
          </li>
        `;
      });
      html += `</ul>`;
    }

    html += `</div>`;
    display.innerHTML = html;

    const pqrsForm = document.getElementById('pqrsForm');
    if (pqrsForm) {
      pqrsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          const tipo = document.getElementById('pqrsTipo').value;
          const asunto = document.getElementById('pqrsAsunto').value;
          const descripcion = document.getElementById('pqrsDescripcion').value;

          await SoporteModule.enviarPqrs(tipo, asunto, descripcion, user.id);
          alert('Solicitud enviada exitosamente.');
          cargarSoporte(user);
        } catch (err) {
          alert('Error al enviar la PQRS: ' + err.message);
        }
      });
    }

  } catch (error) {
    console.error(error);
    display.innerHTML = `<p style="color: #ef4444;">Error al cargar el módulo de soporte.</p>`;
  }
}