// src/plugins/index.ts
import type { App } from 'vue'
import router from '@/router'
import pinia from './pinia'
import i18n from '@/support/i18n/i18n'
import 'material-symbols'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

import { useConfigStore } from '@/stores'
import { initApi } from '@/support/http/api'

export const usePlugins = async (app: App) => {
  app.use(pinia)

  // Store já precisa do Pinia registrado
  const configStore = useConfigStore()

  await configStore.setConfig()
  initApi(configStore.apiBaseUrl)

  app.use(router)
  app.use(i18n)

  app.use(Toast, {
    position: 'bottom-right',
    timeout: 6000,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    showCloseButtonOnHover: false,
  })
}
