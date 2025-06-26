<template>
  <div class="main-content">
    <div class="container py-4" ref="contenedorHome">
      <section class="mb-5 text-center">
        <h1 class="display-4 fw-bold pastel-title">Master Cocktail App for <span class="girly-text">strong men</span> only</h1>
        <p class="lead">Descubre cócteles, busca tus favoritos y aprende a prepararlos.</p>
        <!-- ESTO ES EXTRA: Indicador temporal del modo fiesta -->
        <div v-if="isFiestaMode" class="alert alert-warning mt-3">
          🎉 ¡Modo fiesta activado! La ruleta debería aparecer abajo.
        </div>
        <div v-else class="alert alert-info mt-3">
          💡 Activa el modo fiesta (🎉) en la barra de navegación para ver la ruleta de tragos.
        </div>
      </section>
      <section class="mb-4 d-flex flex-wrap gap-3 align-items-center justify-content-center">
        <input v-model="busqueda" @keyup.enter="buscar" class="form-control form-control-lg pastel-input input-busqueda" placeholder="Buscar cóctel por nombre..." aria-label="Buscar cóctel por nombre" />
        <button class="btn btn-outline-primary btn-buscar ripple-click" @click="buscar" aria-label="Buscar">
          <span v-if="ripple" class="ripple-buscar" :style="rippleStyle"></span>
          Buscar
        </button>
        <select v-model="filtroCategoria" @change="filtrarPorCategoria" class="form-select pastel-input select-categoria" aria-label="Filtrar por categoría">
          <option value="">Todas las categorías</option>
          <option v-for="cat in categorias" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </section>
      <section class="mb-5" v-if="!busqueda && !filtroCategoria">
        <CarouselRecomendados />
      </section>
      
      <!-- ESTO ES EXTRA: Ruleta de tragos en modo fiesta -->
      <section v-if="isFiestaMode && !busqueda && !filtroCategoria" class="mb-5">
        <div class="ruleta-container">
          <h2 class="mb-4 pastel-section text-center">🎰 ¡Ruleta de Tragos! 🎰</h2>
          <div class="ruleta-wrapper">
            <div class="ruleta-display">
              <div v-if="!ruletaGirando && !cocktailRuleta" class="ruleta-placeholder">
                <div class="ruleta-emoji">🍹</div>
                <p class="ruleta-text">¡Haz girar la ruleta para descubrir un cóctel sorpresa!</p>
              </div>
              <div v-else-if="ruletaGirando" class="ruleta-spinning">
                <div class="ruleta-spinner">🎰</div>
                <p class="ruleta-text">¡Girando, girando...!</p>
              </div>
              <div v-else-if="cocktailRuleta" class="ruleta-result">
                <img :src="cocktailRuleta.strDrinkThumb" :alt="cocktailRuleta.strDrink" class="ruleta-image">
                <h4 class="ruleta-title">{{ cocktailRuleta.strDrink }}</h4>
                <p class="ruleta-category">{{ cocktailRuleta.strCategory || 'Cóctel' }}</p>
                <div class="ruleta-actions">
                  <button class="btn btn-outline-primary ripple-click" @click="verDetalleRuleta">
                    Ver detalles
                  </button>
                  <button class="btn btn-outline-danger ripple-click" @click="agregarFavoritoRuleta">
                    {{ isFavoritoRuleta ? '❤️' : '🤍' }}
                  </button>
                </div>
              </div>
            </div>
            <button 
              class="btn btn-ruleta ripple-click" 
              @click="girarRuleta"
              :disabled="ruletaGirando"
              :aria-label="ruletaGirando ? 'Ruleta girando...' : 'Girar ruleta de tragos'"
            >
              <span class="btn-ruleta-text">{{ ruletaGirando ? '🎰 Girando...' : '🎰 ¡Girar Ruleta!' }}</span>
            </button>
          </div>
        </div>
      </section>
      
      <section class="mb-5">
        <h2 class="mb-4 pastel-section">Cócteles Populares</h2>
        <div style="min-height: 420px; position: relative;">
          <transition name="fade-loader">
            <div v-if="loading" class="text-center my-5">
              <Loader />
            </div>
          </transition>
          <transition-group name="fade-slide" tag="div" v-if="!loading && cocktailsPagina.length" class="row g-4">
            <div v-for="drink in cocktailsPagina" :key="drink.idDrink" class="col-12 col-sm-6 col-md-4 col-lg-3">
              <div
                class="card h-100 shadow pastel-card card-coctel flip-card"
                :class="{ flipped: flippedCard === drink.idDrink }"
                @click="flipCard(drink.idDrink)"
                @mouseleave="flippedCard = null"
                tabindex="0"
                :aria-label="'Ver información de ' + drink.strDrink"
                @keydown.enter.prevent="flipCard(drink.idDrink)"
                @keydown.space.prevent="flipCard(drink.idDrink)"
              >
                <div class="flip-card-inner">
                  <div class="flip-card-front">
                    <img v-if="drink.strDrinkThumb" :src="drink.strDrinkThumb" :alt="'Imagen del cóctel ' + drink.strDrink" class="card-img-top img-coctel">
                    <div class="card-title text-center mb-3">{{ drink.strDrink }}</div>
                  </div>
                  <div class="flip-card-back d-flex flex-column align-items-center justify-content-center">
                    <div class="mb-2"><strong>Categoría:</strong> {{ drink.strCategory || 'N/A' }}</div>
                    <div class="mb-2"><strong>Vaso:</strong> {{ drink.strGlass || 'N/A' }}</div>
                    <div class="mb-2"><strong>Ingredientes:</strong> <span v-if="getIngredientes(drink).length">{{ getIngredientes(drink).slice(0,2).join(', ') }}</span><span v-else>N/A</span></div>
                    <button class="btn btn-outline-danger ripple-click btn-like" @click.stop="toggleLike(drink)" :aria-label="isFavorito(drink.idDrink) ? 'Quitar de favoritos' : 'Agregar a favoritos'">
                      <span class="corazon-pop" :class="{ pop: animarLike === drink.idDrink }">{{ isFavorito(drink.idDrink) ? '❤️' : '🤍' }}</span>
                    </button>
                    <router-link :to="`/detalle/${drink.idDrink}`" class="btn btn-outline-primary mt-3 ripple-click" :aria-label="'Ver detalles de ' + drink.strDrink" @click.native="guardarEstadoBusquedaFiltro">Ver detalles</router-link>
                  </div>
                </div>
              </div>
            </div>
          </transition-group>
          <transition name="fade-msg">
            <p v-if="!loading && !cocktailsPagina.length" class="text-center my-5">No se encontraron cócteles.</p>
          </transition>
        </div>
        <nav v-if="totalPaginas > 1" class="d-flex flex-column align-items-center mt-4">
          <ul class="pagination mb-2">
            <li class="page-item" :class="{ disabled: paginaActual === 1 }">
              <button class="page-link ripple-click" @click="cambiarPagina(1)" :disabled="paginaActual === 1">« Primera</button>
            </li>
            <li class="page-item" :class="{ disabled: paginaActual === 1 }">
              <button class="page-link ripple-click" @click="cambiarPagina(paginaActual - 1)" :disabled="paginaActual === 1">Anterior</button>
            </li>
            <li v-if="paginaActual > 1" class="page-item">
              <button class="page-link ripple-click" @click="cambiarPagina(paginaActual - 1)">{{ paginaActual - 1 }}</button>
            </li>
            <li class="page-item active">
              <button class="page-link ripple-click" @click="cambiarPagina(paginaActual)">{{ paginaActual }}</button>
            </li>
            <li v-if="paginaActual < totalPaginas" class="page-item">
              <button class="page-link ripple-click" @click="cambiarPagina(paginaActual + 1)">{{ paginaActual + 1 }}</button>
            </li>
            <li class="page-item" :class="{ disabled: paginaActual === totalPaginas }">
              <button class="page-link ripple-click" @click="cambiarPagina(paginaActual + 1)" :disabled="paginaActual === totalPaginas">Siguiente</button>
            </li>
            <li class="page-item" :class="{ disabled: paginaActual === totalPaginas }">
              <button class="page-link ripple-click" @click="cambiarPagina(totalPaginas)" :disabled="paginaActual === totalPaginas">Última »</button>
            </li>
          </ul>
          <div class="text-muted small">
            Mostrando página {{ paginaActual }} de {{ totalPaginas }} | Total: {{ cocktailsFiltrados.length }} cócteles
          </div>
        </nav>
      </section>
      <section class="text-center">
        <h2 class="mb-3 pastel-section">¿Por qué amar los cócteles?</h2>
        <p>Los cócteles son una mezcla de arte, sabor y creatividad. ¡Descubre nuevas recetas y sorprende a tus amigos!</p>
      </section>
      <button v-show="showScrollTop" class="btn-scroll-top" @click="scrollToTop" aria-label="Volver arriba">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 19V5M12 5L5 12M12 5l7 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
