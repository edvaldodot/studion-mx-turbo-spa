import { shallowMount, config, createLocalVue } from '@vue/test-utils'
import Dropdown from '@/components/general/Dropdown.vue'
import vClickOutside from 'v-click-outside'

config.mocks['$t'] = () => {}

const localVue = createLocalVue()
localVue.use(vClickOutside)

describe('Dropdown.vue', () => {
  it('should render Dropdown', () => {
    const wrapper = shallowMount(Dropdown, {
      propsData: {
        classes: 'action-bar-link'
      },
      localVue
    })
    expect(wrapper.find('.dropdown').exists()).toBe(true)
    expect(wrapper.vm.isOpen).toBe(false)
    wrapper.find('.dropdown-link').trigger('click')
    expect(wrapper.vm.isOpen).toBe(true)
  })
})
