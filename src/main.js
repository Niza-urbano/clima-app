import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import HomeView from './views/HomeView.vue'
import DetalleView from './views/DetalleView.vue'
import './assets/style.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import { weatherService } from '@/services/weatherService'

// Configuración de rutas
const routes = [
  { path: '/', component: HomeView },
  { path: '/detalle/:ciudad', component: DetalleView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const app = createApp(App)
app.use(router)
app.mount('#app')
