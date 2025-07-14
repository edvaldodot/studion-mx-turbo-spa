import { shallowMount, config } from '@vue/test-utils'
import TextareaField from '@/components/general/TextareaField.vue'

config.mocks['$t'] = () => {}

describe('TextareaField.vue', () => {
  it('should pass disabled attr to the input', () => {
    const wrapper = shallowMount(TextareaField, {
      propsData: { disabled: true }
    })
    const input = wrapper.find('textarea')
    expect(input.attributes('disabled')).toBe('disabled')
  })

  it('should pass readonly attr to the input', () => {
    const wrapper = shallowMount(TextareaField, {
      propsData: { readonly: true }
    })
    const input = wrapper.find('textarea')
    expect(input.attributes('readonly')).toBe('readonly')
  })

  it('should render label text', () => {
    const wrapper = shallowMount(TextareaField, {
      propsData: { label: 'Test' }
    })
    const label = wrapper.find('label')
    expect(label.text()).toBe('Test')
  })

  it('should render input placeholder', () => {
    const wrapper = shallowMount(TextareaField, {
      propsData: { placeholder: 'Test' }
    })
    const input = wrapper.find('textarea')
    expect(input.attributes('placeholder')).toBe('Test')
  })

  it('should limit input length', () => {
    const wrapper = shallowMount(TextareaField, {
      propsData: { counter: 5, value: '123' }
    })
    const input = wrapper.find('textarea')
    const counter = wrapper.find('.form-input-counter')
    expect(input.attributes('maxlength')).toBe('5')
    expect(counter.text()).toBe('3 / 5')
    input.setValue('123456789')
    expect(wrapper.vm.value).toBe('123')
  })

  it('should render input hint', () => {
    const wrapper = shallowMount(TextareaField, {
      propsData: {
        hint: 'Hint'
      }
    })
    const hint = wrapper.find('.form-input-hint')
    expect(hint.text()).toBe('Hint')
  })
})
