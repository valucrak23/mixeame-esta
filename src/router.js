import { createRouter, createWebHistory } from 'vue-router';
import Home from './views/Home.vue';
// ESTO ES EXTRA: Página de favoritos
import Favoritos from './views/Favoritos.vue';
import Detalle from './views/Detalle.vue';
// ESTO ES EXTRA: Página de ingredientes
import Ingredientes from './views/Ingredientes.vue';
// ESTO ES EXTRA: Página de comparador
import Comparador from './views/Comparador.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  // ESTO ES EXTRA: Ruta para página de ingredientes
  { path: '/ingredientes', name: 'Ingredientes', component: Ingredientes },
  // ESTO ES EXTRA: Ruta para página de favoritos
  { path: '/favoritos', name: 'Favoritos', component: Favoritos },
  // ESTO ES EXTRA: Ruta para página de comparador
  { path: '/comparador', name: 'Comparador', component: Comparador },
  { path: '/detalle/:id', name: 'Detalle', component: Detalle, props: true },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router; 