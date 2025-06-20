<template>
  <div class="container py-4" ref="contenedorIngs">
    <h1 class="mb-4 pastel-title text-center">Ingredientes</h1>
    <div v-if="cargando" class="text-center my-5">
      <Loader />
    </div>
    <div v-else>
      <div v-if="!ingredienteSeleccionado">
        <div class="d-flex flex-wrap gap-2 justify-content-center mb-4">
          <button v-for="cat in categorias" :key="cat.nombre" class="btn btn-outline-primary btn-categoria ripple-click" :class="{ active: categoriaActual === cat.nombre }" @click="cambiarCategoria(cat.nombre)" tabindex="0" :aria-label="'Filtrar por categoría ' + cat.nombre" @keydown.enter.prevent="cambiarCategoria(cat.nombre)" @keydown.space.prevent="cambiarCategoria(cat.nombre)">
            <span v-if="categoriaActual === cat.nombre" class="ripple-extra"></span>
            {{ cat.emoji }} {{ cat.nombre }}
          </button>
        </div>
        <div style="min-height: 420px; position: relative;">
          <transition name="fade-loader">
            <div v-if="cargando" class="text-center my-5">
              <Loader />
            </div>
          </transition>
          <transition-group name="fade-slide" tag="div" v-if="!cargando && ingredientesPaginados.length" class="row g-3 justify-content-center">
            <div v-for="ing in ingredientesPaginados" :key="ing.strIngredient1" class="col-6 col-sm-4 col-md-3 col-lg-2">
              <button class="btn btn-outline-primary btn-ingrediente ripple-click w-100 mb-2 d-flex align-items-center justify-content-center gap-2" @click="verCocteles(ing.strIngredient1)" tabindex="0" :aria-label="'Ver cócteles con ' + ing.strIngredient1" @keydown.enter.prevent="verCocteles(ing.strIngredient1)" @keydown.space.prevent="verCocteles(ing.strIngredient1)">
                <span>{{ ing.strIngredient1 }}</span>
              </button>
            </div>
          </transition-group>
          <transition name="fade-msg">
            <p v-if="!cargando && !ingredientesPaginados.length" class="text-center my-5">No hay ingredientes en esta categoría.</p>
          </transition>
        </div>
        <nav v-if="totalPaginas > 1" class="d-flex justify-content-center mt-3">
          <ul class="pagination">
            <li class="page-item" :class="{ disabled: paginaActual === 1 }">
              <button class="page-link ripple-click" @click="cambiarPagina(1)" :disabled="paginaActual === 1" aria-label="Primera página">«</button>
            </li>
            <li class="page-item" :class="{ disabled: paginaActual === 1 }">
              <button class="page-link ripple-click" @click="cambiarPagina(paginaActual - 1)" :disabled="paginaActual === 1" aria-label="Página anterior">Anterior</button>
            </li>
            <li class="page-item active">
              <button class="page-link ripple-click" @click="cambiarPagina(paginaActual)" aria-label="Página actual">{{ paginaActual }}</button>
            </li>
            <li class="page-item" :class="{ disabled: paginaActual === totalPaginas }">
              <button class="page-link ripple-click" @click="cambiarPagina(paginaActual + 1)" :disabled="paginaActual === totalPaginas" aria-label="Página siguiente">Siguiente</button>
            </li>
            <li class="page-item" :class="{ disabled: paginaActual === totalPaginas }">
              <button class="page-link ripple-click" @click="cambiarPagina(totalPaginas)" :disabled="paginaActual === totalPaginas" aria-label="Última página">»</button>
            </li>
          </ul>
        </nav>
      </div>
      <div v-else>
        <button class="btn btn-outline-secondary mb-3 ripple-click" @click="volverIngredientes">← Volver a ingredientes</button>
        <h2 class="mb-3 pastel-section text-center">Cócteles con {{ ingredienteSeleccionado }}</h2>
        <div style="min-height: 420px; position: relative;">
          <transition name="fade-loader">
            <div v-if="cargandoCocteles" class="text-center my-5">
              <Loader />
            </div>
          </transition>
          <transition-group name="fade-slide" tag="div" v-if="!cargandoCocteles && cocteles.length" class="row g-4">
            <div v-for="drink in cocteles" :key="drink.idDrink" class="col-12 col-sm-6 col-md-4 col-lg-3">
              <div class="card h-100 shadow pastel-card card-coctel">
                <img v-if="drink.strDrinkThumb" :src="drink.strDrinkThumb" :alt="'Imagen del cóctel ' + drink.strDrink" class="card-img-top img-coctel">
                <div class="card-body d-flex flex-column justify-content-between">
                  <h5 class="card-title text-capitalize">{{ drink.strDrink }}</h5>
                  <router-link :to="`/detalle/${drink.idDrink}`" class="btn btn-outline-primary mt-2" aria-label="Ver detalles de {{ drink.strDrink }}">Ver detalles</router-link>
                </div>
              </div>
            </div>
          </transition-group>
          <transition name="fade-msg">
            <p v-if="!cargandoCocteles && !cocteles.length" class="text-center my-5">No se encontraron cócteles con ese ingrediente.</p>
          </transition>
        </div>
      </div>
    </div>
    <button v-show="showScrollTop" class="btn-scroll-top" @click="scrollToTop" aria-label="Volver arriba">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 19V5M12 5L5 12M12 5l7 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>
</template>

<script>
import Loader from '../components/Loader.vue';

