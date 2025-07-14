import { createApp } from 'vue'
import App from './App.vue'
import { usePlugins } from './plugins'
import './styles/index.css'

async function bootstrap() {
  const app = createApp(App)

  await usePlugins(app) // aguarda carregar config e inicializar API

  app.mount('#app')
}

bootstrap()
