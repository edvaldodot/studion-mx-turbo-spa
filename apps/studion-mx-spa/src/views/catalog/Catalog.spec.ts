import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import Catalog from '@/views/catalog/Catalog.vue'
import { useJourneyStore } from '@/stores'

vi.mock('@/stores', () => ({
  useJourneyStore: vi.fn()
}))

vi.mock('@/services', () => ({
  journeysService: {
    fetchJourneyById: vi.fn(),
    fetchSessionsByJourney: vi.fn()
  }
}))

describe('Catalog.vue', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('exibe mensagem de erro ao falhar no fetch', async () => {
		// Força erro ao acessar getJourneys
		const brokenStore = {
			setJourneys: vi.fn().mockResolvedValue(undefined),
			get getJourneys() {
				throw new Error('Falha no fetch')
			}
		}

		;(useJourneyStore as any).mockReturnValue(brokenStore)

		const wrapper = mount(Catalog)
		await flushPromises()
		await wrapper.vm.$nextTick()

		const errorBox = wrapper.find('[data-testid="error-message"]')
		expect(errorBox.exists()).toBe(true)
		expect(errorBox.text()).toContain('Failed to load: Falha no fetch')
	})
	

})