import Loader from '../components/Loader.vue';
import CarouselRecomendados from '../components/CarouselRecomendados.vue';

export default {
  name: 'Home',
  data() {
    return {
      cocktails: [],
      cocktailsFiltrados: [],
      categorias: [],
      busqueda: '',
      filtroCategoria: '',
      paginaActual: 1,
      porPagina: 12,
      loading: false,
      ripple: false,
      rippleStyle: {},
      flippedCard: null,
      animarLike: null,
      showScrollTop: false,
      isFiestaMode: false,
      ruletaGirando: false,
      cocktailRuleta: null,
      isFavoritoRuleta: false,
    };
  },
  computed: {
    totalPaginas() {
      return Math.ceil(this.cocktailsFiltrados.length / this.porPagina);
    },
    cocktailsPagina() {
      const start = (this.paginaActual - 1) * this.porPagina;
      const end = start + this.porPagina;
      return this.cocktailsFiltrados.slice(start, end);
    },
  },
  async created() {
    await this.cargarCategorias();
    await this.cargar10PorLetra();
  },
  components: { Loader, CarouselRecomendados },
  methods: {
    async cargarCategorias() {
      const res = await fetch('https://www.thecocktaildb.com/api/json/v1/1/list.php?c=list');
      const data = await res.json();
      this.categorias = data.drinks.map(c => c.strCategory);
    },
    async cargar10PorLetra() {
      this.loading = true;
      const cacheKey = 'cocktails_home';
      const cacheTimeKey = 'cocktails_home_time';
      const now = Date.now();
      const cacheMs = 60 * 60 * 1000; // 1 hora
      const cache = localStorage.getItem(cacheKey);
      const cacheTime = localStorage.getItem(cacheTimeKey);
      if (cache && cacheTime && now - parseInt(cacheTime) < cacheMs) {
        const todos = JSON.parse(cache);
        this.cocktails = todos;
        this.cocktailsFiltrados = todos;
        this.paginaActual = 1;
        this.loading = false;
        return;
      }
      const abecedario = 'abcdefghijklmnopqrstuvwxyz'.split('');
      let todos = [];
      for (const letra of abecedario) {
        try {
          const res = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?f=${letra}`);
          const data = await res.json();
          if (data.drinks && data.drinks.length) {
            todos = todos.concat(data.drinks.slice(0, 10));
          }
        } catch (e) {
          continue;
        }
      }
      localStorage.setItem(cacheKey, JSON.stringify(todos));
      localStorage.setItem(cacheTimeKey, now.toString());
      this.cocktails = todos;
      this.cocktailsFiltrados = todos;
      this.paginaActual = 1;
      this.loading = false;
    },
    async cargarPorCategoria() {
      this.loading = true;
      let url = '';
      if (this.filtroCategoria) {
        url = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(this.filtroCategoria)}`;
      } else {
        // Si no hay filtro, muestro los 10 por letra
        await this.cargar10PorLetra();
        this.loading = false;
        return;
      }
      const res = await fetch(url);
      const data = await res.json();
      const basicos = data.drinks || [];
      // Traer detalles completos solo para los primeros 24 (2 páginas)
      const ids = basicos.slice(0, 24).map(d => d.idDrink);
      const detalles = await Promise.all(ids.map(async id => {
        try {
          const resDet = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`);
          const dataDet = await resDet.json();
          return dataDet.drinks ? dataDet.drinks[0] : null;
        } catch (e) {
          return null;
        }
      }));
      // Mezclar los detalles completos con los básicos restantes (por si hay más de 24)
      const cocktails = detalles.filter(Boolean).concat(basicos.slice(24));
      this.cocktails = cocktails;
      this.cocktailsFiltrados = cocktails;
      this.paginaActual = 1;
      this.loading = false;
    },
    async buscar(e) {
      if (e && e.target) {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.rippleStyle = {
          left: x + 'px',
          top: y + 'px',
        };
        this.ripple = false;
        this.$nextTick(() => { this.ripple = true; });
        setTimeout(() => { this.ripple = false; }, 700);
      }
      if (!this.busqueda) {
        await this.cargarPorCategoria();
        return;
      }
      const res = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(this.busqueda)}`);
      const data = await res.json();
      this.cocktails = data.drinks || [];
      this.cocktailsFiltrados = this.cocktails;
      this.paginaActual = 1;
    },
    async filtrarPorCategoria() {
      await this.cargarPorCategoria();
      this.scrollToCards();
    },
    cambiarPagina(nueva) {
      if (nueva < 1 || nueva > this.totalPaginas) return;
      this.paginaActual = nueva;
      this.scrollToCards();
    },
    flipCard(id) {
      if (this.flippedCard === id) {
        this.flippedCard = null;
      } else {
        this.flippedCard = id;
      }
    },
    getIngredientes(drink) {
      const ings = [];
      for (let i = 1; i <= 5; i++) {
        const ing = drink[`strIngredient${i}`];
        if (ing) ings.push(ing);
      }
      return ings;
    },
    isFavorito(id) {
      const favs = JSON.parse(localStorage.getItem('favoritos')) || [];
      return favs.includes(id);
    },
    toggleLike(drink) {
      let favs = JSON.parse(localStorage.getItem('favoritos')) || [];
      if (favs.includes(drink.idDrink)) {
        favs = favs.filter(f => f !== drink.idDrink);
      } else {
        favs.push(drink.idDrink);
      }
      localStorage.setItem('favoritos', JSON.stringify(favs));
      this.animarLike = drink.idDrink;
      setTimeout(() => { this.animarLike = null; }, 500);
      window.dispatchEvent(new CustomEvent('mostrar-toast', { 
        detail: { 
          mensaje: favs.includes(drink.idDrink) ? '¡Agregado a favoritos!' : '¡Eliminado de favoritos!', 
          tipo: 'success',
          duracion: 2500
        } 
      }));
    },
    scrollToCards() {
      this.$nextTick(() => {
        const el = this.$refs.contenedorHome;
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    },
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    handleScrollBtn() {
      this.showScrollTop = window.scrollY > 200;
    },
    async girarRuleta() {
      this.ruletaGirando = true;
      
      // Disparar confeti al girar
      if (this.isFiestaMode) {
        window.dispatchEvent(new CustomEvent('explosion-confeti', {
          detail: { x: window.innerWidth / 2, y: window.innerHeight / 2, tipo: 'favorito', intensidad: 2 }
        }));
      }
      
      try {
        const res = await fetch('https://www.thecocktaildb.com/api/json/v1/1/random.php');
        const data = await res.json();
        
        // Simular tiempo de giro
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        this.cocktailRuleta = data.drinks[0];
        this.isFavoritoRuleta = this.isFavorito(this.cocktailRuleta.idDrink);
        
        // Disparar confeti al resultado
        if (this.isFiestaMode) {
          window.dispatchEvent(new CustomEvent('explosion-confeti', {
            detail: { x: window.innerWidth / 2, y: window.innerHeight / 2, tipo: 'favorito', intensidad: 3 }
          }));
        }
        
        // Mostrar toast de celebración
        window.dispatchEvent(new CustomEvent('mostrar-toast', { 
          detail: { 
            mensaje: `¡🎉 ${this.cocktailRuleta.strDrink} es tu cóctel del día!`, 
            tipo: 'success',
            duracion: 4000
          } 
        }));
        
      } catch (error) {
        console.error('Error al girar la ruleta:', error);
        window.dispatchEvent(new CustomEvent('mostrar-toast', { 
          detail: { 
            mensaje: '¡Ups! Algo salió mal con la ruleta', 
            tipo: 'error',
            duracion: 3000
          } 
        }));
      } finally {
        this.ruletaGirando = false;
      }
    },
    verDetalleRuleta() {
      if (this.cocktailRuleta) {
        this.$router.push(`/detalle/${this.cocktailRuleta.idDrink}`);
      }
    },
    agregarFavoritoRuleta() {
      if (this.cocktailRuleta) {
        this.toggleLike(this.cocktailRuleta);
        this.isFavoritoRuleta = this.isFavorito(this.cocktailRuleta.idDrink);
      }
    },
    // ESTO ES EXTRA: Detectar modo fiesta
    detectarModoFiesta() {
      this.isFiestaMode = document.body.classList.contains('fiesta-mode');
      console.log('Modo fiesta detectado:', this.isFiestaMode);
      console.log('Clases del body:', document.body.classList.toString());
    },
    guardarEstadoBusquedaFiltro() {
      localStorage.setItem('estadoBusquedaFiltro', JSON.stringify({
        busqueda: this.busqueda,
        filtroCategoria: this.filtroCategoria,
        paginaActual: this.paginaActual
      }));
    },
  },
  async mounted() {
    window.addEventListener('scroll', this.handleScrollBtn);
    // ESTO ES EXTRA: Detectar modo fiesta inicial
    this.detectarModoFiesta();
    // ESTO ES EXTRA: Escuchar cambios de modo
    window.addEventListener('modo-cambiado', this.detectarModoFiesta);
    // ESTO ES EXTRA: Observer para cambios de clase en body
    const observer = new MutationObserver(() => this.detectarModoFiesta());
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    // Restaurar estado desde query si existe
    if (this.$route && (this.$route.query.busqueda !== undefined || this.$route.query.filtroCategoria !== undefined)) {
      this.busqueda = this.$route.query.busqueda || '';
      this.filtroCategoria = this.$route.query.filtroCategoria || '';
      this.paginaActual = parseInt(this.$route.query.paginaActual) || 1;
      if (this.busqueda) {
        await this.buscar();
      } else if (this.filtroCategoria) {
        await this.cargarPorCategoria();
      }
      // Limpiar la query para no dejar basura en la URL
      this.$router.replace({ path: '/', query: {} });
    }
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScrollBtn);
    window.removeEventListener('modo-cambiado', this.detectarModoFiesta);
  },
}
</script>