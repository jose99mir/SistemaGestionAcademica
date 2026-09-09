import { AuthModule } from './modules/auth.module.js';

document.addEventListener('DOMContentLoaded', () => {
  const user = AuthModule.getUser();

  if (user) {
    console.log(`[Portal Académico] Sesión iniciada como: ${user.nombre || 'Usuario'} (${user.rol})`);

    // Mostrar información de usuario en el header si existe el elemento
    const userInfo = document.getElementById('userInfo');
    if (userInfo) {
      userInfo.innerText = `${user.nombre || 'Usuario'} | ${user.rol}`;
    }

    // Mapeo de botones con sus acciones
    const actions = {
      btnMaterias: () => CargarSeccion('Mis Materias'),
      btnNotas: () => CargarSeccion('Mis Notas'),
      btnSoporte: () => CargarSeccion('Soporte PQRS')
    };

    // Asignación segura de eventos click
    Object.keys(actions).forEach(btnId => {
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.onclick = (e) => {
          e.preventDefault();
          actions[btnId]();
        };
      }
    });
  }
});

function CargarSeccion(nombreSeccion) {
  const display = document.getElementById('contentDisplay');
  if (display) {
    display.innerHTML = `
      <div style="padding: 1.5rem; background: #1e293b; border-radius: 8px; margin-top: 1rem; color: #fff;">
        <h3>${nombreSeccion}</h3>
        <p>Cargando datos de la sección <strong>${nombreSeccion}</strong>...</p>
      </div>
    `;
  }
}