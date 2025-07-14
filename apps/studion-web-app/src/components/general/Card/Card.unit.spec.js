import { shallowMount } from '@vue/test-utils'
import Card from './'

const mountComponent = (options = {}) => {
  return shallowMount(Card, {
    ...options,
  })
}

describe('Card', () => {
  it('should render default slot', () => {
    const wrapper = mountComponent({ slots: { default: '<p>Testando</p>' }})
    expect(wrapper.find('p').exists()).toBe(true)
  })

  it('should render horizontal layout', () => {
    const wrapper = mountComponent({
      propsData: {
        horizontal: true,
      },
    })

    const card = wrapper.find('div > div')

    expect(card.classes()).toContain('--horizontal')
  })

  it('should render in dark mode', () => {
    const wrapper = mountComponent({
      propsData: {
        dark: true,
      },
    })

    const card = wrapper.find('div > div')

    expect(card.classes()).toContain('--dark')
  })

  it('should render in vertical layout', () => {
    const wrapper = mountComponent({
      propsData: {
        horizontal: false,
      },
    })

    expect(wrapper.classes('--horizontal')).toBeFalsy()
  })
})
