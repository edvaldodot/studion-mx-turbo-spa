import { shallowMount, config, createLocalVue } from '@vue/test-utils'
import storeConfig from './store-config'
import Vuex from 'vuex'
import Toast from '@/components/general/Toast.vue'

config.mocks['$t'] = () => {}

describe('Toast.vue', () => {
  it('should pass message to the toast', () => {
    const localVue = createLocalVue()
    localVue.use(Vuex)
    const store = new Vuex.Store(storeConfig)
    const wrapper = shallowMount(Toast, {
      localVue,
      store
    })
    store.state.feedback.message = 'Message'
    wrapper.vm.isActive = true
    expect(wrapper.find('.toast-message p').text()).toBe('Message')
    wrapper.vm.isActive = false
    expect(wrapper.find('.toast').exists()).toBe(false)
  })
})
