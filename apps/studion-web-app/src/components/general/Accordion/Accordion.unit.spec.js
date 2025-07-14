import { shallowMount, config } from '@vue/test-utils'
import Accordion from '.'

config.mocks['$t'] = () => {}
config.mocks['$testId'] = (id) => id

describe('Accordion.vue', () => {
  it('should render accordion', () => {
    const wrapper = shallowMount(Accordion, {
      propsData: {
        card: true,
        dark: true,
      },
    })
    const accordion = wrapper.find('.accordion')
    expect(accordion.classes()).toContain('theme-dark')
    expect(accordion.classes()).toContain('accordion-card')
  })
})
