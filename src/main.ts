import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './app/App.vue'
import { router } from './app/router'
import { setupPersistence } from './app/persistence'
import './styles/main.scss'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
setupPersistence()
app.mount('#app')
