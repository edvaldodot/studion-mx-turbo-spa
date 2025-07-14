import { shallowMount, config } from '@vue/test-utils'
import Icon from '.'

config.mocks['$t'] = () => {}
config.mocks['$testId'] = (id) => id

describe('Icon.vue', () => {
  it('should emmit click event', () => {
    const wrapper = shallowMount(Icon, {
      propsData: {
        name: 'calendar',
      },
    })
    wrapper.find('.icon').trigger('click')
    expect(wrapper.emitted().click).toBeTruthy()
  })
})
