import { shallowMount, config } from '@vue/test-utils'
import InputField from '@/components/general/InputField.vue'

config.mocks['$t'] = () => {}

describe('InputField.vue', () => {
  it('should pass disabled attr to the input', () => {
    const wrapper = shallowMount(InputField, {
      propsData: { disabled: true }
    })
    const input = wrapper.find('input')
    expect(input.attributes('disabled')).toBe('disabled')
  })

  it('should pass readonly attr to the input', () => {
    const wrapper = shallowMount(InputField, {
      propsData: { readonly: true }
    })
    const input = wrapper.find('input')
    expect(input.attributes('readonly')).toBe('readonly')
  })

  it('should render input password', () => {
    const wrapper = shallowMount(InputField, {
      propsData: { type: 'password' }
    })
    const input = wrapper.find('input')
    expect(input.attributes('type')).toBe('password')
    const button = wrapper.find('.btn-visibility')
    expect(button.isVisible()).toBe(true)
  })

  it('should render label text', () => {
    const wrapper = shallowMount(InputField, {
      propsData: { label: 'Test' }
    })
    const label = wrapper.find('label')
    expect(label.text()).toBe('Test')
  })

  it('should render input placeholder', () => {
    const wrapper = shallowMount(InputField, {
      propsData: { placeholder: 'Test' }
    })
    const input = wrapper.find('input')
    expect(input.attributes('placeholder')).toBe('Test')
  })

  it('should limit input length', () => {
    const wrapper = shallowMount(InputField, {
      propsData: { counter: 5, value: '123' }
    })
    const input = wrapper.find('input')
    const counter = wrapper.find('.form-input-counter')
    expect(input.attributes('maxlength')).toBe('5')
    expect(counter.text()).toBe('3 / 5')
    input.setValue('123456789')
    expect(wrapper.vm.value).toBe('123')
  })

  it('should render input number', () => {
    const wrapper = shallowMount(InputField, {
      propsData: {
        type: 'number',
        step: 1,
        min: 1,
        max: 5,
        value: 1
      }
    })
    const input = wrapper.find('input')
    expect(input.attributes('step')).toBe('1')
    expect(input.attributes('min')).toBe('1')
    expect(input.attributes('max')).toBe('5')
  })

  it('should render input hint', () => {
    const wrapper = shallowMount(InputField, {
      propsData: {
        hint: 'Hint'
      }
    })
    const hint = wrapper.find('.form-input-hint')
    expect(hint.text()).toBe('Hint')
  })
})
