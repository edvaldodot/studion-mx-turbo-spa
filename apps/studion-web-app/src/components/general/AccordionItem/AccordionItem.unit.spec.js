import { shallowMount, config } from '@vue/test-utils'
import AccordionItem from '.'

config.mocks['$t'] = () => {}
config.mocks['$testId'] = (id) => id

describe('AccordionItem.vue', () => {
  it('should open accordion', () => {
    const wrapper = shallowMount(AccordionItem, {
      propsData: {
        title: 'Title of accordion',
        content: 'Content of accordion',
      },
    })
    wrapper.find('.accordion-item-header').trigger('click')
    expect(wrapper.emitted().open).toBeTruthy()
  })
})
