import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './app/App.vue'
import { router } from './app/router'
import { setupPersistence } from './app/persistence'
import { setupAnalytics } from './app/analytics'
import './styles/main.scss'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
setupPersistence()
// Before mounting, so the first page's events are not lost.
setupAnalytics(import.meta.env.VITE_UMAMI_WEBSITE_ID, import.meta.env.VITE_UMAMI_DOMAINS)
app.mount('#app')
