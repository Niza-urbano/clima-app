<template>
  <div class="container mt-4">
    <!--  Buscador Ciudades-->
    <div class="search-wrapper mb-5">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Buscar ciudad en Chile..."
        class="search-input"
        @focus="isFocused = true"
        @blur="setTimeout(() => (isFocused = false), 200)"
      />
      <transition name="fade">
        <ul v-if="filteredCities.length > 0" class="suggestions-list">
          <li v-for="city in filteredCities" :key="city" @click="selectCity(city)">
            {{ city }}
          </li>
        </ul>
      </transition>
    </div>

    <!-- Ciudad Seleccionada -->
    <div v-if="lugarPrincipal" class="main-weather-section mb-5">
      <div class="main-card shadow-sm">
        <div class="lado-izq">
          <div class="weather-icon-main">{{ lugarPrincipal.icono }}</div>
        </div>
        <div class="centro">
          <h2 class="fw-bold">{{ lugarPrincipal.nombre }}</h2>
          <h1 class="fw-bold temp">{{ Math.round(lugarPrincipal.temp) }}°C</h1>
          <p class="mb-0 text-capitalize">{{ lugarPrincipal.estado }}</p>
        </div>
        <div class="lado-der">
          <div class="dato">
            <small>Viento:</small> <strong>{{ lugarPrincipal.viento }}</strong>
          </div>
          <div class="dato">
            <small>Humedad:</small> <strong>{{ lugarPrincipal.humedad }}</strong>
          </div>
        </div>
      </div>

      <!-- Pronóstico Semanal -->
      <div class="pronostico-mini mt-4">
        <div class="row g-2 justify-content-center">
          <div v-for="d in lugarPrincipal.dias" :key="d.dia" class="col-4 col-md-2">
            <div class="forecast-pill-sm shadow-sm text-center">
              <small class="fw-bold text-uppercase">{{ d.dia }}</small>
              <span class="d-block">{{ d.icono }}</span>
              <small>{{ Math.round(d.min) }}°/{{ Math.round(d.max) }}°</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <hr class="my-5 opacity-25" />

    <!-- Todas las Ciudades -->
    <h3 class="text-center fw-light mb-4">Otras regiones</h3>
    <div class="row g-4">
      <div v-for="l in todosLosLugares" :key="l.nombre" class="col-12 col-sm-6 col-md-4 col-lg-3">
        <div class="card-ciudad-minimal h-100 shadow-sm" @click="selectCity(l.nombre)">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h5 class="mb-0 fw-bold">{{ l.nombre }}</h5>
              <small class="text-muted">{{ l.estado }}</small>
            </div>
            <div class="fs-1">{{ l.icono }}</div>
          </div>
          <div class="mt-3">
            <h4 class="fs-4 fw-bold">{{ Math.round(l.temp) }}°C</h4>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { weatherService } from '@/services/weatherService'

const searchQuery = ref('')
const isFocused = ref(false)
const lugarPrincipal = ref(null)
const todosLosLugares = ref([])

const ciudadesConfig = [
  { nombre: 'Atacama', lat: -27.36, lon: -70.33 },
  { nombre: 'Antofagasta', lat: -23.65, lon: -70.4 },
  { nombre: 'La Serena', lat: -29.9, lon: -71.25 },
  { nombre: 'Valparaíso', lat: -33.05, lon: -71.62 },
  { nombre: 'Santiago', lat: -33.45, lon: -70.66 },
  { nombre: 'Talca', lat: -35.42, lon: -71.66 },
  { nombre: 'Concepción', lat: -36.82, lon: -73.05 },
  { nombre: 'Puerto Montt', lat: -41.47, lon: -72.93 },
  { nombre: 'Coyhaique', lat: -45.57, lon: -72.07 },
  { nombre: 'Punta Arenas', lat: -53.16, lon: -70.91 },
]

const filteredCities = computed(() => {
  const nombres = ciudadesConfig.map((c) => c.nombre)
  if (searchQuery.value === '' && isFocused.value) {
    return nombres
  }

  if (searchQuery.value !== '') {
    return nombres.filter((city) => city.toLowerCase().includes(searchQuery.value.toLowerCase()))
  }
  return []
})

const cargarPrincipal = async (nombre) => {
  const c = ciudadesConfig.find((x) => x.nombre === nombre)
  if (!c) return

  try {
    const data = await weatherService.getClima(c.lat, c.lon)
    const current = data.current_weather

    lugarPrincipal.value = {
      nombre: c.nombre,
      temp: current.temperature,
      icono: weatherService.obtenerIcono(current.weathercode),
      estado: weatherService.obtenerEstado(current.weathercode),
      viento: `${Math.round(current.windspeed)} km/h`,
      humedad: `${data.hourly.relative_humidity_2m[0]}%`,
      dias: data.daily.temperature_2m_max.slice(1, 7).map((max, i) => ({
        dia: new Date(data.daily.time[i + 1]).toLocaleDateString('es-CL', { weekday: 'short' }),
        min: data.daily.temperature_2m_min[i + 1],
        max,
        icono: weatherService.obtenerIcono(data.daily.weathercode[i + 1]),
      })),
    }
  } catch (e) {
    console.error(e)
  }
}

const selectCity = (nombre) => {
  isFocused.value = false
  searchQuery.value = ''
  cargarPrincipal(nombre)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(async () => {
  cargarPrincipal('Santiago')

  const promesas = ciudadesConfig.map(async (c) => {
    try {
      const res = await weatherService.getClima(c.lat, c.lon)
      return {
        nombre: c.nombre,
        temp: res.current_weather.temperature,
        icono: weatherService.obtenerIcono(res.current_weather.weathercode),
        estado: weatherService.obtenerEstado(res.current_weather.weathercode),
      }
    } catch (err) {
      return { nombre: c.nombre, temp: '--', estado: 'Error' }
    }
  })
  todosLosLugares.value = await Promise.all(promesas)
})
</script>

<style scoped>
.search-wrapper {
  position: relative;
  max-width: 500px;
  margin: 0 auto 2rem auto;
  z-index: 100;
}

.search-input {
  width: 100%;
  padding: 15px 25px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 2px solid #f0e6ff;
  outline: none;
  transition: 0.3s;
  color: #453868;
}

.search-input:focus {
  background: rgba(255, 255, 255, 0.9);
  border-color: #d1c4e9;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
}

.suggestions-list {
  position: absolute;
  top: 110%;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(12px);
  max-height: 250px;
  overflow-y: auto;
  border-radius: 15px;
  border: 1px solid rgba(240, 230, 255, 0.8);
  list-style: none;
  padding: 8px 0;
  z-index: 1000;
}

.suggestions-list li:hover {
  background: rgba(209, 196, 233, 0.3);
}

.main-card {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-radius: 24px;
  padding: 30px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.card-ciudad-minimal {
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(8px);
  border-radius: 20px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.card-ciudad-minimal:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.5);
  border-color: #d1c4e9;
}

.forecast-pill-sm {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(5px);
  padding: 12px;
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition:
    transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1),
    box-shadow 0.3s ease,
    background-color 0.3s ease;

  cursor: default;
}

.forecast-pill-sm:hover {
  transform: translateY(-8px);
  background: rgba(255, 255, 255, 0.6);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  border-color: rgba(255, 255, 255, 0.6);
}

.weather-icon-main {
  font-size: 5rem;
}

.temp {
  font-size: 4rem;
  color: #453868;
  font-weight: 600;
}
</style>
