<!-- ESTO ES EXTRA: Componente de carrusel de cócteles recomendados -->
<!-- el carrusel me costo un monton hacerlo funcionar -valen -->
<!-- pero quedo re bueno -agos -->
<template>
  <div class="carousel-wrapper">
    <h2 class="text-center mb-4 pastel-section">🍹 Cócteles Recomendados</h2>
    <div v-if="loading" class="loader-container">
      <Loader />
    </div>
    <div v-else id="cocktailCarousel" class="carousel slide" data-bs-ride="carousel">
      <div class="carousel-inner">
        <div v-for="(cocktail, index) in cocktails" 
             :key="cocktail.idDrink" 
             :class="['carousel-item', index === 0 ? 'active' : '']">
          <div class="carousel-content">
            <div class="carousel-item-content">
              <div class="carousel-image">
                <img :src="cocktail.strDrinkThumb" :alt="cocktail.strDrink">
              </div>
              <div class="carousel-details">
                <h3>{{ cocktail.strDrink }}</h3>
                <ul class="carousel-ingredients">
                  <li v-for="(ingredient, idx) in getIngredients(cocktail)" :key="idx">
                    {{ ingredient }}
                  </li>
                </ul>
                <div class="carousel-actions">
                  <!-- ESTO ES EXTRA: Botón de favoritos en el carrusel -->
                  <button class="btn btn-outline-danger ripple-click btn-like" @click.stop="toggleLike(cocktail)" :aria-label="isFavorito(cocktail.idDrink) ? 'Quitar de favoritos' : 'Agregar a favoritos'">
                    <span class="corazon-pop" :class="{ pop: animarLike === cocktail.idDrink }">
                      {{ isFavorito(cocktail.idDrink) ? '❤️' : '🤍' }}
                    </span>
                  </button>
                  <router-link :to="{ name: 'Detalle', params: { id: cocktail.idDrink }}" class="btn btn-outline-primary ripple-click" :aria-label="'Ver detalles de ' + cocktail.strDrink">
                    Ver detalles
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button class="carousel-control-prev" type="button" data-bs-target="#cocktailCarousel" data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Anterior</span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#cocktailCarousel" data-bs-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Siguiente</span>
      </button>
    </div>
  </div>
</template>

<script>
import Loader from './Loader.vue';
import * as bootstrap from 'bootstrap';
import { useToast } from 'vue-toastification';

export default {
  name: 'CarouselRecomendados',
  components: {
    Loader
  },
  setup() {
    // ESTO ES EXTRA: Sistema de toast notifications
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      cocktails: [],
      loading: true,
      // ESTO ES EXTRA: Animación de like
      animarLike: null,
      carousel: null
    };
  },
  async created() {
    await this.cargarRecomendados();
  },
  mounted() {
    this.$nextTick(() => {
      const carouselEl = document.getElementById('cocktailCarousel');
      if (carouselEl) {
        this.carousel = new bootstrap.Carousel(carouselEl, {
          interval: 5000,
          touch: true
        });
      }
    });
  },
  beforeUnmount() {
    if (this.carousel) {
      this.carousel.dispose();
    }
  },
  methods: {
    // ESTO ES EXTRA: Cargar cócteles recomendados
    async cargarRecomendados() {
      try {
        this.loading = true;
        let cocktailsRecomendados = [];
        const letrasPopulares = ['m', 'c', 'b', 'a', 'p', 's', 't'];
        
        // Intentar con cada letra hasta tener 5 cócteles
        for (const letra of letrasPopulares) {
          if (cocktailsRecomendados.length >= 5) break;
          
          try {
            const response = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?f=${letra}`);
            if (!response.ok) continue;
            
            const data = await response.json();
            if (!data.drinks) continue;
            
            // Obtener favoritos para filtrar
            const favoritosStr = localStorage.getItem('favoritos');
            const favoritos = favoritosStr ? JSON.parse(favoritosStr) : [];
            
            // Filtrar cócteles que no estén en favoritos ni en recomendados
            const drinksFiltrados = data.drinks.filter(drink => 
              !favoritos.includes(drink.idDrink) && 
              !cocktailsRecomendados.some(rec => rec.idDrink === drink.idDrink)
            );
            
            if (drinksFiltrados.length > 0) {
              // Mezclar el array para obtener cócteles aleatorios
              const mezclados = drinksFiltrados.sort(() => Math.random() - 0.5);
              // Tomar los cócteles necesarios para llegar a 5
              const faltantes = 5 - cocktailsRecomendados.length;
              const nuevos = mezclados.slice(0, faltantes);
              cocktailsRecomendados.push(...nuevos);
            }
          } catch (error) {
            console.error(`Error al buscar cócteles con la letra ${letra}:`, error);
            continue;
          }
        }

        // Si no tenemos suficientes cócteles, mostrar mensaje
        if (cocktailsRecomendados.length === 0) {
          this.toast.error('No se pudieron cargar los cócteles recomendados');
          return;
        }

        // Asegurarnos de tener solo 5 cócteles
        this.cocktails = cocktailsRecomendados.slice(0, 5);
      } catch (error) {
        console.error('Error al cargar los cócteles recomendados:', error);
        this.toast.error('Error al cargar los cócteles recomendados');
      } finally {
        this.loading = false;
      }
    },
    getIngredients(cocktail) {
      const ingredients = [];
      for (let i = 1; i <= 15; i++) {
        const ingredient = cocktail[`strIngredient${i}`];
        if (ingredient) {
          ingredients.push(ingredient);
        }
      }
      return ingredients.slice(0, 4);
    },
    // ESTO ES EXTRA: Verificar si es favorito
    isFavorito(id) {
      try {
        const favoritosStr = localStorage.getItem('favoritos');
        if (!favoritosStr) return false;
        const favoritos = JSON.parse(favoritosStr);
        return Array.isArray(favoritos) && favoritos.includes(id);
      } catch (error) {
        console.error('Error al leer favoritos:', error);
        return false;
      }
    },
    // ESTO ES EXTRA: Toggle de favoritos
    toggleLike(drink) {
      try {
        const favoritosStr = localStorage.getItem('favoritos');
        let favoritos = [];
        
        if (favoritosStr) {
          favoritos = JSON.parse(favoritosStr);
          if (!Array.isArray(favoritos)) favoritos = [];
        }

        if (favoritos.includes(drink.idDrink)) {
          favoritos = favoritos.filter(f => f !== drink.idDrink);
          this.toast.success('Eliminado de favoritos');
        } else {
          favoritos.push(drink.idDrink);
          this.toast.success('¡Agregado a favoritos!');
        }

        localStorage.setItem('favoritos', JSON.stringify(favoritos));
        this.animarLike = drink.idDrink;
        setTimeout(() => { this.animarLike = null; }, 500);
      } catch (error) {
        console.error('Error al actualizar favoritos:', error);
        this.toast.error('Error al actualizar favoritos');
      }
    }
  }
}
</script> 