import { shallowMount } from '@vue/test-utils'
import MobileHeader from '@/components/general/MobileHeader.vue'

describe('MobileHeader.vue', () => {
  it('should render MobileHeader', () => {
    const wrapper = shallowMount(MobileHeader)
    wrapper.vm.openMenu()
    expect(wrapper.emitted('open')).toBeTruthy()
  })
})
