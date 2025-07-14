import { shallowMount, config } from '@vue/test-utils'
import Footer from '@/components/general/Footer.vue'

config.mocks['$t'] = () => {}

describe('Footer.vue', () => {
  it('should open when active', () => {
    const wrapper = shallowMount(Footer, {
      propsData: {
        dark: true
      }
    })

    expect(wrapper.find('.footer').exists()).toBe(true)
  })
})
