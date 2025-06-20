import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as bootstrap from 'bootstrap';
import './styles.css';
import './utils/confeti.js';

const app = createApp(App);

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

// Inicializar todos los carruseles de Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  const carousels = document.querySelectorAll('.carousel');
  carousels.forEach(carouselEl => {
    new bootstrap.Carousel(carouselEl, {
      interval: 5000,
      touch: true
    });
  });
}); 