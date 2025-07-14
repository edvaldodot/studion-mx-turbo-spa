import { shallowMount, config } from '@vue/test-utils'
import Modal from '@/components/general/Modal.vue'

config.mocks['$t'] = () => {}

describe('Modal.vue', () => {
  it('should open when active', () => {
    const wrapper = shallowMount(Modal, {
      propsData: {
        active: true
      }
    })
    const modal = wrapper.find('.modal')
    expect(modal.exists()).toBe(true)
    const button = wrapper.find('.btn-back')
    expect(button.exists()).toBe(true)
    expect(document.body.classList[0]).toBe('modal-open')
    expect(wrapper.vm.modalLength).toBe(1)
  })

  it('should remove cancel button', () => {
    const wrapper = shallowMount(Modal, {
      propsData: {
        cancel: false
      }
    })
    const button = wrapper.find('.btn-back')
    expect(button.exists()).toBe(false)
  })
})
