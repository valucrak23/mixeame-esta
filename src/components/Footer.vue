<!-- ESTO ES EXTRA: Footer del equipo -->
<!-- no se rian de mi footer ajkkshdkahd me re gusta -valen -->
<template>
  <footer class="footer-pastel">
    <div class="container">
      <div class="footer-content">
        <div class="footer-text">
          <span class="footer-label">Desarrollado por:</span>
          <div class="footer-names">
            <span class="footer-name" data-name="valentina">Valentina Ijelchuk</span>
            <span class="footer-separator">•</span>
            <span class="footer-name" data-name="agostina">Agostina Cruz</span>
            <span class="footer-separator">•</span>
            <span class="footer-name" data-name="alfredo">Alfredo Cubillo</span>
          </div>
        </div>
        <div class="footer-emoji">
          🍹
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer',
  mounted() {
    // ESTO ES EXTRA: Efecto hover en los nombres
    this.configurarEfectosNombres();
  },
  methods: {
    // ESTO ES EXTRA: Configurar efectos hover en los nombres
    configurarEfectosNombres() {
      const nombres = document.querySelectorAll('.footer-name');
      
      nombres.forEach(nombre => {
        nombre.addEventListener('mouseenter', () => {
          nombre.style.transform = 'scale(1.1)';
          nombre.style.textShadow = '0 0 10px currentColor';
        });
        
        nombre.addEventListener('mouseleave', () => {
          nombre.style.transform = 'scale(1)';
          nombre.style.textShadow = 'none';
        });
      });
    }
  }
}
</script> 