const CATEGORIAS = [
  { nombre: 'Frutas', emoji: '🍋' },
  { nombre: 'Candy', emoji: '🍬' },
  { nombre: 'Licores', emoji: '🥃' },
  { nombre: 'Hierbas/Especias', emoji: '🌿' },
  { nombre: 'Refrescos/Jugos', emoji: '🥤' },
  { nombre: 'Otros', emoji: '🍸' },
];

// Mapeo simple de ingredientes a categorías
function categoriaIngrediente(nombre) {
  const n = nombre.toLowerCase();
  if ([
    'lemon', 'lime', 'orange', 'pineapple', 'banana', 'cherry', 'apple', 'grapefruit', 'strawberry', 'melon', 'peach', 'pear', 'mango', 'apricot', 'raspberry', 'blueberry', 'watermelon', 'coconut', 'kiwi', 'plum', 'grape', 'blackberry', 'cranberry', 'currant', 'fig', 'guava', 'papaya', 'passion fruit', 'pomegranate', 'tangerine'
  ].some(f => n.includes(f))) return 'Frutas';
  if ([
    'candy', 'chocolate', 'sugar', 'honey', 'caramel', 'marshmallow', 'licorice', 'jelly', 'gum', 'syrup'
  ].some(f => n.includes(f))) return 'Candy';
  if ([
    'vodka', 'rum', 'gin', 'tequila', 'whiskey', 'whisky', 'bourbon', 'brandy', 'cognac', 'vermouth', 'triple sec', 'liqueur', 'schnapps', 'absinthe', 'mezcal', 'cachaça', 'amaretto', 'sambuca', 'ouzo', 'grappa', 'pisco', 'baileys', 'campari', 'cointreau', 'kahlua', 'jagermeister', 'martini', 'sherry', 'port', 'wine', 'beer', 'champagne', 'prosecco', 'sake', 'soju', 'calvados', 'curaçao', 'apricot brandy', 'peach schnapps', 'creme de', 'drambuie', 'frangelico', 'galliano', 'midori', 'southern comfort', 'tia maria', 'benedictine', 'chartreuse', 'advocaat', 'anisette', 'arak', 'bison grass', 'blue curacao', 'chambord', 'cynar', 'falernum', 'genever', 'goldschlager', 'irish cream', 'kirsch', 'maraschino', 'ouzo', 'pastis', 'pimm', 'sloe gin', 'strega', 'triple sec', 'tuaca', 'van der hum', 'yukon jack'
  ].some(f => n.includes(f))) return 'Licores';
  if ([
    'mint', 'basil', 'rosemary', 'thyme', 'cinnamon', 'clove', 'nutmeg', 'ginger', 'anise', 'sage', 'dill', 'parsley', 'cardamom', 'coriander', 'fennel', 'lavender', 'oregano', 'pepper', 'saffron', 'tarragon', 'vanilla', 'wasabi', 'bay', 'chili', 'jalapeno', 'horseradish', 'herb', 'sprig', 'leaves'
  ].some(f => n.includes(f))) return 'Hierbas/Especias';
  if ([
    'juice', 'soda', 'cola', 'lemonade', 'tonic', 'water', 'milk', 'cream', 'coffee', 'tea', 'coke', 'sprite', 'ginger ale', 'root beer', 'energy drink', 'red bull', 'fanta', 'pepsi', 'mountain dew', 'dr pepper', '7up', 'club soda', 'seltzer', 'squirt', 'vermouth', 'grenadine', 'bitters'
  ].some(f => n.includes(f))) return 'Refrescos/Jugos';
  return 'Otros';
}

export default {
  name: 'Ingredientes',
  data() {
    return {
      ingredientes: [],
      cargando: true,
      ingredienteSeleccionado: null,
      cocteles: [],
      cargandoCocteles: false,
      categoriaActual: 'Frutas',
      paginaActual: 1,
      porPagina: 24,
      showScrollTop: false,
    };
  },
  computed: {
    categorias() {
      return CATEGORIAS;
    },
    ingredientesFiltrados() {
      return this.ingredientes.filter(i => categoriaIngrediente(i.strIngredient1) === this.categoriaActual);
    },
    totalPaginas() {
      return Math.ceil(this.ingredientesFiltrados.length / this.porPagina);
    },
    ingredientesPaginados() {
      const start = (this.paginaActual - 1) * this.porPagina;
      return this.ingredientesFiltrados.slice(start, start + this.porPagina);
    },
  },
  async created() {
    const res = await fetch('https://www.thecocktaildb.com/api/json/v1/1/list.php?i=list');
    const data = await res.json();
    this.ingredientes = data.drinks || [];
    this.cargando = false;
  },
  methods: {
    cambiarCategoria(cat) {
      this.categoriaActual = cat;
      this.paginaActual = 1;
      this.scrollToCards();
    },
    cambiarPagina(nueva) {
      if (nueva < 1 || nueva > this.totalPaginas) return;
      this.paginaActual = nueva;
      this.scrollToCards();
    },
    async verCocteles(ingrediente) {
      this.ingredienteSeleccionado = ingrediente;
      this.cargandoCocteles = true;
      this.cocteles = [];
      const res = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingrediente)}`);
      const data = await res.json();
      this.cocteles = data.drinks || [];
      this.cargandoCocteles = false;
    },
    scrollToCards() {
      this.$nextTick(() => {
        const el = this.$refs.contenedorIngs;
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
    volverIngredientes() {
      this.ingredienteSeleccionado = null;
      this.scrollToCards();
    },
  },
  mounted() {
    window.addEventListener('scroll', this.handleScrollBtn);
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScrollBtn);
  },
  components: { Loader },
};
</script> 