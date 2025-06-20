// Utilidades para el sistema de confeti
export const confetiUtils = {
  // Disparar explosión de confeti
  dispararConfeti(x, y, tipo = 'normal', intensidad = 1) {
    // Solo disparar si está en modo fiesta
    if (!document.body.classList.contains('fiesta-mode')) return;
    
    window.dispatchEvent(new CustomEvent('explosion-confeti', {
      detail: { x, y, tipo, intensidad }
    }));
  },

  // Configurar eventos de confeti para elementos
  configurarConfeti() {
    if (!document.body.classList.contains('fiesta-mode')) return;

    // Eventos para cards
    document.addEventListener('mouseenter', (e) => {
      if (e.target instanceof HTMLElement && e.target.closest('.pastel-card')) {
        const rect = e.target.getBoundingClientRect();
        this.dispararConfeti(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
          'hover',
          0.8
        );
      }
    });

    // Eventos para botones
    document.addEventListener('click', (e) => {
      if (!(e.target instanceof HTMLElement)) return;
      
      if (e.target.closest('.btn-outline-primary')) {
        this.dispararConfeti(e.clientX, e.clientY, 'boton', 1);
      } else if (e.target.closest('.btn-danger')) {
        this.dispararConfeti(e.clientX, e.clientY, 'favorito', 1.5);
      } else if (e.target.closest('.nav-link')) {
        this.dispararConfeti(e.clientX, e.clientY, 'nav', 0.8);
      } else if (e.target.closest('.btn-categoria')) {
        this.dispararConfeti(e.clientX, e.clientY, 'boton', 0.8);
      } else if (e.target.closest('.pagination .page-link')) {
        this.dispararConfeti(e.clientX, e.clientY, 'boton', 0.8);
      } else if (e.target.closest('.carousel-control-prev, .carousel-control-next')) {
        this.dispararConfeti(e.clientX, e.clientY, 'boton', 0.8);
      } else if (e.target.closest('.carousel-actions .btn-like')) {
        this.dispararConfeti(e.clientX, e.clientY, 'favorito', 1.2);
      } else if (e.target.closest('.navbar-brand')) {
        this.dispararConfeti(e.clientX, e.clientY, 'nav', 0.8);
      }
    });

    // Eventos para inputs
    document.addEventListener('focus', (e) => {
      if (e.target instanceof HTMLElement && e.target.matches('.pastel-input, .form-select')) {
        const rect = e.target.getBoundingClientRect();
        this.dispararConfeti(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
          'boton',
          0.5
        );
      }
    }, true);

    // Eventos para toast
    document.addEventListener('DOMNodeInserted', (e) => {
      if (e.target instanceof HTMLElement && e.target.classList && e.target.classList.contains('toast-app')) {
        const rect = e.target.getBoundingClientRect();
        this.dispararConfeti(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
          'boton',
          0.6
        );
      }
    });
  },

  // Limpiar eventos de confeti
  limpiarConfeti() {
    // Los eventos se limpian automáticamente cuando se desactiva el modo fiesta
  },

  // Inicializar sistema de confeti
  inicializar() {
    // Configurar eventos cuando se activa el modo fiesta
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          if (document.body.classList.contains('fiesta-mode')) {
            this.configurarConfeti();
          }
        }
      });
    });

    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    // Configurar inicialmente si ya está en modo fiesta
    if (document.body.classList.contains('fiesta-mode')) {
      this.configurarConfeti();
    }
  }
};

// Inicializar automáticamente
if (typeof window !== 'undefined') {
  confetiUtils.inicializar();
} 