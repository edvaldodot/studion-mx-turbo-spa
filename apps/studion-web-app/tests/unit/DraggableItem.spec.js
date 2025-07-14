import { shallowMount } from '@vue/test-utils'
import DraggableItem from '@/components/general/DraggableItem'

describe('DraggableItem.vue', () => {
  it('should render', () => {
    const wrapper = shallowMount(DraggableItem, {
      propsData: {
        index: 1
      }
    })
    expect(wrapper.find('.draggable-item').exists()).toBeTruthy()
  })

  it('should emit order event', () => {
    const wrapper = shallowMount(DraggableItem, {
      propsData: {
        index: 1
      }
    })
    wrapper.find('.btn-order-up').trigger('click')
    expect(wrapper.emitted().order).toBeTruthy()
    wrapper.find('.btn-order-down').trigger('click')
    expect(wrapper.emitted().order).toBeTruthy()
  })
})
