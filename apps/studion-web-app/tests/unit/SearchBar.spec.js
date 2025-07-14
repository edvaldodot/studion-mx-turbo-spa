import { shallowMount, config, createLocalVue } from '@vue/test-utils'
import SearchBar from '@/components/general/SearchBar.vue'
import vClickOutside from 'v-click-outside'

config.mocks['$t'] = () => {}

const localVue = createLocalVue()
localVue.use(vClickOutside)

describe('SearchBar.vue', () => {
  it('should disable', () => {
    const wrapper = shallowMount(SearchBar, {
      propsData: {
        classes: 'action-bar-link'
      },
      localVue
    })
    const btn = wrapper.find('.search-bar-link')
    expect(btn.classes()).toContain('action-bar-link')
  })
})
