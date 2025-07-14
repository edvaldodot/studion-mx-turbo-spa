import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ClassroomSidebar from '@/views/classroom/ClassroomSideBar';

import type { Classroom } from '@/types/classroom';

describe('ClassroomSidebar', () => {

  const mockJourneyData = {
    id: 1,
    uuid: 'abc-123',
    name: 'Jornada React',
    description: 'Uma jornada sobre React',
    workloadType: 'horas',
    workloadValue: 40,
    image: 'https://example.com/jornada.png',
    components: [
      {
        id: 1,
        uuid: 'comp-uuid-1',
        name: 'Bloco 1',
        description: 'Descrição do bloco',
        type: 'block',
        group: 'organizers',
        status: 'active',
        topic: null,
        position: 1,
        level: 1, // corrigido aqui
        certificate: null,
        certificateType: 0,
        children: [],
        consumption: {
          uuid: 'consump-uuid-1',
          type: 'duration',
          value: 0,
          progress: 0,
          status: 'not-started',
        },
        prerequisite: [],
      },
    ],
  };

  const mockClassroomData: Classroom = {
    session: {
      id: 1,
      uuid: 'uuid-sessao',
      name: 'Turma Teste',
      team: [],
    },
    profile: {
      enrollmentId: '123',
      profile: 'Aluno Teste',
    },
    journey: {
      id: 10,
      uuid: 'uuid-jornada',
      name: 'Jornada React',
      description: 'Descrição',
      workloadType: 'horas',
      workloadValue: 40,
      image: 'https://exemplo.com/jornada.png',
    },
  };

  it('renderiza a imagem da jornada corretamente', () => {
    const wrapper = mount(ClassroomSidebar, {
      props: {
        journeyData: mockJourneyData,
        classroomData: mockClassroomData,
      },
    });

    const img = wrapper.find('img.journey-image');
    expect(img.exists()).toBe(true);
    expect(img.attributes('src')).toBe(mockClassroomData.journey.image);
  });

  it('renderiza o ClassroomProgressBar com os componentes corretos', () => {
    const wrapper = mount(ClassroomSidebar, {
      props: {
        journeyData: mockJourneyData,
        classroomData: mockClassroomData,
      },
      global: {
        stubs: ['ClassroomProgressBar'],
      },
    });

    const progress = wrapper.findComponent({ name: 'ClassroomProgressBar' });
    expect(progress.exists()).toBe(true);
  });

  it('renderiza o ComponentTree com os componentes corretos', () => {
    const wrapper = mount(ClassroomSidebar, {
      props: {
        journeyData: mockJourneyData,
        classroomData: mockClassroomData,
      },
      global: {
        stubs: ['ComponentTree'],
      },
    });

    const tree = wrapper.findComponent({ name: 'ComponentTree' });
    expect(tree.exists()).toBe(true);
  });

  it('não renderiza imagem, progress bar e tree se journeyData.components estiver vazio', () => {
    const wrapper = mount(ClassroomSidebar, {
      props: {
        journeyData: {
          ...mockJourneyData,
          components: [],
        },
        classroomData: mockClassroomData,
      },
    });

    expect(wrapper.find('img.journey-image').exists()).toBe(false);
    expect(wrapper.findComponent({ name: 'ClassroomProgressBar' }).exists()).toBe(false);
    expect(wrapper.findComponent({ name: 'ComponentTree' }).exists()).toBe(false);
  });
});
