import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Breadcrumbs from './Breadcrumbs.vue';

const mockBreadcrumbs = [
  { key: 'home', text: 'Início', path: 'homeValue' },
  { key: 'section', text: 'Seção', path: 'sectionValue' },
  { key: 'page', text: 'Página Atual', path: 'pageValue' },
];

describe('Breadcrumbs.vue', () => {
  it('renderiza os itens de breadcrumb corretamente', () => {
    const wrapper = mount(Breadcrumbs, {
      props: {
        breadcrumbsList: mockBreadcrumbs,
        clickable: false,
        highlightCurrent: true,
      },
    });

    expect(wrapper.text()).toContain('Início');
    expect(wrapper.text()).toContain('Seção');
    expect(wrapper.text()).toContain('Página Atual');

    const lastItem = wrapper.findAll('.breadcrumbs__item').at(-1);
    expect(lastItem?.classes()).toContain('--highlight');
  });

  it('emite evento click quando clicar em item clicável', async () => {
    const wrapper = mount(Breadcrumbs, {
      props: {
        breadcrumbsList: mockBreadcrumbs,
        clickable: true,
      },
    });

    const buttons = wrapper.findAllComponents({ name: 'Action' });
    expect(buttons.length).toBe(mockBreadcrumbs.length - 1);

    await buttons[0].trigger('click');

    expect(wrapper.emitted('click')).toBeTruthy();
    expect(wrapper.emitted('click')![0]).toEqual(['homeValue']);

  });

  it('renderiza ícones corretamente', () => {
    const wrapper = mount(Breadcrumbs, {
      props: { breadcrumbsList: mockBreadcrumbs },
    });

    const icons = wrapper.findAllComponents({ name: 'Icon' });
    expect(icons.length).toBeGreaterThan(0);
  });
});
