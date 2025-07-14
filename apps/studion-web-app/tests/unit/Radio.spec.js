import { shallowMount, mount, config } from '@vue/test-utils'
import Radio from '@/components/general/Radio.vue'

config.mocks['$t'] = () => {}

describe('Radio.vue', () => {
  it('should render props', () => {
    const wrapper = shallowMount(Radio, {
      propsData: {
        description: 'description',
        disabled: true,
        horizontal: true,
        dark: true,
        items: [
          {
            label: 'Label 1',
            value: 0
          },
          {
            label: 'Label 1',
            value: 1
          }
        ]
      }
    })

    expect(wrapper.find('.form-item-description').exists()).toBe(true)
    expect(wrapper.find('.form-item').classes('form-item-horizontal')).toBe(true)
    expect(wrapper.find('.form-item').classes('theme-dark')).toBe(true)
    expect(wrapper.vm.mutableItems.filter(item => item.disabled === true).length).toBe(2)
  })

  it('should change value', () => {
    const wrapper = mount(Radio, {
      propsData: {
        items: [
          {
            label: 'Label 1',
            value: 0
          },
          {
            label: 'Label 1',
            value: 1
          }
        ]
      }
    })
    const radioItem = wrapper.findAll('.form-radio-item')
    radioItem.at(1).find('.form-radio').trigger('click')
    expect(wrapper.vm.mutableValue).toBe(1)
    radioItem.at(0).find('.form-radio').trigger('click')
    expect(wrapper.vm.mutableValue).toBe(0)
  })
})
