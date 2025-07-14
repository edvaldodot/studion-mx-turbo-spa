// src/stores/configStore.ts
import { defineStore } from 'pinia'
import { configService } from '@/services'
import { Config } from '@/types'

export const useConfigStore = defineStore('config', {
  state: () => ({
    config: {} as Config,
  }),
  getters: {
    getConfig: (state) => state.config,
    apiBaseUrl: (state) => state.config?.env?.API_URL || 'http://localhost/api',
  },
  actions: {
    async setConfig() {
      try {
        const response = await configService.fetchConfig()
        this.config = response?.data
      } catch (error) {
        console.error('[ConfigStore] Erro ao carregar config:', error)
        throw error
      }
    },
  },
})
