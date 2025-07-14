import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import HomeView from '@/views/HomeView.vue'
import { createTestingPinia } from '@pinia/testing'

const mockGet = vi.fn().mockResolvedValue({
  data: {
    data: [
      { id: 1, name: 'Curso 1', status: 'published' },
      { id: 2, name: 'Curso 2', status: 'draft' },
    ],
  },
})

vi.mock('@/support/http/api', () => ({
  getApi: () => ({
    get: mockGet,
  }),
  __esModule: true,
}))

describe('HomeView.vue', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    wrapper = mount(HomeView, {
      global: {
        plugins: [createTestingPinia()],
        stubs: {
          VerticalTabs: true, // mocka o componente
        },
      },
    })
    mockGet.mockClear()
  })

  it('renderiza o título da página', () => {
    expect(wrapper.text()).toContain('A tal chamada em API')
  })

  it('carrega e exibe os cursos ao clicar no botão', async () => {
    const button = wrapper.get('[data-testid="btn-carregar-cursos"]')
    await button.trigger('click')
    await flushPromises()

    const rows = wrapper.findAll('tbody tr')
    expect(rows.length).toBe(2)
    expect(rows[0].text()).toContain('Curso 1')
    expect(rows[1].text()).toContain('Curso 2')
  })

  it('exibe mensagem de erro se a chamada falhar', async () => {
    mockGet.mockRejectedValueOnce(new Error('Erro na API'))

    const button = wrapper.get('[data-testid="btn-carregar-cursos"]')
    await button.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Erro ao carregar: Erro na API')
  })
})
