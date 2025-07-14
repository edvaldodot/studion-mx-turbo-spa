import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Link from './Link.vue';

describe('Link.vue', () => {
  const routerLinkStub = {
    name: 'RouterLink',
    template: '<a><slot /></a>',
    props: ['to'],
  };

  it('renders slot content', () => {
    const wrapper = mount(Link, {
      props: { to: '/home' },
      slots: { default: 'Go Home' },
      global: {
        stubs: { RouterLink: routerLinkStub }
      }
    });
    expect(wrapper.text()).toContain('Go Home');
  });

  it('applies the correct severity class', () => {
    const wrapper = mount(Link, {
      props: { to: '/about', severity: 'secondary' },
      global: {
        stubs: { RouterLink: routerLinkStub }
      }
    });
    expect(wrapper.classes()).toContain('link');
    expect(wrapper.classes()).toContain('--secondary');
  });

  it('passes the "to" prop to RouterLink', () => {
    const wrapper = mount(Link, {
      props: { to: '/dashboard' },
      global: {
        stubs: { RouterLink: routerLinkStub }
      }
    });

    const routerLink = wrapper.findComponent({ name: 'RouterLink' });
    expect(routerLink.exists()).toBe(true);
    expect(routerLink.props('to')).toBe('/dashboard');
  });
});
