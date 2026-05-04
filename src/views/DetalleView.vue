<template>
  <div class="container mt-4">
    <div v-if="lugar" class="detalle-wrapper">
      <button class="btn-btn volver-btn mb-3" @click="$router.back()">← Volver</button>

      <div class="main-card shadow-sm mb-4">
        <div class="lado-izq">
          <div class="weather-icon-main">{{ lugar.icono }}</div>
        </div>

        <div class="centro">
          <h2 class="fw-bold">{{ lugar.nombre }}</h2>
          <h1 class="fw-bold temp">{{ Math.round(lugar.temp) }}°C</h1>
          <p class="mb-0">Actual: {{ lugar.estado }}</p>
        </div>

        <div class="lado-der">
          <div class="dato">
            <small>Viento:</small>
            <strong>{{ lugar.viento }}</strong>
          </div>

          <div class="dato">
            <small>Humedad:</small>
            <strong>{{ lugar.humedad }}</strong>
          </div>
        </div>
      </div>

      <div class="pronostico-card">
        <h4 class="fw-bold mb-4">Pronóstico Semanal</h4>
        <div class="row justify-content-center">
          <div v-for="d in lugar.dias" :key="d.dia" class="col-6 col-md-2 mb-3">
            <div class="forecast-pill shadow-sm">
              <small class="fw-bold d-block text-uppercase">{{ d.dia }}</small>
              <span class="d-block my-2 fs-3">{{ d.icono }}</span>
              <small>{{ Math.round(d.min) }}° / {{ Math.round(d.max) }}°</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center p-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-3">Cargando datos del clima...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { weatherService } from '../services/weatherService'

const route = useRoute()
const lugar = ref(null)

// IMPORTANTE: El array debe estar completo para que el .find() funcione
const lugares = [
  { nombre: 'Atacama', lat: -27.36, lon: -70.33, icono: '☀️' },
  { nombre: 'Antofagasta', lat: -23.65, lon: -70.4, icono: '🌤️' },
  { nombre: 'Serena', lat: -29.9, lon: -71.25, icono: '⛅' },
  { nombre: 'Valparaíso', lat: -33.05, lon: -71.62, icono: '🌦️' },
  { nombre: 'Santiago', lat: -33.45, lon: -70.66, icono: '☁️' },
  { nombre: 'Talca', lat: -35.42, lon: -71.66, icono: '🌧️' },
  { nombre: 'Concepción', lat: -36.82, lon: -73.05, icono: '⛈️' },
  { nombre: 'Puerto Montt', lat: -41.47, lon: -72.93, icono: '🌧️' },
  { nombre: 'Coyhaique', lat: -45.57, lon: -72.07, icono: '🌨️' },
  { nombre: 'Punta Arenas', lat: -53.16, lon: -70.91, icono: '❄️' },
]

onMounted(async () => {
  // 1. Obtenemos el nombre de la URL
  const nombreUrl = decodeURIComponent(route.params.ciudad)

  // 2. Buscamos en el array (ignorando mayúsculas/minúsculas por seguridad)
  const l = lugares.find((x) => x.nombre.toLowerCase() === nombreUrl.toLowerCase())

  if (!l) {
    console.error('Ciudad no encontrada en el array local')
    return
  }

  try {
    const data = await weatherService.getClima(l.lat, l.lon)

    const current = data?.current_weather
    const hourly = data?.hourly

    // 🌧️ humedad correcta (alineada con hora actual)
    const nowIndex = hourly?.time?.findIndex((t) => t === current?.time)

    const humedad = nowIndex >= 0 ? `${hourly.relative_humidity_2m[nowIndex]}%` : '--'

    lugar.value = {
      nombre: l.nombre,
      icono: weatherService.obtenerIcono(current.weathercode),
      temp: current.temperature,
      viento: current.windspeed != null ? `${Math.round(current.windspeed)} km/h` : '--',
      humedad: hourly?.relative_humidity_2m?.[0] ? `${hourly.relative_humidity_2m[0]}%` : '--',
      estado: weatherService.obtenerEstado(current.weathercode),

      dias: data.daily.temperature_2m_max.slice(1, 7).map((max, i) => ({
        dia: new Date(data.daily.time[i + 1]).toLocaleDateString('es-CL', { weekday: 'short' }),
        min: data.daily.temperature_2m_min[i + 1],
        max,
        icono: weatherService.obtenerIcono(data.daily.weathercode[i + 1]),
      })),
    }
  } catch (error) {
    console.error(error)
  }
})
</script>
