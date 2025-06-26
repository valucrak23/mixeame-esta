<template>
  <div class="container py-4">
    <div v-if="cargando" class="text-center my-5">
      <Loader />
    </div>
    <div v-else-if="error" class="alert alert-danger text-center my-5">
      {{ error }}
    </div>
    <div v-else-if="cocktail" class="row justify-content-center">
      <div class="col-12 col-md-8 col-lg-6">
        <button class="btn btn-outline-primary mb-3 ripple-click" @click="$router.back()" aria-label="Volver atrás">
          ← Volver
        </button>
        <div class="card pastel-card card-coctel-detalle shadow">
          <img :src="cocktail.strDrinkThumb" :alt="'Imagen del cóctel ' + cocktail.strDrink" class="card-img-top img-coctel-detalle">
          <div class="card-body">
            <h2 class="card-title text-center mb-3">{{ cocktail.strDrink }}</h2>
            <p class="mb-2 detalle-info"><strong>Categoría:</strong> {{ cocktail.strCategory }}</p>
            <p class="mb-2 detalle-info"><strong>Tipo:</strong> {{ cocktail.strAlcoholic }}</p>
            <p class="mb-2 detalle-info"><strong>Vaso:</strong> {{ cocktail.strGlass }}</p>
            <h5 class="mt-4">Ingredientes:</h5>
            <ul class="list-unstyled mb-3">
              <li v-for="(ing, i) in ingredientes" :key="i">🍸 {{ ing }}</li>
            </ul>
            <h5>Instrucciones:</h5>
            <p>{{ cocktail.strInstructions }}</p>
            <div v-if="mensaje" class="alert alert-success mt-3" role="alert">
              {{ mensaje }}
            </div>
            <button 
              class="btn mt-3 w-100 ripple-click"
              :class="[favoritoLocal ? 'btn-danger' : 'btn-outline-success', animarFav ? 'btn-fav-anim' : '']"
              @click="toggleFavorito"
              :aria-label="favoritoLocal ? 'Quitar ' + cocktail.strDrink + ' de favoritos' : 'Agregar ' + cocktail.strDrink + ' a favoritos'"
              tabindex="0"
              @keydown.enter.prevent="toggleFavorito"
              @keydown.space.prevent="toggleFavorito"
            >
              <span class="corazon-pop" :class="{ pop: animarFav }">
                {{ favoritoLocal ? '❌' : '❤️' }}
              </span>
              {{ favoritoLocal ? 'Quitar de Favoritos' : 'Agregar a Favoritos' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-center my-5">
      <p>No se encontró el cóctel.</p>
    </div>
  </div>
</template>

<script>
import Loader from '../components/Loader.vue';

export default {
  name: 'Detalle',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      cocktail: {},
      mensaje: '',
      cargando: true,
      error: null,
      favoritoLocal: false,
      animarFav: false,
    };
  },
  computed: {
    ingredientes() {
      if (!this.cocktail) return [];
      const ings = [];
      for (let i = 1; i <= 15; i++) {
        const ing = this.cocktail[`strIngredient${i}`];
        const measure = this.cocktail[`strMeasure${i}`];
        if (ing) ings.push(measure ? `${measure.trim()} ${ing}` : ing);
      }
      return ings;
    },
  },
  components: { Loader },
  async created() {
    try {
      const res = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${this.id}`);
      const data = await res.json();
      this.cocktail = data.drinks ? data.drinks[0] : {};
      let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
      this.favoritoLocal = favoritos.includes(this.cocktail.idDrink);
      
      this.registrarVisto();
    } catch (e) {
      this.error = e.message;
    } finally {
      this.cargando = false;
    }
  },
  methods: {
    registrarVisto() {
      if (!this.cocktail.idDrink) return;
      
      let vistos = JSON.parse(localStorage.getItem('ultimos_vistos')) || [];
      
      vistos = vistos.filter(id => id !== this.cocktail.idDrink);
      
      vistos.unshift(this.cocktail.idDrink);
      
      vistos = vistos.slice(0, 20);
      
      localStorage.setItem('ultimos_vistos', JSON.stringify(vistos));
    },
    toggleFavorito() {
      let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
      this.animarFav = false;
      if (this.favoritoLocal) {
        favoritos = favoritos.filter(id => id !== this.cocktail.idDrink);
        this.favoritoLocal = false;
        window.dispatchEvent(new CustomEvent('mostrar-toast', { 
          detail: { 
            mensaje: '¡Eliminado de favoritos!', 
            tipo: 'success',
            duracion: 2500
          } 
        }));
      } else {
        if (!favoritos.includes(this.cocktail.idDrink)) {
          favoritos.push(this.cocktail.idDrink);
          this.favoritoLocal = true;
          window.dispatchEvent(new CustomEvent('mostrar-toast', { 
            detail: { 
              mensaje: '¡Agregado a favoritos!', 
              tipo: 'success',
              duracion: 2500
            } 
          }));
        } else {
          this.favoritoLocal = true;
          window.dispatchEvent(new CustomEvent('mostrar-toast', { 
            detail: { 
              mensaje: 'Este cóctel ya está en favoritos.', 
              tipo: 'info',
              duracion: 3000
            } 
          }));
          return;
        }
      }
      localStorage.setItem('favoritos', JSON.stringify(favoritos));
      this.$nextTick(() => {
        this.animarFav = true;
        setTimeout(() => { this.animarFav = false; }, 500);
      });
    },
  },
}
</script>

