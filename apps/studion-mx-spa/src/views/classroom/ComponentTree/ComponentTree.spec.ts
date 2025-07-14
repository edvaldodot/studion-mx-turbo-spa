import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ComponentTree from './ComponentTree.vue';

const mockComponents = [
  {
    id: 1,
    type: 'block',
    name: 'Módulo 1',
    children: [
      { id: 2, type: 'video', name: 'Aula 1', children: [] },
      { id: 3, type: 'pdf', name: 'PDF 1', children: [] },
      {
        id: 4,
        type: 'block',
        name: 'Módulo Interno',
        children: [
          { id: 5, type: 'video', name: 'Aula Interna', children: [] }
        ],
      },
    ],
  },
];

describe('ComponentTree.vue', () => {
  it('renderiza os componentes corretamente', async () => {
    const wrapper = mount(ComponentTree, {
      props: { components: mockComponents },
    });

    await nextTick();

    expect(wrapper.text()).toContain('Módulo 1');
    expect(wrapper.text()).toContain('Aula 1');
    expect(wrapper.text()).toContain('PDF 1');
    expect(wrapper.text()).toContain('Módulo Interno');
  });

  it('expande e recolhe blocos ao clicar', async () => {
    const wrapper = mount(ComponentTree, {
      props: { components: mockComponents },
    });

    await nextTick();

    const toggleButton = wrapper.find('button');
    await toggleButton.trigger('click'); // recolhe
    await nextTick();
    expect(wrapper.text()).not.toContain('Aula 1');

    await toggleButton.trigger('click'); // expande
    await nextTick();
    expect(wrapper.text()).toContain('Aula 1');
  });

  it('renderiza ícones corretamente', async () => {
    const wrapper = mount(ComponentTree, {
      props: { components: mockComponents },
    });

    await nextTick();

    const icons = wrapper.findAllComponents({ name: 'Icon' });
    expect(icons.length).toBeGreaterThan(0);
  });

  it('renderiza ProgressCircle para cada item', async () => {
    const wrapper = mount(ComponentTree, {
      props: { components: mockComponents },
    });

    await nextTick();

    const circles = wrapper.findAllComponents({ name: 'ProgressCircle' });
    expect(circles.length).toBe(5);
  });
});
