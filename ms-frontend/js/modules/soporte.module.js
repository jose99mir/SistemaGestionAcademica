/**
 * @file Soporte Module - Frontend
 * @description Módulo frontend de tickets y soporte.
 */

import { AuthModule } from './auth.module.js';

const API_URL = '/api/soporte';

export const SoporteModule = {
  getUserData() {
    const user = AuthModule.getUser() || {};
    const id = user.id || user.usuario_id || user.id_usuario || null;
    const rolRaw = user.rol || user.role || user.tipo || user.tipo_usuario || '';
    const rol = String(rolRaw).trim().toUpperCase();
    const isAdmin = (rol === 'ADMIN' || rol === 'ADMINISTRADOR');

    return { id, rol, isAdmin };
  },

  getHeaders() {
    const { id, rol } = this.getUserData();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AuthModule.getToken()}`,
      'x-user-role': rol,
      'x-user-id': id || ''
    };
  },

  async renderModuloPqrs(container) {
    const { isAdmin } = this.getUserData();

    if (container) {
      container.innerHTML = `
        <div class="card" style="margin-bottom: 20px;">
          <h3>Radicar Nueva Solicitud</h3>
          <form id="formPqrs">
            <input type="hidden" id="pqrs-id">
            <div class="field" style="margin-bottom: 12px;">
              <label style="display:block; font-weight:600; margin-bottom:4px;">Tipo</label>
              <select id="pqrs-tipo" required class="form-control" style="width: 100%; padding: 8px;">
                <option value="PETICION">Petición</option>
                <option value="QUEJA">Queja</option>
                <option value="RECLAMO">Reclamo</option>
                <option value="SUGERENCIA">Sugerencia</option>
              </select>
            </div>
            <div class="field" style="margin-bottom: 12px;">
              <label style="display:block; font-weight:600; margin-bottom:4px;">Asunto</label>
              <input type="text" id="pqrs-asunto" required placeholder="Escribe el asunto" class="form-control" style="width: 100%; padding: 8px;">
            </div>
            <div class="field" style="margin-bottom: 15px;">
              <label style="display:block; font-weight:600; margin-bottom:4px;">Descripción</label>
              <textarea id="pqrs-desc" required placeholder="Detalle de la solicitud" class="form-control" rows="3" style="width: 100%; padding: 8px;"></textarea>
            </div>
            <button type="submit" class="btn-navy" style="background:#0f172a; color:#fff; padding: 10px 20px; border-radius:6px; border:none; cursor:pointer;">Guardar Ticket</button>
          </form>
        </div>

        <div class="card">
          <h3>Listado de Tickets</h3>
          <table class="table" style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr style="border-bottom: 2px solid #e2e8f0; text-align: left;">
                <th style="padding: 8px;">ID</th>
                <th style="padding: 8px;">Tipo</th>
                <th style="padding: 8px;">Asunto</th>
                <th style="padding: 8px;">Descripción</th>
                <th style="padding: 8px;">Acciones</th>
              </tr>
            </thead>
            <tbody id="tabla-pqrs-body">
              <tr><td colspan="5" style="text-align:center; padding: 15px;">Cargando registros...</td></tr>
            </tbody>
          </table>
        </div>

        <!-- Modal Ver Respuesta -->
        <div id="modalVerRespuesta" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); align-items:center; justify-content:center; z-index:1000;">
          <div style="background:#fff; width:90%; max-width:450px; padding:20px; border-radius:8px;">
            <h3 id="modal-asunto" style="margin-top:0; color:#0f172a;">Respuesta del Ticket</h3>
            <p id="modal-texto" style="background:#f1f5f9; padding:12px; border-radius:6px; white-space:pre-wrap; color:#334155;"></p>
            <div style="text-align:right; margin-top:15px;">
              <button type="button" id="btnCerrarModal" class="btn-navy" style="padding:8px 16px; background:#64748b; color:#fff; border:none; border-radius:4px; cursor:pointer;">Cerrar</button>
            </div>
          </div>
        </div>
      `;
    }

    this.bindEvents();
    await this.cargarTabla(container);
  },

  bindEvents() {
    const formPqrs = document.getElementById('formPqrs');
    if (formPqrs) {
      formPqrs.onsubmit = async (e) => {
        e.preventDefault();
        await this.crearTicket();
      };
    }

    const btnCerrarModal = document.getElementById('btnCerrarModal');
    if (btnCerrarModal) {
      btnCerrarModal.onclick = () => {
        const modal = document.getElementById('modalVerRespuesta');
        if (modal) modal.style.display = 'none';
      };
    }
  },

  async cargarTabla(container) {
    const { id, isAdmin } = this.getUserData();
    const tbody = document.getElementById('tabla-pqrs-body') || document.getElementById('pqrs-table-body');

    if (!tbody) return;

    try {
      if (!isAdmin && !id) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:orange; padding:15px;">ID de usuario no encontrado en la sesión. Revise AuthModule.</td></tr>`;
        return;
      }

      const endpoint = isAdmin ? `${API_URL}/todos` : `${API_URL}/usuario/${id}`;
      const res = await fetch(endpoint, { headers: this.getHeaders() });

      if (!res.ok) {
        throw new Error(`Error en el servidor HTTP: ${res.status}`);
      }

      const tickets = await res.json();
      tbody.innerHTML = '';

      if (!Array.isArray(tickets) || tickets.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:15px;">No hay tickets registrados.</td></tr>`;
        return;
      }

      tickets.forEach(t => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #f1f5f9';

        let accionesTd = '';

        if (isAdmin) {
          // Botones sólo para Administrador
          accionesTd = `
            <button class="btn-edit btn-navy" data-id="${t.id}" data-tipo="${t.tipo}" data-asunto="${t.asunto}" data-desc="${t.descripcion}"
                    style="background:#0f172a; color:#fff; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:0.85rem;">Editar</button>
            <button class="btn-del btn-navy" data-id="${t.id}"
                    style="background:#ef4444; color:#fff; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:0.85rem;">Eliminar</button>
          `;
        } else {
          // Botón único para Estudiantes / Docentes
          accionesTd = `
            <button type="button" class="btn-view-resp" data-asunto="${t.asunto}" data-respuesta="${t.respuesta || ''}"
                    style="background:#0284c7; color:#fff; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:0.85rem;">
              Ver Respuesta
            </button>
          `;
        }

        tr.innerHTML = `
          <td style="padding: 10px 8px;">${t.id}</td>
          <td style="padding: 10px 8px;">${t.tipo}</td>
          <td style="padding: 10px 8px;"><strong>${t.asunto}</strong></td>
          <td style="padding: 10px 8px;">${t.descripcion}</td>
          <td style="padding: 10px 8px;">${accionesTd}</td>
        `;

        tbody.appendChild(tr);
      });

      // Asignar evento al botón "Ver Respuesta"
      document.querySelectorAll('.btn-view-resp').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const ds = e.currentTarget.dataset;
          const modalAsunto = document.getElementById('modal-asunto');
          const modalTexto = document.getElementById('modal-texto');
          const modal = document.getElementById('modalVerRespuesta');

          if (modalAsunto) modalAsunto.innerText = ds.asunto;
          if (modalTexto) {
            modalTexto.innerText = (ds.respuesta && ds.respuesta.trim() !== '') 
              ? ds.respuesta 
              : 'Su solicitud aún no ha sido respondida.';
          }
          if (modal) modal.style.display = 'flex';
        });
      });

    } catch (err) {
      console.error(err);
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red; padding:15px;">Error al consultar las PQRS.</td></tr>`;
    }
  },

  async crearTicket() {
    const { id } = this.getUserData();
    const tipo = document.getElementById('pqrs-tipo').value;
    const asunto = document.getElementById('pqrs-asunto').value;
    const descripcion = document.getElementById('pqrs-desc').value;

    try {
      const res = await fetch(`${API_URL}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ tipo, asunto, descripcion, usuario_id: id })
      });

      if (!res.ok) throw new Error('Error al radicar ticket');

      document.getElementById('formPqrs').reset();
      await this.cargarTabla();
    } catch (err) {
      alert(err.message);
    }
  }
};

export default SoporteModule;