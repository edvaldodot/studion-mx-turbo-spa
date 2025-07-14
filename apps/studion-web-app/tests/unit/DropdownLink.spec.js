import { shallowMount, config } from '@vue/test-utils'
import Dropdown from '@/components/general/Dropdown.vue'
import DropdownLink from '@/components/general/DropdownLink.vue'

config.mocks['$t'] = () => {}

describe('DropdownLink.vue', () => {
  it('should render DropdownLink', () => {
    const wrapper = shallowMount(DropdownLink, {
      propsData: {
        text: 'Text'
      },
      parentComponent: Dropdown
    })
    wrapper.find('.dropdown-content-link').trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })
})
