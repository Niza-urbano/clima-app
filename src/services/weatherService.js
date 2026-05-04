import axios from 'axios'

const BASE_URL = 'https://api.open-meteo.com/v1/forecast'

export const weatherService = {
  async getClima(lat, lon) {
    const res = await axios.get(BASE_URL, {
      params: {
        latitude: lat,
        longitude: lon,
        current_weather: true,
        hourly: 'relative_humidity_2m,wind_speed_10m',
        daily: 'temperature_2m_max,temperature_2m_min,weathercode',
        timezone: 'auto',
      },
    })

    return res.data
  },

  obtenerIcono(codigo) {
    if (codigo === 0) return '☀️'
    if (codigo <= 2) return '🌤️'
    if (codigo <= 3) return '⛅'
    if (codigo <= 61) return '🌧️'
    if (codigo <= 80) return '🌦️'
    return '⛈️'
  },

  obtenerEstado(codigo) {
    if (codigo === 0) return 'Soleado'
    if (codigo <= 2) return 'Parcialmente nublado'
    if (codigo <= 3) return 'Nublado parcial'
    if (codigo <= 61) return 'Lluvia'
    if (codigo <= 80) return 'Chubascos'
    return 'Tormenta'
  },
}
