<!-- ESTO ES EXTRA: Vista completa de favoritos -->
<!-- esta vista la hice yo -valen -->
<!-- el pdf fui yo -alfredo -->
<template>
  <div class="main-content">
    <div class="container py-4" ref="contenedorFavs">
      <h1 class="mb-4 pastel-title text-center">Tus Cócteles Favoritos</h1>
      <div class="d-flex flex-wrap gap-3 align-items-center justify-content-center mb-4">
        <!-- ESTO ES EXTRA: Filtro por categoría en favoritos -->
        <select v-model="filtroCategoria" class="form-select pastel-input select-categoria" style="max-width:220px" @change="filtrarPorCategoria">
          <option value="">Todas las categorías</option>
          <option v-for="cat in categorias" :key="cat" :value="cat">{{ cat }}</option>
        </select>
        <!-- ESTO ES EXTRA: Ordenamiento en favoritos -->
        <select v-model="orden" class="form-select pastel-input select-categoria" style="max-width:180px">
          <option value="az">Nombre (A-Z)</option>
          <option value="za">Nombre (Z-A)</option>
        </select>
        <!-- ESTO ES EXTRA: Exportar a PDF -->
        <div class="d-flex gap-2" v-if="cocktailsFiltradosYOrdenados.length">
          <button class="btn btn-outline-info ripple-click" @click="exportarPDF" title="Exportar favoritos en formato PDF">
            📋 PDF
          </button>
        </div>
      </div>
      <!-- Modal de confirmación para eliminar favorito -->
      <div v-if="showConfirmModal" class="modal-overlay">
        <div class="modal-content text-center p-4">
          <h5 class="mb-3">¿Eliminar de favoritos?</h5>
          <p>¿Seguro que quieres eliminar <strong>{{ cocktailAEliminar?.strDrink }}</strong> de tus favoritos?</p>
          <div class="d-flex justify-content-center gap-3 mt-4">
            <button class="btn btn-danger ripple-click" @click="confirmarEliminarFavorito">Sí, eliminar</button>
            <button class="btn btn-outline-secondary ripple-click" @click="cancelarEliminarFavorito">Cancelar</button>
          </div>
        </div>
      </div>
      <!-- Fin modal -->
      
      <!-- Cards de favoritos -->
      <div style="min-height: 420px; position: relative;">
        <transition name="fade-loader">
          <div v-if="cargando" class="text-center my-5">
            <Loader />
          </div>
        </transition>
        <transition-group name="fade-slide" tag="div" v-if="!cargando && cocktailsFiltradosYOrdenados.length" class="row g-4">
          <div v-for="drink in cocktailsFiltradosYOrdenados" :key="drink.idDrink" class="col-12 col-sm-6 col-md-4 col-lg-3">
            <!-- ESTO ES EXTRA: Cards con efecto flip -->
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
                <div class="flip-card-front d-flex flex-column align-items-center justify-content-center">
                  <img v-if="drink.strDrinkThumb" :src="drink.strDrinkThumb" :alt="drink.strDrink" class="card-img-top img-coctel mb-2 img-coctel-alta">
                  <h5 class="card-title text-capitalize text-center">{{ drink.strDrink }}</h5>
                </div>
                <div class="flip-card-back d-flex flex-column align-items-center justify-content-center">
                  <div class="mb-2"><strong>Categoría:</strong> {{ drink.strCategory || 'N/A' }}</div>
                  <div class="mb-2"><strong>Vaso:</strong> {{ drink.strGlass || 'N/A' }}</div>
                  <div class="mb-2"><strong>Ingredientes:</strong> <span v-if="getIngredientes(drink).length">{{ getIngredientes(drink).slice(0,2).join(', ') }}</span><span v-else>N/A</span></div>
                  <router-link :to="`/detalle/${drink.idDrink}`" class="btn btn-outline-primary mt-3 ripple-click" :aria-label="'Ver detalles de ' + drink.strDrink" @click.native="guardarEstadoFavoritos">Ver detalles</router-link>
                  <button class="btn btn-outline-danger ripple-click btn-like mt-3" @click.stop="mostrarConfirmModal(drink)" aria-label="Quitar de favoritos">
                    <span class="corazon-pop" :class="{ pop: animarLike === drink.idDrink }">❌</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </transition-group>
        <transition name="fade-msg">
          <div v-if="!cargando && !cocktailsFiltradosYOrdenados.length && !error" class="text-center my-5">
            <p>No tienes cócteles favoritos aún.</p>
          </div>
        </transition>
        <transition name="fade-msg">
          <div v-if="!cargando && error" class="alert alert-danger text-center my-5">
            {{ error }}
          </div>
        </transition>
      </div>
      <!-- ESTO ES EXTRA: Botón de scroll to top -->
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
// ESTO ES EXTRA: Librerías para exportar PDF
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default {
  name: 'Favoritos',
  data() {
    return {
      cocktails: [],
      cargando: true,
      error: null,
      // ESTO ES EXTRA: Filtros y ordenamiento
      filtroCategoria: '',
      orden: 'az',
      // ESTO ES EXTRA: Efectos visuales
      flippedCard: null,
      animarLike: null,
      showScrollTop: false,
      showConfirmModal: false,
      cocktailAEliminar: null,
    };
  },
  computed: {
    // ESTO ES EXTRA: Categorías únicas de favoritos
    categorias() {
      // Extrae categorías únicas de los favoritos
      const cats = this.cocktails.map(c => c.strCategory).filter(Boolean);
      return [...new Set(cats)].sort();
    },
    // ESTO ES EXTRA: Cócteles filtrados y ordenados
    cocktailsFiltradosYOrdenados() {
      let arr = this.cocktails;
      if (this.filtroCategoria) {
        arr = arr.filter(c => c.strCategory === this.filtroCategoria);
      }
      if (this.orden === 'az') {
        arr = arr.slice().sort((a, b) => a.strDrink.localeCompare(b.strDrink));
      } else if (this.orden === 'za') {
        arr = arr.slice().sort((a, b) => b.strDrink.localeCompare(a.strDrink));
      }
      return arr;
    },
  },
  async created() {
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    if (favoritos.length) {
      const drinks = [];
      for (const id of favoritos) {
        // Intento leer de localStorage
        let cocktail = null;
        try {
          cocktail = JSON.parse(localStorage.getItem('cocktail_' + id));
        } catch (e) { cocktail = null; }
        if (cocktail && cocktail.idDrink) {
          drinks.push(cocktail);
          continue;
        }
        // Si no está en localStorage, hago fetch y lo guardo
        try {
          const res = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`);
          if (!res.ok) continue;
          const data = await res.json();
          if (data.drinks && data.drinks[0]) {
            drinks.push(data.drinks[0]);
            localStorage.setItem('cocktail_' + id, JSON.stringify(data.drinks[0]));
          }
        } catch (e) {
          continue;
        }
      }
      this.cocktails = drinks;
    }
    this.cargando = false;
  },
  components: { Loader },
  methods: {
    // ESTO ES EXTRA: Efecto flip en cards
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
    // ESTO ES EXTRA: Quitar de favoritos
    quitarFavorito(drink) {
      if (!window.confirm('¿Seguro que quieres eliminar este cóctel de tus favoritos?')) return;
      let favs = JSON.parse(localStorage.getItem('favoritos')) || [];
      favs = favs.filter(f => f !== drink.idDrink);
      localStorage.setItem('favoritos', JSON.stringify(favs));
      this.animarLike = drink.idDrink;
      setTimeout(() => { this.animarLike = null; }, 500);
      this.cocktails = this.cocktails.filter(c => c.idDrink !== drink.idDrink);
      // ESTO ES EXTRA: Notificación toast
      window.dispatchEvent(new CustomEvent('mostrar-toast', { 
        detail: { 
          mensaje: '¡Eliminado de favoritos!', 
          tipo: 'success',
          duracion: 2500
        } 
      }));
    },
    // ESTO ES EXTRA: Scroll a las cards
    scrollToCards() {
      this.$nextTick(() => {
        const el = this.$refs.contenedorFavs;
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    },
    // ESTO ES EXTRA: Scroll to top
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    // ESTO ES EXTRA: Manejar botón de scroll
    handleScrollBtn() {
      this.showScrollTop = window.scrollY > 200;
    },
    // ESTO ES EXTRA: Cambiar página
    cambiarPagina(nueva) {
      if (nueva < 1 || nueva > this.totalPaginas) return;
      this.paginaActual = nueva;
      this.scrollToCards();
    },
    // ESTO ES EXTRA: Filtrar por categoría
    filtrarPorCategoria() {
      this.scrollToCards();
    },
    // ESTO ES EXTRA: Exportar a PDF
    async exportarPDF() {
      if (!this.cocktailsFiltradosYOrdenados.length) {
        window.dispatchEvent(new CustomEvent('mostrar-toast', { 
          detail: { 
            mensaje: 'No hay favoritos para exportar', 
            tipo: 'warning',
            duracion: 3000
          } 
        }));
        return;
      }
      // Detectar modo y logo
      const isDark = document.body.classList.contains('dark-mode');
      let logo, fondoLogo;
      if (isDark) {
        logo = '2.png';
        fondoLogo = '/brillos-circulo-osc.png';
      } else {
        logo = '3.png';
        fondoLogo = '/circulo-brillante.png';
      }
      // Tema
      const pastel = {
        bg: [255, 245, 250],
        text: [181, 131, 141],
        deco: [254, 202, 87],
        decoLine: [181, 131, 141],
        infoText: [17, 17, 17],
        footerText: [68, 68, 68],
        title: [181, 131, 141],
      };
      const dark = {
        bg: [35, 34, 43],
        text: [255, 180, 162],
        deco: [100, 180, 255],
        decoLine: [255, 180, 162],
        infoText: [68, 68, 68],
        footerText: [240, 240, 240],
        title: [255, 180, 162],
      };
      const theme = isDark ? dark : pastel;
      // Cargar logo y decoraciones como base64
      const getBase64 = (url) => new Promise((resolve, reject) => {
        const img = new window.Image();
        img.crossOrigin = 'Anonymous';
        img.onload = function() {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = function(e) {
          reject(new Error('No se pudo cargar la imagen: ' + url));
        };
        img.src = url;
      });
      let logoBase64, fondoLogoBase64 = null, brillitosBase64 = null;
      try {
        logoBase64 = await getBase64(`/${logo}`);
      } catch (e) {
        window.dispatchEvent(new CustomEvent('mostrar-toast', { 
          detail: { mensaje: e.message, tipo: 'error', duracion: 4000 }
        }));
        return;
      }
      if (fondoLogo) {
        try {
          fondoLogoBase64 = await getBase64(fondoLogo);
        } catch (e) {
          window.dispatchEvent(new CustomEvent('mostrar-toast', { 
            detail: { mensaje: e.message, tipo: 'error', duracion: 4000 }
          }));
          return;
        }
      }
      try {
        brillitosBase64 = await getBase64('/brillitos.png');
      } catch (e) {
        window.dispatchEvent(new CustomEvent('mostrar-toast', { 
          detail: { mensaje: e.message, tipo: 'error', duracion: 4000 }
        }));
        return;
      }
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;
      let yPosition = 50;
      const lineHeight = 7;
      const titleHeight = 10;
      const spaceBetweenDrinks = 12;
      // Header decorado con logo al lado (más separado, con sombra)
      function drawHeader(pageNum) {
        pdf.setFillColor(...theme.bg);
        pdf.rect(0, 0, pageWidth, 30, 'F');
        // Logo a la izquierda del título, bien proporcionado y con fondo decorativo
        const logoW = 20, logoH = 20;
        const logoY = 6;
        const logoX = pageWidth/2 - 52;
        // Fondo decorativo detrás del logo
        if (fondoLogoBase64) {
          let fondoW, fondoH;
          if (isDark) {
            fondoW = logoW * 1.3;
            fondoH = logoH * 1.3;
          } else {
            fondoW = logoW * 1.6;
            fondoH = logoH * 1.6;
          }
          pdf.addImage(fondoLogoBase64, 'PNG', logoX + logoW/2 - fondoW/2, logoY + logoH/2 - fondoH/2, fondoW, fondoH);
        }
        // Logo
        pdf.addImage(logoBase64, 'PNG', logoX, logoY, logoW, logoH, undefined, 'FAST');
        pdf.setFontSize(22);
        pdf.setTextColor(...theme.title);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Mixeame Esta', pageWidth/2 + 10, 18, {align:'left'});
        // Línea decorativa
        pdf.setDrawColor(...theme.decoLine);
        pdf.setLineWidth(1.2);
        pdf.line(margin, 28, pageWidth - margin, 28);
      }
      // Footer decorado
      function drawFooter(pageNum, totalPages) {
        pdf.setFillColor(...theme.bg);
        pdf.rect(0, pageHeight-18, pageWidth, 18, 'F');
        pdf.setDrawColor(...theme.decoLine);
        pdf.setLineWidth(1.2);
        pdf.line(margin, pageHeight-16, pageWidth-margin, pageHeight-16);
        pdf.setFontSize(11);
        pdf.setTextColor(...theme.footerText);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Página ${pageNum} de ${totalPages}`, pageWidth/2, pageHeight-7, {align:'center'});
        pdf.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, margin, pageHeight-7);
      }
      // Preparamos todas las páginas
      let pages = [];
      let currentPage = [];
      let currentY = yPosition;
      this.cocktailsFiltradosYOrdenados.forEach((drink, index) => {
        let block = [];
        // Limpiar nombre y otros campos de caracteres extraños
        const clean = txt => (txt || '').replace(/[;()']/g, '').trim();
        // Nombre
        block.push({type:'title', text:`${index+1}. ${clean(drink.strDrink)}`});
        // Categoría y vaso
        block.push({type:'text', text:`Categoría: ${clean(drink.strCategory) || 'N/A'}`});
        block.push({type:'text', text:`Vaso: ${clean(drink.strGlass) || 'N/A'}`});
        // Ingredientes (cada uno como item separado para puntear)
        const ingredientes = this.getIngredientes(drink).map(clean);
        if (ingredientes.length) {
          block.push({type:'ingredientes', items: ingredientes});
        }
        // Instrucciones
        if (drink.strInstructions) {
          block.push({type:'text', text:`Instrucciones: ${clean(drink.strInstructions)}`});
        }
        // Calcular espacio
        let blockHeight = block.length * lineHeight + titleHeight + (ingredientes.length ? ingredientes.length * lineHeight : 0);
        if (currentY + blockHeight > pageHeight - margin - 20) {
          pages.push(currentPage);
          currentPage = [];
          currentY = yPosition;
        }
        currentPage.push(block);
        currentY += blockHeight + spaceBetweenDrinks;
      });
      if (currentPage.length) pages.push(currentPage);
      // Dibujar páginas
      pages.forEach((blocks, i) => {
        if (i > 0) pdf.addPage();
        drawHeader(i+1);
        let y = yPosition;
        blocks.forEach(block => {
          block.forEach((item, j) => {
            if (item.type === 'title') {
              pdf.setFontSize(16);
              pdf.setTextColor(...theme.title);
              pdf.setFont('helvetica', 'bold');
              pdf.text(item.text, margin, y);
              y += titleHeight;
            } else if (item.type === 'ingredientes') {
              pdf.setFontSize(12);
              pdf.setTextColor(...theme.infoText);
              pdf.setFont('helvetica', 'normal');
              pdf.text('Ingredientes:', margin+2, y);
              y += lineHeight;
              item.items.forEach(ing => {
                pdf.addImage(brillitosBase64, 'PNG', margin+4, y-5, 5, 5);
                pdf.text(ing, margin+11, y);
                y += lineHeight;
              });
            } else {
              pdf.setFontSize(12);
              pdf.setTextColor(...theme.infoText);
              pdf.setFont('helvetica', 'normal');
              // Dividir si es muy largo
              const lines = pdf.splitTextToSize(item.text, contentWidth);
              lines.forEach(line => {
                pdf.text(line, margin+6, y);
                y += lineHeight;
              });
            }
          });
          y += spaceBetweenDrinks;
        });
        drawFooter(i+1, pages.length);
      });
      // Guardar PDF
      pdf.save(`favoritos_cocktails_${new Date().toISOString().split('T')[0]}.pdf`);
      window.dispatchEvent(new CustomEvent('mostrar-toast', { 
        detail: { 
          mensaje: '¡Favoritos exportados en PDF!', 
          tipo: 'success',
          duracion: 3000
        } 
      }));
    },
    mostrarConfirmModal(drink) {
      this.cocktailAEliminar = drink;
      this.showConfirmModal = true;
    },
    confirmarEliminarFavorito() {
      this.quitarFavorito(this.cocktailAEliminar);
      this.showConfirmModal = false;
    },
    cancelarEliminarFavorito() {
      this.showConfirmModal = false;
    },
    guardarEstadoFavoritos() {
      localStorage.setItem('estadoFavoritos', JSON.stringify({
        filtroCategoria: this.filtroCategoria,
        orden: this.orden,
        paginaActual: this.paginaActual
      }));
    },
  },
  mounted() {
    window.addEventListener('scroll', this.handleScrollBtn);
    // Restaurar estado desde query si existe
    if (this.$route && (this.$route.query.filtroCategoria !== undefined || this.$route.query.orden !== undefined)) {
      this.filtroCategoria = this.$route.query.filtroCategoria || '';
      this.orden = this.$route.query.orden || 'az';
      this.paginaActual = parseInt(this.$route.query.paginaActual) || 1;
      // Limpiar la query para no dejar basura en la URL
      this.$router.replace({ path: '/favoritos', query: {} });
    }
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScrollBtn);
  },
}
</script> 