/**
 * @file Pagination Component - Frontend
 * @location ms-frontend/js/modules/pagination.component.js
 * @description Componente reutilizable y desacoplado para manejar la paginación en tablas HTML.
 */

export class PaginationHelper {
  /**
   * @param {Object} config - Configuración del paginador
   * @param {string} config.containerId - ID del elemento contenedor HTML para el paginador
   * @param {number} [config.rowsPerPage=5] - Cantidad de filas por página por defecto
   * @param {Function} [config.onPageChange] - Callback que se ejecuta cuando cambia la página
   */
  constructor({ containerId, rowsPerPage = 5, onPageChange = null }) {
    this.containerId = containerId;
    this.container = null;
    this.rowsPerPage = rowsPerPage;
    this.currentPage = 1;
    this.data = [];
    this.onPageChange = onPageChange;
  }

  setData(data) {
    this.data = Array.isArray(data) ? data : [];
    this.currentPage = 1;
  }

  getPaginatedData() {
    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    return this.data.slice(start, end);
  }

  getTotalPages() {
    return Math.ceil(this.data.length / this.rowsPerPage) || 1;
  }

  goToPage(page) {
    const totalPages = this.getTotalPages();
    if (page < 1 || page > totalPages) return;

    this.currentPage = page;
    if (typeof this.onPageChange === 'function') {
      this.onPageChange(this.currentPage);
    }
  }

  render() {
    // Buscar siempre la referencia en el DOM activo
    this.container = document.getElementById(this.containerId);

    if (!this.container) return;

    const totalPages = this.getTotalPages();
    const totalItems = this.data.length;

    if (totalItems === 0) {
      this.container.innerHTML = '';
      return;
    }

    const startItem = (this.currentPage - 1) * this.rowsPerPage + 1;
    const endItem = Math.min(this.currentPage * this.rowsPerPage, totalItems);

    this.container.innerHTML = `
      <div class="pagination-info" style="font-size: 0.9rem; color: #4b5563; font-weight: 500;">
        Mostrando <b>${startItem}</b> a <b>${endItem}</b> de <b>${totalItems}</b> registros
      </div>
      <div class="pagination-controls" style="display: flex; gap: 8px; align-items: center;">
        <button type="button" class="btn-primary btn-page" id="${this.containerId}-prev" ${this.currentPage === 1 ? 'disabled' : ''}>
          <i class="fa-solid fa-chevron-left"></i> Anterior
        </button>
        <span class="page-indicator" style="font-size: 0.9rem; margin: 0 6px; font-weight: 600; color: #374151;">
          Página <b>${this.currentPage}</b> de <b>${totalPages}</b>
        </span>
        <button type="button" class="btn-primary btn-page" id="${this.containerId}-next" ${this.currentPage >= totalPages ? 'disabled' : ''}>
          Siguiente <i class="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    `;

    const btnPrev = document.getElementById(`${this.containerId}-prev`);
    const btnNext = document.getElementById(`${this.containerId}-next`);

    if (btnPrev) {
      btnPrev.onclick = () => this.goToPage(this.currentPage - 1);
    }

    if (btnNext) {
      btnNext.onclick = () => this.goToPage(this.currentPage + 1);
    }
  }
}

export default PaginationHelper;