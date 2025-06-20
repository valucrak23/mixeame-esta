<template>
  <div id="app" @mousemove="moverCoctel">
    <Navbar />
    <router-view />
    <Confeti />
    <div id="emoji-cursor" :class="{ visible: coctelVisible }" :style="coctelStyle">{{ emojiCursor }}</div>
    <transition-group name="toast" tag="div" class="toast-container">
      <div 
        v-for="toast in toasts" 
        :key="toast.id" 
        :class="['toast-app', toast.tipo]"
        @click="cerrarToast(toast.id)"
      >
        <div class="toast-icon">
          <svg v-if="toast.tipo === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else-if="toast.tipo === 'error'" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else-if="toast.tipo === 'warning'" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="toast-content">
          <div class="toast-message">{{ toast.mensaje }}</div>
          <div class="toast-progress" :style="{ width: toast.progress + '%' }"></div>
        </div>
        <button class="toast-close" @click.stop="cerrarToast(toast.id)" aria-label="Cerrar notificación">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue';
import Confeti from './components/Confeti.vue';

export default {
  name: 'App',
  components: { Navbar, Confeti },
  data() {
    return {
      coctelX: 0,
      coctelY: 0,
      coctelVisible: false,
      emojiCursor: '🍹',
      toasts: [],
      toastId: 0,
    };
  },
  computed: {
    coctelStyle() {
      return {
        left: this.coctelX + 12 + 'px',
        top: this.coctelY + 12 + 'px',
      };
    },
  },
  methods: {
    moverCoctel(e) {
      this.coctelX = e.clientX;
      this.coctelY = e.clientY;
      this.coctelVisible = true;
    },
    mostrarToast(mensaje, tipo = 'success', duracion = 4000) {
      const id = ++this.toastId;
      const toast = {
        id,
        mensaje,
        tipo,
        progress: 100,
        duracion,
      };
      
      this.toasts.push(toast);
      
      // Animación de progreso
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.max(0, 100 - (elapsed / duracion) * 100);
        
        const toastIndex = this.toasts.findIndex(t => t.id === id);
        if (toastIndex !== -1) {
          this.toasts[toastIndex].progress = progress;
        }
        
        if (progress > 0 && this.toasts.find(t => t.id === id)) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
      
      // Auto-cerrar
      setTimeout(() => {
        this.cerrarToast(id);
      }, duracion);
    },
    cerrarToast(id) {
      const index = this.toasts.findIndex(t => t.id === id);
      if (index !== -1) {
        this.toasts.splice(index, 1);
      }
    },
    actualizarEmojiCursor() {
      const dark = localStorage.getItem('darkMode') === 'true' || document.body.classList.contains('dark-mode');
      const fiesta = localStorage.getItem('fiestaMode') === 'true' || document.body.classList.contains('fiesta-mode');
      
      if (fiesta) {
        this.emojiCursor = '🎉';
      } else if (dark) {
        this.emojiCursor = '🍸';
      } else {
        this.emojiCursor = '🍹';
      }
    },
  },
  mounted() {
    window.addEventListener('mostrar-toast', (e) => {
      const { mensaje, tipo, duracion } = e.detail;
      this.mostrarToast(mensaje, tipo, duracion);
    });
    this.actualizarEmojiCursor();
    window.addEventListener('storage', this.actualizarEmojiCursor);
    window.addEventListener('modo-cambiado', this.actualizarEmojiCursor);
    // Escuchar cambios de clase en body (por si cambia desde Navbar)
    const observer = new MutationObserver(() => this.actualizarEmojiCursor());
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  },
};
</script>
