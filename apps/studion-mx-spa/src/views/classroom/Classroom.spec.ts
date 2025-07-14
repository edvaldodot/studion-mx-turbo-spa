import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import Classroom from './Classroom.vue'
import { useJourneyStore } from '@/stores'
import { router } from '../../../tests/setupTest'

vi.mock('@/stores', () => ({
  useJourneyStore: vi.fn()
}))

vi.mock('@/utils/toast', () => ({
  toastSuccess: vi.fn()
}))

vi.mock('../ClassroomSideBar.vue', () => ({
  default: {
    name: 'ClassroomSideBar',
    template: '<div data-testid="sidebar" />'
  }
}))

vi.mock('../ClassroomInfo.vue', () => ({
  default: {
    name: 'ClassroomInfo',
    template: '<div data-testid="info" />'
  }
}))

vi.mock('@/components/general/NavBar.vue', () => ({
  default: {
    name: 'NavBar',
    template: '<div data-testid="navbar" />'
  }
}))

describe('Classroom.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exibe loading ao iniciar', async () => {
    (useJourneyStore as any).mockReturnValue({
      getClassroom: {},
      getComponents: [],
      setClassroom: vi.fn().mockResolvedValue(undefined),
      setComponents: vi.fn().mockResolvedValue(undefined)
    })

    await router.push('/classroom/j1/s1') // simula rota
    await router.isReady()

    const wrapper = mount(Classroom)

    expect(wrapper.text()).toContain('Carregando sala de aula...')
    await flushPromises()
  })

  it('carrega dados e exibe componentes após loading', async () => {
		const setClassroom = vi.fn().mockResolvedValue(undefined) as (j: string, s: string) => Promise<void>
		const setComponents = vi.fn().mockResolvedValue(undefined) as (j: string, s: string) => Promise<void>

		(useJourneyStore as any).mockReturnValue({
			getClassroom: {
				id: 1,
				session: { name: 'Sessão Teste' },
				journey: { image: 'https://example.com/image.jpg' }
			},
			getComponents: {
				components: [
					{ id: 'c1', name: 'Componente 1' },
					{ id: 'c2', name: 'Componente 2' }
				]
			},
			setClassroom,
			setComponents
		})

		router.addRoute({
			path: '/classroom/:journeyUuid/:sessionUuid',
			name: 'Classroom',
			component: Classroom
		})

		await router.push('/classroom/j1/s1')
		await router.isReady()

		const wrapper = mount(Classroom)
		await flushPromises()

		expect(setClassroom).toHaveBeenCalledWith('j1', 's1')
		expect(setComponents).toHaveBeenCalledWith('j1', 's1')
		expect(wrapper.find('[data-testid="sidebar"]').exists()).toBe(true)
	})

  it('redireciona se parâmetros estiverem ausentes', async () => {
    const replaceSpy = vi.spyOn(router, 'replace').mockImplementation(() => Promise.resolve())

    await router.push('/classroom/') // rota sem params
    await router.isReady()

    mount(Classroom)

    await flushPromises()
    expect(replaceSpy).toHaveBeenCalledWith('/')
    })

})
