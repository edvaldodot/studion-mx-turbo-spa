import { shallowMount, config, createLocalVue } from '@vue/test-utils'
import Spinner from '@/components/general/Spinner.vue'
import Vuex from 'vuex'
import storeConfig from './store-config'

config.mocks['$t'] = () => {}

const localVue = createLocalVue()
localVue.use(Vuex)
const store = new Vuex.Store(storeConfig)

describe('Spinner.vue', () => {
  it('should render slot content', () => {
    const wrapper = shallowMount(Spinner, {
      localVue,
      store
    })
    store.state.fetching = true
    expect(wrapper.find('.spinner-container').exists()).toBe(true)
  })
})
