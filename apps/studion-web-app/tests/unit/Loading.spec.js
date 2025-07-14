import { shallowMount, config } from '@vue/test-utils'
import Loading from '@/components/general/Loading.vue'

config.mocks['$t'] = () => {}

describe('Loading.vue', () => {
  it('should render Loading', () => {
    const wrapper = shallowMount(Loading)
    expect(wrapper.find('.loading').exists()).toBe(true)
  })
})
