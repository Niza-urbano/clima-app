<template>
  <div id="app-container" class="app-wrapper">
    <header class="text-center mb-5">
      <h1 class="display-5 display-md-3 fw-bold">El Tiempo</h1>
      <p class="lead text-capitalize">{{ fechaActual }}</p>
    </header>

    <main class="container">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
const fechaActual = new Date().toLocaleDateString('es-CL', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
</script>

<style>
/* Animación suave para el cambio de vistas */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(5px);
}

/* Contenedor para centrar el contenido en pantallas grandes */
.app-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* Aseguramos que el título sea legible sobre el fondo */
header h1 {
  text-shadow: 0 2px 10px rgba(255, 255, 255, 0.3);
  margin-top: 20px;
}

/* Padding para móviles */
.app-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 0 16px;
}

/* Ajustes para pantallas pequeñas */
@media (max-width: 768px) {
  header h1 {
    font-size: 2rem; /* reduce tamaño del título */
  }

  header p {
    font-size: 1rem;
  }

  header {
    margin-bottom: 1.5rem; /* menos espacio vertical */
  }
}
</style>
