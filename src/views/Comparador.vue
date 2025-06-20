<!-- ESTO ES EXTRA: Vista completa de comparador de cócteles -->
<!-- esta vista fue idea mia pero la implementamos entre todos -valen -->
<!-- el modal me costo un monton -agos -->
<template>
  <div class="container py-4">
    <h1 class="mb-4 pastel-title text-center">Comparador de Cócteles</h1>
    
    <!-- Selector de cócteles -->
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="card pastel-card">
          <div class="card-header">
            <h5 class="mb-0">Cóctel 1</h5>
          </div>
          <div class="card-body">
            <div v-if="!cocktail1" class="text-center">
              <p class="text-muted mb-3">Selecciona el primer cóctel</p>
              <button class="btn btn-outline-primary ripple-click" @click="mostrarSelector(1)">
                🍹 Elegir cóctel
              </button>
            </div>
            <div v-else class="cocktail-selected">
              <img :src="cocktail1.strDrinkThumb" :alt="cocktail1.strDrink" class="img-thumbnail mb-2" style="width: 80px; height: 80px; object-fit: cover;">
              <h6>{{ cocktail1.strDrink }}</h6>
              <button class="btn btn-sm btn-outline-danger ripple-click" @click="quitarCocktail(1)">
                ❌ Quitar
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-6">
        <div class="card pastel-card">
          <div class="card-header">
            <h5 class="mb-0">Cóctel 2</h5>
          </div>
          <div class="card-body">
            <div v-if="!cocktail2" class="text-center">
              <p class="text-muted mb-3">Selecciona el segundo cóctel</p>
              <button class="btn btn-outline-primary ripple-click" @click="mostrarSelector(2)">
                🍹 Elegir cóctel
              </button>
            </div>
            <div v-else class="cocktail-selected">
              <img :src="cocktail2.strDrinkThumb" :alt="cocktail2.strDrink" class="img-thumbnail mb-2" style="width: 80px; height: 80px; object-fit: cover;">
              <h6>{{ cocktail2.strDrink }}</h6>
              <button class="btn btn-sm btn-outline-danger ripple-click" @click="quitarCocktail(2)">
                ❌ Quitar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Comparación -->
    <div v-if="cocktail1 && cocktail2" class="comparison-container">
      <div class="row">
        <div class="col-md-6">
          <div class="card pastel-card h-100">
            <div class="card-header text-center">
              <img :src="cocktail1.strDrinkThumb" :alt="cocktail1.strDrink" class="img-fluid mb-2" style="max-height: 200px; object-fit: cover;">
              <h4>{{ cocktail1.strDrink }}</h4>
            </div>
            <div class="card-body">
              <div class="comparison-item">
                <strong>Categoría:</strong> {{ cocktail1.strCategory || 'N/A' }}
              </div>
              <div class="comparison-item">
                <strong>Vaso:</strong> {{ cocktail1.strGlass || 'N/A' }}
              </div>
              <div class="comparison-item">
                <strong>Ingredientes:</strong>
                <ul class="list-unstyled mt-1">
                  <li v-for="(ing, index) in getIngredientes(cocktail1)" :key="index">
                    • {{ ing }}
                  </li>
                </ul>
              </div>
              <div class="comparison-item">
                <strong>Instrucciones:</strong>
                <p class="mt-1">{{ cocktail1.strInstructions }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-6">
          <div class="card pastel-card h-100">
            <div class="card-header text-center">
              <img :src="cocktail2.strDrinkThumb" :alt="cocktail2.strDrink" class="img-fluid mb-2" style="max-height: 200px; object-fit: cover;">
              <h4>{{ cocktail2.strDrink }}</h4>
            </div>
            <div class="card-body">
              <div class="comparison-item">
                <strong>Categoría:</strong> {{ cocktail2.strCategory || 'N/A' }}
              </div>
              <div class="comparison-item">
                <strong>Vaso:</strong> {{ cocktail2.strGlass || 'N/A' }}
              </div>
              <div class="comparison-item">
                <strong>Ingredientes:</strong>
                <ul class="list-unstyled mt-1">
                  <li v-for="(ing, index) in getIngredientes(cocktail2)" :key="index">
                    • {{ ing }}
                  </li>
                </ul>
              </div>
              <div class="comparison-item">
                <strong>Instrucciones:</strong>
                <p class="mt-1">{{ cocktail2.strInstructions }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal selector -->
    <div v-if="mostrarModal" class="modal-overlay" @click="cerrarModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h5>Seleccionar cóctel {{ cocktailSeleccionando }}</h5>
          <button class="btn-close" @click="cerrarModal"></button>
        </div>
        <div class="modal-body">
          <!-- Opciones de selección -->
          <div class="mb-4">
            <div class="btn-group w-100" role="group">
              <button class="btn btn-outline-primary" :class="{ active: opcionSeleccion === 'lista' }" @click="opcionSeleccion = 'lista'">
                📋 Lista completa
              </button>
              <button class="btn btn-outline-primary" :class="{ active: opcionSeleccion === 'vistos' }" @click="opcionSeleccion = 'vistos'">
                👁️ Últimos vistos
              </button>
              <button class="btn btn-outline-primary" :class="{ active: opcionSeleccion === 'recomendados' }" @click="opcionSeleccion = 'recomendados'">
                ⭐ Recomendados
              </button>
            </div>
          </div>

          <!-- Búsqueda -->
          <div class="mb-3">
            <input v-model="busqueda" type="text" class="form-control pastel-input" placeholder="Buscar cócteles..." @input="filtrarCocktails">
          </div>

          <!-- Lista de cócteles -->
          <div class="cocktails-list">
            <div v-if="cargando" class="text-center">
              <Loader />
            </div>
            <div v-else-if="cocktailsFiltrados.length" class="row g-2 g-md-3">
              <div v-for="drink in cocktailsFiltrados" :key="drink.idDrink" class="col-3 col-sm-4 col-md-3 col-lg-2 col-xl-2">
                <div class="cocktail-option" @click="seleccionarCocktail(drink)">
                  <img :src="drink.strDrinkThumb" :alt="drink.strDrink" class="img-fluid mb-2" style="object-fit: cover;">
                  <small class="d-block text-center">{{ drink.strDrink }}</small>
                </div>
              </div>
            </div>
            <div v-else class="text-center text-muted">
              <p>No se encontraron cócteles.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Loader from '../components/Loader.vue';

export default {
  name: 'Comparador',
  components: { Loader },
  data() {
    return {
      cocktail1: null,
      cocktail2: null,
      mostrarModal: false,
      cocktailSeleccionando: 1,
      opcionSeleccion: 'lista',
      busqueda: '',
      cargando: false,
      cocktails: [],
      cocktailsFiltrados: [],
      ultimosVistos: [],
    };
  },
  async created() {
    // ESTO ES EXTRA: Redirigir en dispositivos móviles
    // esto lo agregamos porque en mobile no se ve bien -alfredo
    if (window.innerWidth < 992) {
      this.$router.push('/');
      window.dispatchEvent(new CustomEvent('mostrar-toast', { 
        detail: { 
          mensaje: 'El comparador solo está disponible en desktop', 
          tipo: 'info',
          duracion: 3000
        } 
      }));
      return;
    }
    
    await this.cargarUltimosVistos();
    await this.cargarCocktails();
  },
  methods: {
    // ESTO ES EXTRA: Cargar últimos vistos
    async cargarUltimosVistos() {
      const vistosIds = JSON.parse(localStorage.getItem('ultimos_vistos')) || [];
      const vistos = [];
      
      for (const id of vistosIds.slice(0, 10)) {
        try {
          // Intentar leer de localStorage primero
          let cocktail = null;
          try {
            cocktail = JSON.parse(localStorage.getItem('cocktail_' + id));
          } catch (e) { cocktail = null; }
          
          if (cocktail && cocktail.idDrink) {
            vistos.push(cocktail);
            continue;
          }
          
          // Si no está en localStorage, hacer fetch
          const res = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`);
          if (!res.ok) continue;
          const data = await res.json();
          if (data.drinks && data.drinks[0]) {
            vistos.push(data.drinks[0]);
            localStorage.setItem('cocktail_' + id, JSON.stringify(data.drinks[0]));
          }
        } catch (e) {
          continue;
        }
      }
      
      this.ultimosVistos = vistos;
    },
    
    async cargarCocktails() {
      this.cargando = true;
      try {
        // Cargar cócteles populares
        const res = await fetch('https://www.thecocktaildb.com/api/json/v1/1/search.php?f=a');
        const data = await res.json();
        this.cocktails = data.drinks || [];
        this.cocktailsFiltrados = this.cocktails;
      } catch (error) {
        console.error('Error cargando cócteles:', error);
      }
      this.cargando = false;
    },
    
    mostrarSelector(numero) {
      this.cocktailSeleccionando = numero;
      this.mostrarModal = true;
      this.opcionSeleccion = 'lista';
      this.busqueda = '';
      this.actualizarLista();
    },
    
    cerrarModal() {
      this.mostrarModal = false;
    },
    
    quitarCocktail(numero) {
      if (numero === 1) {
        this.cocktail1 = null;
      } else {
        this.cocktail2 = null;
      }
    },
    
    seleccionarCocktail(drink) {
      if (this.cocktailSeleccionando === 1) {
        this.cocktail1 = drink;
      } else {
        this.cocktail2 = drink;
      }
      this.cerrarModal();
    },
    
    getIngredientes(drink) {
      const ings = [];
      for (let i = 1; i <= 15; i++) {
        const ing = drink[`strIngredient${i}`];
        if (ing) ings.push(ing);
      }
      return ings;
    },
    
    filtrarCocktails() {
      if (!this.busqueda) {
        this.actualizarLista();
        return;
      }
      
      const filtrados = this.cocktails.filter(drink => 
        drink.strDrink.toLowerCase().includes(this.busqueda.toLowerCase())
      );
      this.cocktailsFiltrados = filtrados;
    },
    
    actualizarLista() {
      switch (this.opcionSeleccion) {
        case 'lista':
          this.cocktailsFiltrados = this.cocktails;
          break;
        case 'vistos':
          this.cocktailsFiltrados = this.ultimosVistos;
          break;
        case 'recomendados':
          // Simular recomendaciones basadas en favoritos
          const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
          const recomendados = this.cocktails.filter(drink => 
            !favoritos.includes(drink.idDrink)
          ).slice(0, 10);
          this.cocktailsFiltrados = recomendados;
          break;
      }
    },
  },
  
  watch: {
    opcionSeleccion() {
      this.actualizarLista();
    }
  }
};
</script> 