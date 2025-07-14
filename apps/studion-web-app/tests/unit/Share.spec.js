import { mount, config } from '@vue/test-utils'
import Share from '@/components/general/Share.vue'

config.mocks['$t'] = () => {}

describe('Share.vue', () => {
  it('should render share', () => {
    const wrapper = mount(Share, {
      propsData: {
        dark: true
      }
    })
    const share = wrapper.find('.share')
    expect(share.classes()).toContain('theme-dark')
    global.open = jest.fn()
    wrapper.findAll('.share-link').at(0).trigger('click')
    expect(global.open).toBeCalled()
  })
})
