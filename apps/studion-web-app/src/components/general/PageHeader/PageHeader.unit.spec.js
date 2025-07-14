import { shallowMount } from '@vue/test-utils'
import PageHeader from './PageHeader.vue'

describe('PageHeader.vue', () => {
  it('renders slots correctly', () => {
    const wrapper = shallowMount(PageHeader, {
      slots: {
        indicator: '<div class="test-indicator">Indicator Content</div>',
        section: '<div class="test-section">Section Content</div>',
        description: '<div class="test-description">Description Content</div>',
        actions: '<div class="test-actions">Actions Content</div>',
      },
    })

    expect(wrapper.find('.test-indicator').exists()).toBe(true)
    expect(wrapper.find('.test-indicator').text()).toBe('Indicator Content')

    expect(wrapper.find('.test-section').exists()).toBe(true)
    expect(wrapper.find('.test-section').text()).toBe('Section Content')

    expect(wrapper.find('.test-description').exists()).toBe(true)
    expect(wrapper.find('.test-description').text()).toBe('Description Content')

    expect(wrapper.find('.test-actions').exists()).toBe(true)
    expect(wrapper.find('.test-actions').text()).toBe('Actions Content')
  })

  it('matches the snapshot', () => {
    const wrapper = shallowMount(PageHeader, {
      slots: {
        indicator: '<div>Indicator Content</div>',
        section: '<div>Section Content</div>',
        description: '<div>Description Content</div>',
        actions: '<div>Actions Content</div>',
      },
    })

    expect(wrapper.html()).toMatchSnapshot()
  })
})

