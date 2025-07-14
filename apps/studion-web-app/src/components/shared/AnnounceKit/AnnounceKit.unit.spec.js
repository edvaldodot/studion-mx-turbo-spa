import { shallowMount, createLocalVue } from '@vue/test-utils'
import AnnounceKit from '@/components/shared/AnnounceKit'
import Vuex from 'vuex'

jest.mock('@/config', () => ({
  ANNOUNCE_KIT: {
    ENABLED: true,
    WNAME: 'announcekit',
    WID: '2dVX1e',
  },
}))

const localVue = createLocalVue()
localVue.use(Vuex)

const store = new Vuex.Store({ announceKitUnreads: 0 })

describe('AnnounceKit', () => {
  const mountComponent = (props = {}, isStudent = false) => {
    jest.doMock('@/config', () => {})

    return shallowMount(AnnounceKit, {
      localVue,
      store,
      propsData: props,
      mocks: {
        notEqualsProfile: jest.fn(() => !isStudent),
        $t: (msg) => msg,
      },
    })
  }

  it('should render the component to admin', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.announcekit').exists()).toBe(true)
  })

  it('should not render the component to student', () => {
    const wrapper = mountComponent({}, true)
    expect(wrapper.find('.announcekit').exists()).toBe(false)
  })

  it('should not show counter if all read', () => {
    const wrapper = mountComponent({}, false)
    const counter = wrapper.find('.announcekit-counter')
    expect(counter.exists()).toBe(false)
  })

  it('should show counter if unread posts', () => {
    store.state.announceKitUnreads = 4

    const wrapper = mountComponent()
    const counter = wrapper.find('.announcekit-counter')

    expect(counter.text()).toBe('4')
  })

  describe('Conditionally render span', () => {
    it('should show span if showSpan true', () => {
      const wrapper = mountComponent({ showSpan: true })
      expect(wrapper.find('span.text').exists()).toBe(true)
    })

    it('should not show span if showSpan false (default)', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('span.text').exists()).toBe(false)
    })
  })
})
