<template>
  <div class="confeti-container">
    <div 
      v-for="particula in particulas" 
      :key="particula.id"
      :class="['confeti-particula', `tipo-${particula.tipo}`]"
      :style="{
        left: particula.x + 'px',
        top: particula.y + 'px',
        backgroundColor: particula.color,
        transform: `rotate(${particula.rotacion}deg) scale(${particula.escala})`,
        animationDuration: particula.duracion + 's',
        animationDelay: particula.delay + 's'
      }"
    ></div>
  </div>
</template>

<script>
export default {
  name: 'Confeti',
  data() {
    return {
      particulas: [],
      contadorId: 0
    }
  },
  mounted() {
    // Escuchar eventos de confeti desde cualquier parte de la app
    window.addEventListener('explosion-confeti', this.crearExplosion);
  },
  beforeUnmount() {
    window.removeEventListener('explosion-confeti', this.crearExplosion);
  },
  methods: {
    crearExplosion(evento) {
      const { x, y, tipo = 'normal', intensidad = 1 } = evento.detail;
      
      let cantidadParticulas, colores, duracion;
      
      switch(tipo) {
        case 'hover':
          cantidadParticulas = 8 * intensidad;
          colores = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
          duracion = 1.5;
          break;
        case 'boton':
          cantidadParticulas = 15 * intensidad;
          colores = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
          duracion = 2.5;
          break;
        case 'favorito':
          cantidadParticulas = 25 * intensidad;
          colores = ['#feca57', '#ffd700', '#ffed4e', '#fff200', '#ffeb3b', '#ffc107'];
          duracion = 3;
          break;
        case 'nav':
          cantidadParticulas = 12 * intensidad;
          colores = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'];
          duracion = 2;
          break;
        default:
          cantidadParticulas = 20 * intensidad;
          colores = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
          duracion = 2.5;
      }
      
      // Crear partículas
      for (let i = 0; i < cantidadParticulas; i++) {
        const particula = {
          id: ++this.contadorId,
          x: x + (Math.random() - 0.5) * 100,
          y: y + (Math.random() - 0.5) * 100,
          color: colores[Math.floor(Math.random() * colores.length)],
          rotacion: Math.random() * 360,
          escala: 0.5 + Math.random() * 0.5,
          duracion: duracion + Math.random() * 1,
          delay: Math.random() * 0.5,
          tipo: Math.random() > 0.5 ? 'cuadrado' : 'circulo'
        };
        
        this.particulas.push(particula);
        
        // Remover partícula después de la animación
        setTimeout(() => {
          const index = this.particulas.findIndex(p => p.id === particula.id);
          if (index !== -1) {
            this.particulas.splice(index, 1);
          }
        }, (duracion + 1) * 1000);
      }
    }
  }
}
</script>

<style scoped>
.confeti-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
}

.confeti-particula {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: confetiCaida linear forwards;
}

.confeti-particula.tipo-cuadrado {
  border-radius: 2px;
}

.confeti-particula.tipo-circulo {
  border-radius: 50%;
}

@keyframes confetiCaida {
  0% {
    transform: translateY(-10px) rotate(0deg) scale(1);
    opacity: 1;
  }
  25% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
  75% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(100vh) rotate(720deg) scale(0.1);
    opacity: 0;
  }
}

/* Efectos especiales para diferentes tipos */
.confeti-particula[style*="feca57"],
.confeti-particula[style*="ffd700"],
.confeti-particula[style*="ffed4e"] {
  box-shadow: 0 0 10px currentColor;
  animation: confetiCaidaDorado linear forwards;
}

@keyframes confetiCaidaDorado {
  0% {
    transform: translateY(-10px) rotate(0deg) scale(1);
    opacity: 1;
    box-shadow: 0 0 10px currentColor;
  }
  25% {
    opacity: 1;
    box-shadow: 0 0 15px currentColor;
  }
  50% {
    opacity: 0.9;
    box-shadow: 0 0 20px currentColor;
  }
  75% {
    opacity: 0.7;
    box-shadow: 0 0 15px currentColor;
  }
  100% {
    transform: translateY(100vh) rotate(1080deg) scale(0.1);
    opacity: 0;
    box-shadow: 0 0 5px currentColor;
  }
}

/* Efecto de rebote para partículas especiales */
.confeti-particula:nth-child(3n) {
  animation: confetiRebote linear forwards;
}

@keyframes confetiRebote {
  0% {
    transform: translateY(-10px) rotate(0deg) scale(1);
    opacity: 1;
  }
  20% {
    transform: translateY(20vh) rotate(180deg) scale(0.8);
    opacity: 1;
  }
  40% {
    transform: translateY(40vh) rotate(360deg) scale(0.9);
    opacity: 0.9;
  }
  60% {
    transform: translateY(60vh) rotate(540deg) scale(0.7);
    opacity: 0.8;
  }
  80% {
    transform: translateY(80vh) rotate(720deg) scale(0.5);
    opacity: 0.6;
  }
  100% {
    transform: translateY(100vh) rotate(900deg) scale(0.1);
    opacity: 0;
  }
}
</style> 