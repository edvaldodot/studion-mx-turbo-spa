import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Icon from './Icon.vue'

describe('Icon.vue', () => {
  it('renderiza ícone padrão sem wrapper', () => {
    const wrapper = mount(Icon, {
      props: {
        name: 'check'
      }
    })
    expect(wrapper.find('svg.icon').exists()).toBe(true)
    expect(wrapper.find('use').attributes('href')).toBe('#icon-check')
  })

  it('renderiza ícone padrão com wrapper', () => {
    const wrapper = mount(Icon, {
      props: {
        name: 'check',
        wrapper: true,
        size: 'large'
      }
    })
    expect(wrapper.find('.icon-wrapper').exists()).toBe(true)
    expect(wrapper.find('.icon-wrapper').classes()).toContain('is-large')
  })

  it('emite evento de clique no wrapper', async () => {
    const wrapper = mount(Icon, {
      props: {
        name: 'check',
        wrapper: true
      }
    })
    await wrapper.find('.icon-wrapper').trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('emite evento de clique no svg direto', async () => {
    const wrapper = mount(Icon, {
      props: {
        name: 'check'
      }
    })
    await wrapper.find('svg').trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('renderiza ícone material com estilo outlined (padrão)', () => {
    const wrapper = mount(Icon, {
      props: {
        name: 'home',
        pack: 'material'
      }
    })
    expect(wrapper.find('i').text()).toBe('home')
    expect(wrapper.find('i').classes()).toContain('material-symbols-outlined')
  })

  it('renderiza com styleIcon "rounded"', () => {
    const wrapper = mount(Icon, {
      props: {
        name: 'home',
        pack: 'material',
        styleIcon: 'rounded'
      }
    })
    expect(wrapper.find('i').classes()).toContain('material-symbols-rounded')
  })

  it('renderiza com styleIcon "sharp"', () => {
    const wrapper = mount(Icon, {
      props: {
        name: 'home',
        pack: 'material',
        styleIcon: 'sharp'
      }
    })
    expect(wrapper.find('i').classes()).toContain('material-symbols-sharp')
  })

  it('retorna a classe correta com size "medium"', () => {
    const wrapper = mount(Icon, {
      props: {
        name: 'check',
        wrapper: true,
        size: 'medium'
      }
    })
    expect(wrapper.find('.icon-wrapper').classes()).toContain('is-medium')
  })

  it('retorna a classe correta com size "small"', () => {
    const wrapper = mount(Icon, {
      props: {
        name: 'check',
        wrapper: true,
        size: 'small'
      }
    })
    expect(wrapper.find('.icon-wrapper').classes()).toContain('is-small')
  })

  it('não aplica classe de tamanho quando size não é especificado', () => {
    const wrapper = mount(Icon, {
      props: {
        name: 'check',
        wrapper: true
      }
    })
    const classes = wrapper.find('.icon-wrapper').classes()
    expect(classes).not.toContain('is-small')
    expect(classes).not.toContain('is-medium')
    expect(classes).not.toContain('is-large')
  })
})
