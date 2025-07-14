import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ClassroomInfo from "./ClassroomInfo.vue";
import type { Classroom, Profile, Journey, Session, JourneyWithComponents } from '@/types';

// Mocks completos conforme os tipos esperados
const sessionMock: Session = {
  id: 1,
  uuid: "session-uuid",
  name: "Turma A",
  team: [],
};

const journeyMock: Journey = {
  id: 10,
  uuid: "journey-uuid",
  name: "Jornada React",
  description: "",
  workloadType: "teórico",
  workloadValue: 40,
  image: "",
};

const profileMock: Profile = {
  enrollmentId: '123',
  profile: 'Teste',
};

const journeyData: JourneyWithComponents = {
  id: 1,
  uuid: 'fake-uuid-123',
  name: 'Jornada React',
  description: 'Descrição de exemplo da jornada',
  workloadType: 'horas',
  workloadValue: 40,
  image: 'https://via.placeholder.com/150',

  journeyId: 1,
  journeyName: 'Jornada React',
  components: [],
  workload: {
    value: 40,
    type: 'horas'
  },
};

const classroomData: Classroom = {
  session: {
    id: 1,
    uuid: 'session-uuid',
    name: 'Turma A',
    team: [],
  },
  journey: {
    id: 1,
    uuid: 'journey-uuid',
    name: 'Jornada React',
    description: 'Descrição',
    workloadType: 'horas',
    workloadValue: 40,
    image: '',
  },
  profile: {
    enrollmentId: '123',
    profile: 'Aluno Teste',
  },
};

const defaultProps = {
  status: "active",
  classroomData,
  journeyData,
};

describe("ClassroomInfo", () => {
  it("renderiza o StatusTag com o status correto", () => {
    const wrapper = mount(ClassroomInfo, {
      props: defaultProps,
      global: {
        stubs: ["StatusTag"],
      },
    });
    const statusTag = wrapper.findComponent({ name: "StatusTag" });
    expect(statusTag.exists()).toBe(true);
  });

  it("renderiza o nome da turma", () => {
    const wrapper = mount(ClassroomInfo, {
      props: defaultProps,
    });
    expect(wrapper.find(".classroom-session-name").text()).toContain("Turma:");
    expect(wrapper.find(".classroom-session-name").text()).toContain("Turma A");
  });

  it("renderiza o nome da jornada", () => {
    const wrapper = mount(ClassroomInfo, {
      props: defaultProps,
    });
    expect(wrapper.find(".classroom-journey-name").text()).toBe("Jornada React");
  });

  it("não renderiza o nome da turma se classroomData não for passado", () => {
    const wrapper = mount(ClassroomInfo, {
      props: {
        ...defaultProps,
        classroomData: {
          ...classroomData,
          session: {
            ...sessionMock,
            name: "",
          },
        },
      },
    });
    expect(wrapper.find(".classroom-session-name").exists()).toBe(false);
  });

  it("não renderiza o nome da jornada se journeyData não for passado", () => {
    const wrapper = mount(ClassroomInfo, {
      props: {
        ...defaultProps,
        journeyData: {
          ...journeyData,
          journeyName: "",
        },
      },
    });
    expect(wrapper.find(".classroom-journey-name").exists()).toBe(false);
  });
});
