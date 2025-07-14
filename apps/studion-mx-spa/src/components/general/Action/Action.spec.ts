import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import Action from './Action.vue'
import { router } from '../../../../tests/setupTest'

describe('Action.vue', () => {
  it('renderiza como botão por padrão', () => {
    const wrapper = mount(Action, {
      props: {
        type: 'button',
        text: 'Clique aqui',
      },
    })
    expect(wrapper.find('button').exists()).toBe(true)
    expect(wrapper.text()).toContain('Clique aqui')
  })

  it('renderiza como link externo', () => {
    const wrapper = mount(Action, {
      props: {
        type: 'link',
        url: 'https://example.com',
        text: 'Link externo',
      },
    })
    const link = wrapper.find('a')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe('https://example.com')
    expect(link.text()).toContain('Link externo')
  })

  it('renderiza como RouterLink', async () => {
    const wrapper = mount(Action, {
      props: {
        type: 'router',
        url: { name: 'home' },
        text: 'Home',
      },
      global: {
        plugins: [router],
      },
    })

    await router.isReady()

    const routerLink = wrapper.find('a')
    expect(routerLink.exists()).toBe(true)
    expect(wrapper.text()).toContain('Home')
  })

  it('emite evento de click quando clicado', async () => {
    const wrapper = mount(Action, {
      props: {
        type: 'button',
        text: 'Clique',
      },
    })

    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('não emite click se estiver desabilitado', async () => {
    const wrapper = mount(Action, {
      props: {
        type: 'button',
        text: 'Desabilitado',
        disabled: true,
      },
    })

    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it('aplica classes de tipo corretamente', () => {
    const wrapper = mount(Action, {
      props: {
        type: 'button',
        text: 'Primário',
        primary: true,
      },
    })

    expect(wrapper.classes()).toContain('btn-primary')
  })

  it('aplica classes de tamanho corretamente', () => {
    const wrapper = mount(Action, {
      props: {
        type: 'button',
        text: 'Grande',
        large: true,
      },
    })

    expect(wrapper.classes()).toContain('is-large')
  })

  it('renderiza ícone à esquerda', () => {
    const wrapper = mount(Action, {
      props: {
        type: 'button',
        icon: 'check',
      },
    })

    expect(wrapper.findComponent({ name: 'Icon' }).exists()).toBe(true)
  })

  it('renderiza badge de notificação', () => {
    const wrapper = mount(Action, {
      props: {
        type: 'button',
        text: 'Notificar',
        notifyNumber: 5,
      },
    })

    const badge = wrapper.find('.number')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toBe('5')
  })

  it('badge fica maior se notifyNumber > 99', () => {
    const wrapper = mount(Action, {
      props: {
        type: 'button',
        notifyNumber: 120,
      },
    })

    const badge = wrapper.find('.number')
    expect(badge.exists()).toBe(true)
    expect(badge.classes()).toContain('is-larger')
  })

  it("impede navegação se for link com URL dummy '#'", async () => {
    const wrapper = mount(Action, {
      props: {
        type: "link",
        url: "#",
      },
    });

    const preventDefault = vi.fn();
    await wrapper.find("a").trigger("click", { preventDefault });
    expect(preventDefault).toHaveBeenCalled();
  });

  it("formata url sem http como http://url", () => {
    const wrapper = mount(Action, {
      props: {
        type: "link",
        url: "exemplo.com",
      },
    });

    const anchor = wrapper.find("a");
    expect(anchor.attributes("href")).toBe("http://exemplo.com");
  });

  it("mantém url com https", () => {
    const wrapper = mount(Action, {
      props: {
        type: "link",
        url: "https://secure.com",
      },
    });

    const anchor = wrapper.find("a");
    expect(anchor.attributes("href")).toBe("https://secure.com");
  });

  it("badge não aplica classe is-larger se notifyNumber <= 99", () => {
    const wrapper = mount(Action, {
      props: {
        type: "button",
        notifyNumber: 10,
      },
    });

    const badge = wrapper.find(".number");
    expect(badge.exists()).toBe(true);
    expect(badge.classes()).not.toContain("is-larger");
  });

})
