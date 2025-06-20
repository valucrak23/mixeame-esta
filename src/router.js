import { createRouter, createWebHistory } from 'vue-router';
import Home from './views/Home.vue';
import Favoritos from './views/Favoritos.vue';
import Detalle from './views/Detalle.vue';
import Ingredientes from './views/Ingredientes.vue';
import Comparador from './views/Comparador.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/ingredientes', name: 'Ingredientes', component: Ingredientes },
  { path: '/favoritos', name: 'Favoritos', component: Favoritos },
  { path: '/comparador', name: 'Comparador', component: Comparador },
  { path: '/detalle/:id', name: 'Detalle', component: Detalle, props: true },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router; 