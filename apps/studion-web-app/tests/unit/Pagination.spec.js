import { shallowMount, config } from '@vue/test-utils'
import Pagination from '@/components/general/Pagination.vue'

config.mocks['$t'] = () => {}

describe('Pagination.vue', () => {
  it('should emmit click event', () => {
    const wrapper = shallowMount(Pagination, {
      propsData: {
        pageCount: 2,
        activePage: 1
      }
    })
    const btnLeft = wrapper.find('.pagination-left')
    const btnRight = wrapper.find('.pagination-right')
    expect(btnLeft.attributes('disabled')).toBe('true')
    wrapper.setProps({ activePage: 2 })
    expect(btnRight.attributes('disabled')).toBe('true')
  })
})
