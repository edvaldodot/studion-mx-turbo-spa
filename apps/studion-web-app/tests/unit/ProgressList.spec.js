import { shallowMount, config } from '@vue/test-utils'
import ProgressList from '@/components/general/ProgressList.vue'

config.mocks['$t'] = () => {}

describe('ProgressList.vue', () => {
  it('should render ProgressList', () => {
    const wrapper = shallowMount(ProgressList, {
      propsData: {
        labelText: 'test',
        numItems: 10,
        numActiveItems: 2
      }
    })
    const label = wrapper.find('.progress-label')
    expect(label.text()).toBe('test:')
    const items = wrapper.findAll('.progress-item')
    expect(items.length).toBe(10)
    wrapper.vm.mutableActiveItems = 2
    const itemsActive = wrapper.findAll('.progress-item.is-active')
    expect(itemsActive.length).toBe(2)
  })
})
