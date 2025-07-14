import { shallowMount, config, createLocalVue } from '@vue/test-utils'
import NotFoundPage from '@/components/general/NotFoundPage.vue'
import Vuex from 'vuex'
import storeConfig from './store-config'

config.mocks['$t'] = () => {}

const localVue = createLocalVue()
localVue.use(Vuex)
const store = new Vuex.Store(storeConfig)

describe('NotFoundPage.vue', () => {
  it('should render NotFoundPage', () => {
    const wrapper = shallowMount(NotFoundPage, {
      localVue,
      store
    })
    expect(wrapper.find('.not-found').exists()).toBe(true)
  })
})
