import { shallowMount, config, createLocalVue } from '@vue/test-utils'
import SelectField from '@/components/general/SelectField.vue'
import vClickOutside from 'v-click-outside'

config.mocks['$t'] = () => {}

const localVue = createLocalVue()
localVue.use(vClickOutside)

describe('SelectField.vue', () => {
  it('should disable', () => {
    const wrapper = shallowMount(SelectField, {
      propsData: {
        disabled: true
      },
      localVue
    })
    wrapper.find('.form-select-wrapper').trigger('click')
    expect(wrapper.vm.dropdownOpen).toBe(false)
  })

  it('should render label', () => {
    const wrapper = shallowMount(SelectField, {
      propsData: {
        label: 'Text'
      },
      localVue
    })
    const label = wrapper.find('.form-label')
    expect(label.text()).toBe('Text')
  })

  it('should render hint', () => {
    const wrapper = shallowMount(SelectField, {
      propsData: {
        hint: 'Hint'
      },
      localVue
    })
    const hint = wrapper.find('.form-input-hint')
    expect(hint.text()).toBe('Hint')
  })

  it('should open options', () => {
    const wrapper = shallowMount(SelectField, {
      propsData: {
        items: [
          {
            text: 'Text',
            value: 0
          },
          {
            text: 'Text 2',
            value: 1
          }
        ]
      },
      localVue
    })
    wrapper.find('.form-select-wrapper').trigger('click')
    expect(wrapper.vm.dropdownOpen).toBe(true)
  })

  it('should render multiple attribute', () => {
    const wrapper = shallowMount(SelectField, {
      propsData: {
        items: [
          {
            text: 'Text',
            value: 0
          },
          {
            text: 'Text 2',
            value: 1
          }
        ],
        multiple: true,
        selectAllOption: false
      },
      localVue
    })
    wrapper.vm.dropdownOpen = true
    const options = wrapper.findAll('.form-select-dropdown-item')
    options.at(0).trigger('click')
    expect(wrapper.vm.mutableValue).toEqual([0])
    options.at(1).trigger('click')
    expect(wrapper.vm.mutableValue).toEqual([0, 1])
    options.at(0).trigger('click')
    expect(wrapper.vm.mutableValue).toEqual([1])
  })
})
