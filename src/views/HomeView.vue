<template>
  <div class="row" id="contenedorC">
    <div v-for="l in lugares" :key="l.nombre" class="col-12 col-sm-6 col-md-4 mb-4">
      <div class="card-ciudad text-center h-100 card-clima">
        <h4>{{ l.nombre }}</h4>
        <div class="icono-clima">{{ l.icono }}</div>
        <button class="btn-boton mt-2" @click="irADetalle(l.nombre)">Ver detalle</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { weatherService } from '@/services/weatherService'

const router = useRouter()

const lugaresBase = [
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

const lugares = ref([])

const irADetalle = (nombre) => {
  router.push(`/detalle/${encodeURIComponent(nombre)}`)
}

onMounted(async () => {
  try {
    const data = await Promise.all(
      lugaresBase.map(async (l) => {
        try {
          const res = await weatherService.getClima(l.lat, l.lon)

          const current = res?.current_weather
          const hourly = res?.hourly

          const nowIndex = hourly?.time?.findIndex((t) => t === current?.time)

          const humedad = nowIndex >= 0 ? `${hourly.relative_humidity_2m[nowIndex]}%` : '--'

          if (!current) {
            console.warn('Sin current_weather para:', l.nombre, res)

            return {
              nombre: l.nombre,
              lat: l.lat,
              lon: l.lon,
              temp: '--',
              viento: '--',
              humedad: '--',
              icono: '❓',
              estado: 'Sin datos',
            }
          }

          return {
            nombre: l.nombre,
            lat: l.lat,
            lon: l.lon,
            temp: current.temperature ?? '--',
            viento: current.windspeed ? Math.round(current.windspeed * 3.6) : '--',
            humedad: hourly?.relative_humidity_2m?.[0] ?? '--',
            icono: weatherService.obtenerIcono(current.weathercode),
            estado: weatherService.obtenerEstado(current.weathercode),
          }
        } catch (err) {
          console.error(`Error en ${l.nombre}:`, err)

          return {
            nombre: l.nombre,
            lat: l.lat,
            lon: l.lon,
            temp: '--',
            viento: '--',
            humedad: '--',
            icono: '⚠️',
            estado: 'Error',
          }
        }
      }),
    )

    lugares.value = data
  } catch (error) {
    console.error('Error cargando clima general:', error)
  }
})
</script>
