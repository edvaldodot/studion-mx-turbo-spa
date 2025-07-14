import { shallowMount, config } from '@vue/test-utils'
import Logo from '@/components/general/Logo.vue'

config.mocks['$t'] = () => {}

describe('Logo.vue', () => {
  it('should render logo', () => {
    const wrapper = shallowMount(Logo, {
      propsData: {
        link: true
      }
    })
    const logo = wrapper.find('.logo')
    expect(logo.attributes('href')).toBe('/')
    wrapper.setProps({ link: false })
    expect(logo.is('div')).toBe(true)
  })
})
