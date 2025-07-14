import { describe, it, expect, vi, beforeEach } from 'vitest'
import { toastSuccess, toastInfo, toastWarning, toastError } from './toast'
import { useToast } from 'vue-toastification'

vi.mock('vue-toastification', () => {
  const toastMock = {
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  }
  return {
    useToast: () => toastMock,
  }
})

describe('toast.ts', () => {
  const toast = useToast()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('dispara toastSuccess corretamente', () => {
    toastSuccess('Sucesso!', { timeout: 3000 })
    expect(toast.success).toHaveBeenCalledWith('Sucesso!', { timeout: 3000 })
  })

  it('dispara toastInfo corretamente', () => {
    toastInfo('Info')
    expect(toast.info).toHaveBeenCalledWith('Info', undefined)
  })

  it('dispara toastWarning corretamente', () => {
    toastWarning('Atenção!')
    expect(toast.warning).toHaveBeenCalledWith('Atenção!', undefined)
  })

  it('dispara toastError corretamente', () => {
    toastError('Erro inesperado')
    expect(toast.error).toHaveBeenCalledWith('Erro inesperado', undefined)
  })
})
