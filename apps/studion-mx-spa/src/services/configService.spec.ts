import { describe, it, expect, vi, beforeEach } from 'vitest'
import { configService } from '@/services/configService'
import { externalApi } from '@/support/http/api'
import { handleError } from '@/support/utils'

// Mocks
vi.mock('@/support/http/api', () => ({
  externalApi: {
    get: vi.fn()
  }
}))

vi.mock('@/support/utils', () => ({
  handleError: vi.fn()
}))

describe('configService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve retornar dados da configuração com sucesso', async () => {
    const mockResponse = { data: { theme: 'dark' } }

    ;(externalApi.get as any).mockResolvedValue(mockResponse)

    const result = await configService.fetchConfig()

    expect(externalApi.get).toHaveBeenCalledWith('/config')
    expect(result).toEqual(mockResponse)
  })

  it('deve chamar handleError e relançar o erro em caso de falha', async () => {
    const mockError = new Error('Erro na API')
    ;(externalApi.get as any).mockRejectedValue(mockError)

    await expect(configService.fetchConfig()).rejects.toThrow('Erro na API')
    expect(handleError).toHaveBeenCalledWith(mockError)
  })
})
