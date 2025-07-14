import { shallowMount, config, createLocalVue } from '@vue/test-utils'
import EmptyMessage from '@/components/general/EmptyMessage.vue'
import Vuex from 'vuex'
import storeConfig from './store-config'

config.mocks['$t'] = () => {}

const localVue = createLocalVue()
localVue.use(Vuex)
const store = new Vuex.Store(storeConfig)

describe('EmptyMessage.vue', () => {
  it('should render slot content', () => {
    const wrapper = shallowMount(EmptyMessage, {
      slots: {
        default: '<div class="test">test</div>'
      },
      localVue,
      store
    })
    const content = wrapper.find('.test')
    expect(content.text()).toBe('test')
  })
})
