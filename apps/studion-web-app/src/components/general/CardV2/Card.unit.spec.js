import { shallowMount } from '@vue/test-utils'
import Button from '../Button.vue'
import Icon from '../Icon.vue'

describe('Button.vue', () => {
  it('renders the default slot content', () => {
    const wrapper = shallowMount(Button, {
      slots: {
        default: 'Click Me',
      },
    })

    expect(wrapper.text()).toBe('Click Me')
  })

  it('applies the correct variant class', () => {
    const wrapper = shallowMount(Button, {
      props: {
        variant: 'outline',
      },
    })

    expect(wrapper.classes()).toContain('button--outline')
  })

  it('applies the correct severity class', () => {
    const wrapper = shallowMount(Button, {
      props: {
        severity: 'secondary',
      },
    })

    expect(wrapper.classes()).toContain('button--secondary')
  })

  it('renders the prepend icon when "innerPrependIcon" is provided', () => {
    const wrapper = shallowMount(Button, {
      props: {
        innerPrependIcon: 'home',
      },
      global: {
        components: {
          Icon,
        },
      },
    })

    const prependIcon = wrapper.findComponent(Icon)
    expect(prependIcon.exists()).toBe(true)
    expect(prependIcon.props('name')).toBe('home')
  })

  it('renders the append icon when "innerAppendIcon" is provided', () => {
    const wrapper = shallowMount(Button, {
      props: {
        innerAppendIcon: 'settings',
      },
      global: {
        components: {
          Icon,
        },
      },
    })

    const appendIcon = wrapper.findComponent(Icon)
    expect(appendIcon.exists()).toBe(true)
    expect(appendIcon.props('name')).toBe('settings')
  })

  it('renders the icon when the variant is "icon"', () => {
    const wrapper = shallowMount(Button, {
      props: {
        variant: 'icon',
        icon: 'menu',
      },
      global: {
        components: {
          Icon,
        },
      },
    })

    const icon = wrapper.findComponent(Icon)
    expect(icon.exists()).toBe(true)
    expect(icon.props('name')).toBe('menu')
  })

  it('matches the snapshot', () => {
    const wrapper = shallowMount(Button, {
      props: {
        variant: 'default',
        severity: 'primary',
      },
      slots: {
        default: 'Click Me',
      },
    })

    expect(wrapper.html()).toMatchSnapshot()
  })
})
