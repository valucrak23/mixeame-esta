import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
// ESTO ES EXTRA: Sistema de notificaciones toast
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as bootstrap from 'bootstrap';
import './styles.css';
// ESTO ES EXTRA: Importación de utilidades de confeti
import './utils/confeti.js';

// ESTO ES EXTRA: Cambiar título dinámicamente
document.title = 'Mixeame Esta';

const app = createApp(App);

// ESTO ES EXTRA: Configuración de toast notifications
const toastOptions = {
  position: "bottom-right",
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: true,
  closeButton: "button",
  icon: true,
  rtl: false
};

app.use(Toast, toastOptions);
app.use(router);
app.mount('#app');

// ESTO ES EXTRA: Inicializar todos los carruseles de Bootstrap
// esto lo agrego valen porque no funcionaba el carrusel -agos
document.addEventListener('DOMContentLoaded', () => {
  const carousels = document.querySelectorAll('.carousel');
  carousels.forEach(carouselEl => {
    new bootstrap.Carousel(carouselEl, {
      interval: 5000,
      touch: true
    });
  });
}); 