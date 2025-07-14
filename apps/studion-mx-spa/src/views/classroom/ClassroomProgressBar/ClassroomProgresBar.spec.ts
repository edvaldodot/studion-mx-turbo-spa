import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ClassroomProgressBar from "./ClassroomProgressBar.vue";

describe("ClassroomProgressBar", () => {
  it("exibe progresso correto com blocks completos e totais", () => {
    const components = [
      { type: "block", finished: true },
      { type: "block", finished: false },
      { type: "block", finished: true },
      { type: "organizer", finished: true },
    ];

    const wrapper = mount(ClassroomProgressBar, {
      props: { components },
    });

    expect(wrapper.find(".progress-step").text()).toBe("(2/3)");

    const progressFill = wrapper.find(".progress-fill");
    expect(progressFill.attributes("style")).toContain("width: 66.66666666666666%");
  });

  it("exibe progresso zero quando não há blocks", () => {
    const components = [
      { type: "organizer", finished: true },
      { type: "organizer", finished: false },
    ];

    const wrapper = mount(ClassroomProgressBar, {
      props: { components },
    });

    expect(wrapper.find(".progress-step").text()).toBe("(0/0)");
    expect(wrapper.find(".progress-fill").attributes("style")).toContain("width: 0%");
  });

  it("exibe progresso 100% quando todos os blocks estão completos", () => {
    const components = [
      { type: "block", finished: true },
      { type: "block", finished: true },
    ];

    const wrapper = mount(ClassroomProgressBar, {
      props: { components },
    });

    expect(wrapper.find(".progress-step").text()).toBe("(2/2)");
    expect(wrapper.find(".progress-fill").attributes("style")).toContain("width: 100%");
  });
});
