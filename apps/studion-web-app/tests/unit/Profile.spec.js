import { shallowMount, config, createLocalVue, RouterLinkStub } from '@vue/test-utils'
import Profile from '@/components/general/Profile.vue'
import Vuex from 'vuex'
import storeConfig from './store-config'

config.mocks['$t'] = () => {}

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.mixin({
  computed: {
    $media () {
      return {
        mobile: false,
        tablet: false,
        desktop: true
      }
    }
  }
})
const store = new Vuex.Store(storeConfig)

describe('Profile.vue', () => {
  it('should render Profile', () => {
    const wrapper = shallowMount(Profile, {
      propsData: {
        classes: 'test'
      },
      stubs: {
        RouterLink: RouterLinkStub
      },
      localVue,
      store
    })
    expect(wrapper.find('.profile-link').classes()).toContain('test')
    wrapper.find('.profile-link').trigger('click')
    expect(wrapper.vm.isOpen).toBe(true)
    wrapper.find('.profile-close').trigger('click')
    expect(wrapper.vm.isOpen).toBe(false)
  })
})
