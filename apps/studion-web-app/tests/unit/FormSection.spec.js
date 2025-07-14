import { shallowMount, config } from '@vue/test-utils'
import FormSection from '@/components/general/FormSection.vue'

config.mocks['$t'] = () => {}

describe('FormSection.vue', () => {
  it('should render FormSection', () => {
    const wrapper = shallowMount(FormSection, {
      propsData: {
        title: 'Title',
        dark: true
      }
    })
    const section = wrapper.find('.form-section')
    expect(section.classes()).toContain('theme-dark')
    const title = wrapper.find('.form-section-title')
    expect(title.text()).toBe('Title')
  })
})
