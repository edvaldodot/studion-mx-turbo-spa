import { shallowMount, config } from '@vue/test-utils'
import Tabs from '@/components/general/Tabs.vue'

config.mocks['$t'] = () => {}

const links = [
  {
    text: 'Tab 1'
  },
  {
    text: 'Tab 2'
  }
]

describe('Tabs.vue', () => {
  it('should render index tab active', () => {
    const wrapper = shallowMount(Tabs, {
      propsData: {
        links: links,
        indexActive: 1
      }
    })
    expect(wrapper.vm.indexActive).toBe(1)
  })

  it('should emmit event changeTab', () => {
    const wrapper = shallowMount(Tabs, {
      propsData: {
        links: links
      }
    })
    wrapper.findAll('.tabs-link').at(0).trigger('click')
    expect(wrapper.emitted().tabChange).toBeTruthy()
  })
})
