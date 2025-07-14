import { mount, config } from '@vue/test-utils'
import ValidationMessage from '@/components/general/ValidationMessage.vue'

config.mocks['$t'] = key => key

describe('ValidationMessage.vue', () => {
  it('should show messages', () => {
    const wrapper = mount(ValidationMessage, {
      propsData: {
        validation: {
          $error: true,
          required: false,
          userEmail: false
        }
      }
    })
    expect(wrapper.findAll('.form-input-message').at(0).text()).toBe('global:validation.required')
    expect(wrapper.findAll('.form-input-message').at(1).text()).toBe('global:validation.email')
  })
})
