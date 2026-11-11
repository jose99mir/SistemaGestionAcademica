/**
 * @file Home Dashboard Module - Frontend
 * @location ms-frontend/js/modules/home-dashboard.module.js
 * @description Generación visual de KPIs, gráficos de rendimiento y paneles del Dashboard por rol.
 */

import { AuthModule } from './auth.module.js';

export const HomeDashboardModule = {
  async init(container, user) {
    if (!container) return;
    container.innerHTML = `<div class="card"><p style="color: var(--muted);"><i class="fa-solid fa-spinner fa-spin"></i> Cargando panel principal...</p></div>`;

    const rol = user.rol || 'ESTUDIANTE';

    if (rol === 'ESTUDIANTE') {
      await this.renderDashboardEstudiante(container, user);
    } else if (rol === 'DOCENTE' || rol === 'PROFESOR') {
      await this.renderDashboardDocente(container, user);
    } else if (rol === 'ADMIN') {
      await this.renderDashboardAdmin(container, user);
    } else {
      await this.renderDashboardEstudiante(container, user);
    }
  },

  // ==========================================
  // VISTA ESTUDIANTE
  // ==========================================
  async renderDashboardEstudiante(container, user) {
    try {
      const res = await fetch(`/api/academico/asignaturas`, {
        headers: {
          'Authorization': `Bearer ${AuthModule.getToken()}`,
          'x-user-id': user.id || user.usuario_id || '',
          'x-user-role': user.rol || 'ESTUDIANTE',
          'x-user-email': user.email || ''
        }
      });

      const list = res.ok ? await res.json() : [];
      const materias = Array.isArray(list) ? list : [];

      let totalCreditos = 0;
      let sumaNotasProyectadas = 0;
      let materiasConNota = 0;
      let materiasEnRiesgo = 0;

      materias.forEach(m => {
        const creds = Number(m.creditos) || 0;
        totalCreditos += creds;

        const c1 = Number(m.corte1) || 0;
        const c2 = Number(m.corte2) || 0;
        const c3 = Number(m.corte3) || 0;

        // Proyección del promedio basado únicamente en los cortes evaluados (> 0.0)
        let pesoEvaluado = 0;
        let notaPonderada = 0;

        if (c1 > 0) { notaPonderada += c1 * 0.30; pesoEvaluado += 0.30; }
        if (c2 > 0) { notaPonderada += c2 * 0.30; pesoEvaluado += 0.30; }
        if (c3 > 0) { notaPonderada += c3 * 0.40; pesoEvaluado += 0.40; }

        let notaProyectada = Number(m.notaFinal) || 0;
        if (pesoEvaluado > 0) {
          notaProyectada = notaPonderada / pesoEvaluado;
          sumaNotasProyectadas += notaProyectada;
          materiasConNota++;
        }

        if (notaProyectada > 0 && notaProyectada < 3.0) {
          materiasEnRiesgo++;
        }
      });

      const promedioGeneral = materiasConNota > 0 ? (sumaNotasProyectadas / materiasConNota).toFixed(2) : '0.00';
      const numMateriasActivas = materias.length;
      const programaNombre = materias[0]?.programaNombre || 'Programa Académico';

      // Determinación de alerta superior
      let bannerClase = 'alert-success';
      let bannerTexto = 'Rendimiento Alto';
      let bannerSub = `Promedio proyectado actual: ${promedioGeneral}`;

      if (materiasEnRiesgo > 0) {
        bannerClase = 'alert-error';
        bannerTexto = 'Atención Requerida';
        bannerSub = `Tienes ${materiasEnRiesgo} asignatura(s) con nota parcial en riesgo (< 3.0).`;
      } else if (parseFloat(promedioGeneral) < 3.0 && materiasConNota > 0) {
        bannerClase = 'alert-error';
        bannerTexto = 'Promedio Bajo';
        bannerSub = `Tu promedio acumulado se encuentra en ${promedioGeneral}.`;
      }

      let html = `
        <!-- Banner de Rendimiento -->
        <div class="alert-box ${bannerClase}" style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
          <i class="fa-solid ${materiasEnRiesgo > 0 ? 'fa-triangle-exclamation' : 'fa-chart-line'}" style="font-size: 1.4rem;"></i>
          <div>
            <strong style="display: block; font-size: 1rem;">${bannerTexto}</strong>
            <span style="font-size: 0.85rem; opacity: 0.9;">${bannerSub}</span>
          </div>
        </div>

        <!-- Fila de Tarjetas KPI -->
        <div class="dash-kpi-grid">
          <div class="dash-kpi-card">
            <div class="kpi-header">
              <div class="kpi-icon" style="background: #ecfdf5; color: #10b981;"><i class="fa-solid fa-graduation-cap"></i></div>
              <span class="kpi-label">PROMEDIO ACTUAL</span>
            </div>
            <h3 class="kpi-value" style="color: #10b981;">${promedioGeneral}</h3>
          </div>

          <div class="dash-kpi-card">
            <div class="kpi-header">
              <div class="kpi-icon" style="background: #eff6ff; color: #3b82f6;"><i class="fa-solid fa-book-bookmark"></i></div>
              <span class="kpi-label">CRÉDITOS CURSADOS</span>
            </div>
            <h3 class="kpi-value" style="color: #2563eb;">${totalCreditos}</h3>
          </div>

          <div class="dash-kpi-card">
            <div class="kpi-header">
              <div class="kpi-icon" style="background: #fef2f2; color: #ef4444;"><i class="fa-solid fa-layer-group"></i></div>
              <span class="kpi-label">MATERIAS ACTIVAS</span>
            </div>
            <h3 class="kpi-value" style="color: #dc2626;">${numMateriasActivas}</h3>
          </div>

          <div class="dash-kpi-card">
            <div class="kpi-header">
              <div class="kpi-icon" style="background: #fff7ed; color: #f97316;"><i class="fa-solid fa-university"></i></div>
              <span class="kpi-label">PROGRAMA</span>
            </div>
            <h3 class="kpi-value" style="font-size: 1rem; color: #ea580c; line-height: 1.2;">${programaNombre}</h3>
          </div>
        </div>

        <!-- Secciones Distribuidas -->
        <div class="dash-layout-grid">
          <!-- Columna Izquierda: Materias del Semestre -->
          <div class="card">
            <h3 style="margin-top: 0; font-size: 1.1rem; color: var(--navy); font-weight: 700; margin-bottom: 15px;">
              <i class="fa-solid fa-book" style="color: var(--primary-color);"></i> Materias del Semestre
            </h3>
            
            ${materias.length === 0 ? `
              <p style="color: var(--muted); text-align: center; padding: 20px;">No tienes asignaturas matriculadas actualmente.</p>
            ` : materias.map(m => {
              const c1 = Number(m.corte1) || 0;
              const c2 = Number(m.corte2) || 0;
              const c3 = Number(m.corte3) || 0;

              let peso = 0;
              let notaP = 0;
              if (c1 > 0) { notaP += c1 * 0.30; peso += 0.30; }
              if (c2 > 0) { notaP += c2 * 0.30; peso += 0.30; }
              if (c3 > 0) { notaP += c3 * 0.40; peso += 0.40; }

              const def = peso > 0 ? (notaP / peso) : (Number(m.notaFinal) || 0);
              const porcentajeBarra = Math.min(Math.max((def / 5.0) * 100, 5), 100);
              
              let colorBarra = '#10b981'; // Verde
              let estadoTexto = 'SUPERIOR';
              if (def < 3.0 && def > 0) {
                colorBarra = '#ef4444'; // Rojo
                estadoTexto = 'EN RIESGO';
              } else if (def < 4.0) {
                colorBarra = '#3b82f6'; // Azul
                estadoTexto = 'MEDIO';
              }

              return `
                <div class="materia-item-row">
                  <div style="flex: 1; padding-right: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span style="font-weight: 700; color: var(--navy); font-size: 0.95rem;">${m.materiaNombre || m.nombre}</span>
                      <span style="font-size: 0.75rem; font-weight: 800; color: ${colorBarra};">${estadoTexto} ${def.toFixed(1)}</span>
                    </div>
                    <div class="progress-bar-bg">
                      <div class="progress-bar-fill" style="width: ${porcentajeBarra}%; background: ${colorBarra};"></div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Columna Derecha: Profesores & Tutorías -->
          <div class="card">
            <h3 style="margin-top: 0; font-size: 1.1rem; color: var(--navy); font-weight: 700; margin-bottom: 15px;">
              <i class="fa-solid fa-chalkboard-user" style="color: var(--primary-color);"></i> Docentes de tus Cursos
            </h3>
            
            ${materias.length === 0 ? `
              <p style="color: var(--muted); text-align: center;">Sin información de profesores.</p>
            ` : materias.map(m => `
              <div style="margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #f1f5f9;">
                <span style="font-size: 0.8rem; font-weight: 700; color: var(--muted); text-transform: uppercase; display: block;">${m.codigo || 'ASIG'} — ${m.materiaNombre || m.nombre}</span>
                <span style="font-size: 0.95rem; font-weight: 600; color: var(--navy);"><i class="fa-solid fa-user-tie" style="margin-right: 5px; opacity: 0.7;"></i> ${m.docenteNombre || 'Docente por asignar'}</span>
              </div>
            `).join('')}

            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px; margin-top: 15px;">
              <span style="font-size: 0.8rem; font-weight: 700; color: #1e40af; display: block; margin-bottom: 4px;">
                <i class="fa-solid fa-circle-info"></i> Recordatorio Institucional
              </span>
              <p style="margin: 0; font-size: 0.82rem; color: #1e3a8a; line-height: 1.3;">
                Recuerda revisar tus fechas de corte de calificaciones e informar cualquier eventualidad mediante el módulo PQRS.
              </p>
            </div>
          </div>
        </div>
      `;

      container.innerHTML = html;
    } catch (err) {
      container.innerHTML = `<div class="card"><p style="color: var(--red);">Error al cargar datos del estudiante: ${err.message}</p></div>`;
    }
  },

  // ==========================================
  // VISTA DOCENTE / PROFESOR
  // ==========================================
  async renderDashboardDocente(container, user) {
    try {
      const res = await fetch('/api/academico/notas/docente/materias', {
        headers: {
          'Authorization': `Bearer ${AuthModule.getToken()}`,
          'x-user-id': user.id || '',
          'x-user-role': user.rol || ''
        }
      });

      const list = res.ok ? await res.json() : [];
      const materias = Array.isArray(list) ? list : [];

      let totalEstudiantes = 0;
      materias.forEach(m => totalEstudiantes += Number(m.totalEstudiantes || 0));

      let html = `
        <div class="dash-kpi-grid">
          <div class="dash-kpi-card">
            <div class="kpi-header">
              <div class="kpi-icon" style="background: #eff6ff; color: #3b82f6;"><i class="fa-solid fa-book-open"></i></div>
              <span class="kpi-label">CURSOS A CARGO</span>
            </div>
            <h3 class="kpi-value">${materias.length}</h3>
          </div>

          <div class="dash-kpi-card">
            <div class="kpi-header">
              <div class="kpi-icon" style="background: #ecfdf5; color: #10b981;"><i class="fa-solid fa-users"></i></div>
              <span class="kpi-label">TOTAL ALUMNOS</span>
            </div>
            <h3 class="kpi-value" style="color: #10b981;">${totalEstudiantes}</h3>
          </div>

          <div class="dash-kpi-card">
            <div class="kpi-header">
              <div class="kpi-icon" style="background: #fff7ed; color: #f97316;"><i class="fa-solid fa-clock-rotate-left"></i></div>
              <span class="kpi-label">ESTADO PERIODO</span>
            </div>
            <h3 class="kpi-value" style="font-size: 1.1rem; color: #ea580c; font-weight: 800;">2026-1 (ACTIVO)</h3>
          </div>
        </div>

        <div class="card">
          <h3 style="margin-top: 0; font-size: 1.1rem; color: var(--navy); font-weight: 700; margin-bottom: 15px;">
            <i class="fa-solid fa-chalkboard" style="color: var(--primary-color);"></i> Resumen de Grupos Impartidos
          </h3>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Asignatura</th>
                  <th>Periodo</th>
                  <th class="text-center">Alumnos Matriculados</th>
                </tr>
              </thead>
              <tbody>
                ${materias.length === 0 ? `
                  <tr><td colspan="4" class="text-center" style="padding: 20px; color: var(--muted);">No tiene asignaturas asignadas en el periodo activo.</td></tr>
                ` : materias.map(m => `
                  <tr>
                    <td><b>${m.materiaCodigo || 'S/C'}</b></td>
                    <td>${m.materiaNombre}</td>
                    <td>${m.periodoNombre}</td>
                    <td class="text-center"><span class="badge-role">${m.totalEstudiantes} Alumnos</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;

      container.innerHTML = html;
    } catch (err) {
      container.innerHTML = `<div class="card"><p style="color: var(--red);">Error al cargar panel docente: ${err.message}</p></div>`;
    }
  },

  // ==========================================
  // VISTA ADMINISTRADOR (Ruta Exacta /api/usuarios/users)
  // ==========================================
  async renderDashboardAdmin(container, user) {
    try {
      const token = AuthModule.getToken();
      const headers = {
        'Authorization': `Bearer ${token}`,
        'x-user-role': user.rol || 'ADMIN',
        'x-user-id': user.id || ''
      };

      // Consultas simultáneas con las rutas exactas expuestas por la Gateway
      const [resUsers, resProg, resMat] = await Promise.all([
        fetch('/api/usuarios/users', { headers }).catch(() => null),
        fetch('/api/academico/programas', { headers }).catch(() => null),
        fetch('/api/academico/matriculas', { headers }).catch(() => null)
      ]);

      const dataUsers = (resUsers && resUsers.ok) ? await resUsers.json().catch(() => null) : null;
      const dataProg = (resProg && resProg.ok) ? await resProg.json().catch(() => null) : null;
      const dataMat = (resMat && resMat.ok) ? await resMat.json().catch(() => null) : null;

      // Extracción del array de usuarios devuelto por { users, roles }
      const usersList = Array.isArray(dataUsers) ? dataUsers : (dataUsers?.users || dataUsers?.data || []);
      const progList = Array.isArray(dataProg) ? dataProg : (dataProg?.programas || dataProg?.data || []);
      const matList = Array.isArray(dataMat) ? dataMat : (dataMat?.data || []);

      const totalUsuarios = usersList.length;
      const totalProgramas = progList.length;
      const totalMatriculas = matList.length;

      let html = `
        <div class="dash-kpi-grid">
          <div class="dash-kpi-card">
            <div class="kpi-header">
              <div class="kpi-icon" style="background: #eff6ff; color: #3b82f6;"><i class="fa-solid fa-users"></i></div>
              <span class="kpi-label">USUARIOS ACTIVOS</span>
            </div>
            <h3 class="kpi-value">${totalUsuarios}</h3>
          </div>

          <div class="dash-kpi-card">
            <div class="kpi-header">
              <div class="kpi-icon" style="background: #ecfdf5; color: #10b981;"><i class="fa-solid fa-graduation-cap"></i></div>
              <span class="kpi-label">PROGRAMAS ACTIVOS</span>
            </div>
            <h3 class="kpi-value" style="color: #10b981;">${totalProgramas}</h3>
          </div>

          <div class="dash-kpi-card">
            <div class="kpi-header">
              <div class="kpi-icon" style="background: #fff7ed; color: #f97316;"><i class="fa-solid fa-file-signature"></i></div>
              <span class="kpi-label">GRUPOS MATRICULADOS</span>
            </div>
            <h3 class="kpi-value" style="color: #ea580c;">${totalMatriculas}</h3>
          </div>
        </div>

        <div class="card">
          <h3 style="margin-top: 0; font-size: 1.1rem; color: var(--navy); font-weight: 700; margin-bottom: 10px;">
            <i class="fa-solid fa-sliders" style="color: var(--primary-color);"></i> Estado del Sistema Institucional
          </h3>
          <p style="color: var(--muted); font-size: 0.9rem; margin-bottom: 0;">
            Seleccione una opción en el menú lateral para gestionar los usuarios, asignaturas, actas de notas o pqrs del portal académico.
          </p>
        </div>
      `;

      container.innerHTML = html;
    } catch (err) {
      console.error('Error renderDashboardAdmin:', err);
      container.innerHTML = `<div class="card"><p style="color: var(--red);">Error al cargar panel de administración: ${err.message}</p></div>`;
    }
  }
};

export default HomeDashboardModule;