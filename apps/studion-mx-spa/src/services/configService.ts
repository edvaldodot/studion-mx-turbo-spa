// src/services/configService.ts
import { externalApi } from '@/support/http/api'
import { handleError } from '@/support/utils'

export const configService = {
  async fetchConfig() {
    try {
      return await externalApi.get('/config')
    } catch (error) {
      handleError(error)
      throw error
    }
  },
}
