import { shallowMount, config } from '@vue/test-utils'
import MoneyField from '@/components/general/MoneyField.vue'
import { VMoney } from 'v-money'

config.mocks['$t'] = () => {}
config.mocks['$n'] = key => 'R$ 9.999,99'

describe('MoneyField.vue', () => {
  it('should render MoneyField', () => {
    const wrapper = shallowMount(MoneyField, {
      propsData: {
        label: 'test',
        value: 123
      },
      mocks: {
        VMoney
      }
    })
    expect(wrapper.find('.form-label').text()).toBe('test')
    expect(wrapper.find('.form-input').element.value).toBe('123,00')
  })
})
