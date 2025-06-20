<!-- ESTO ES EXTRA: Componente de navegación con modos -->
<!-- les gustaron los modos? -valen -->
<!-- amo -agos -->
<!-- ajkshdkjasd modo fiesta -alfredo -->
<template>
  <nav class="navbar navbar-expand-lg navbar-light pastel-navbar shadow-sm">
    <div class="container">
      <router-link class="navbar-brand pastel-title" to="/">Mixeame Esta</router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/" aria-label="Ir a inicio" :aria-current="$route.path === '/' ? 'page' : null">Inicio</router-link>
          </li>
          <!-- ESTO ES EXTRA: Página de ingredientes -->
          <li class="nav-item">
            <router-link class="nav-link" to="/ingredientes" aria-label="Ver ingredientes" :aria-current="$route.path === '/ingredientes' ? 'page' : null">Ingredientes</router-link>
          </li>
          <!-- ESTO ES EXTRA: Página de comparador -->
          <li class="nav-item d-none d-lg-block">
            <router-link class="nav-link" to="/comparador" aria-label="Comparar cócteles" :aria-current="$route.path === '/comparador' ? 'page' : null">Comparador</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/favoritos" aria-label="Ver favoritos" :aria-current="$route.path === '/favoritos' ? 'page' : null">
              Favoritos
              <!-- ESTO ES EXTRA: Badge con contador de favoritos -->
              <span v-if="contadorFavoritos > 0" class="badge-fav ms-1">{{ contadorFavoritos }}</span>
            </router-link>
          </li>
        </ul>
        <!-- ESTO ES EXTRA: Switch para modo oscuro -->
        <div class="form-check form-switch ms-3">
          <input class="form-check-input" type="checkbox" id="switchDark" v-model="darkMode" @change="toggleDarkMode">
          <label class="form-check-label" for="switchDark">🌙</label>
        </div>
        <!-- ESTO ES EXTRA: Switch para modo fiesta -->
        <div class="form-check form-switch ms-3">
          <input class="form-check-input" type="checkbox" id="switchFiesta" v-model="fiestaMode" @change="toggleFiestaMode">
          <label class="form-check-label" for="switchFiesta">🎉</label>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'Navbar',
  data() {
    return {
      // ESTO ES EXTRA: Contador de favoritos
      contadorFavoritos: 0,
      // ESTO ES EXTRA: Modo oscuro
      darkMode: false,
      // ESTO ES EXTRA: Modo fiesta
      fiestaMode: false,
    };
  },
  mounted() {
    this.actualizarContador();
    window.addEventListener('mostrar-toast', () => setTimeout(this.actualizarContador, 100));
    window.addEventListener('storage', this.actualizarContador);
    if (this.$router) {
      this.$router.afterEach(() => {
        this.actualizarContador();
      });
    }
    // Inicializo dark mode
    this.darkMode = localStorage.getItem('darkMode') === 'true';
    this.setDarkModeClass();
    // Inicializo fiesta mode
    this.fiestaMode = localStorage.getItem('fiestaMode') === 'true';
    this.setFiestaModeClass();
  },
  methods: {
    actualizarContador() {
      const favs = JSON.parse(localStorage.getItem('favoritos')) || [];
      this.contadorFavoritos = favs.length;
    },
    toggleDarkMode() {
      localStorage.setItem('darkMode', this.darkMode);
      this.setDarkModeClass();
      // Disparar evento para actualizar el cursor
      window.dispatchEvent(new CustomEvent('modo-cambiado'));
    },
    setDarkModeClass() {
      if (this.darkMode) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    },
    toggleFiestaMode() {
      localStorage.setItem('fiestaMode', this.fiestaMode);
      this.setFiestaModeClass();
      // Disparar evento para actualizar el cursor
      window.dispatchEvent(new CustomEvent('modo-cambiado'));
    },
    setFiestaModeClass() {
      if (this.fiestaMode) {
        document.body.classList.add('fiesta-mode');
      } else {
        document.body.classList.remove('fiesta-mode');
      }
    },
  },
}
</script>