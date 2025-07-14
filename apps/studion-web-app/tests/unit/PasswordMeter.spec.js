import { mount, config } from '@vue/test-utils'
import PasswordMeter from '@/components/general/PasswordMeter.vue'

config.mocks['$t'] = () => {}

describe('PasswordMeter.vue', () => {
  it('should render PasswordMeter', () => {
    const wrapper = mount(PasswordMeter, {
      propsData: {
        value: 'a'
      }
    })
    expect(wrapper.vm.score).toBe(0)
    wrapper.setProps({ value: 'teste' })
    expect(wrapper.vm.score).toBe(1)
    wrapper.setProps({ value: 'testeAa2' })
    expect(wrapper.vm.score).toBe(2)
    wrapper.setProps({ value: 'testeAa212' })
    expect(wrapper.vm.score).toBe(3)
    wrapper.setProps({ value: 'testeAa212AA' })
    expect(wrapper.vm.score).toBe(4)
  })
})
