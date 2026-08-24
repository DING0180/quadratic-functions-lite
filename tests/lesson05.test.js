// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { LESSON05_STEP_TITLES, renderLesson05 } from "../src/lessons/lesson05.js";

afterEach(() => {
  document.body.replaceChildren();
});

function setRange(input, value) {
  input.value = String(value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

describe("Lesson 05 vertex-form integration", () => {
  it("keeps the requested compact six-step classroom flow", () => {
    expect(LESSON05_STEP_TITLES).toEqual([
      "Bridge In：三个参数，一条抛物线",
      "Parabola Control Lab",
      "性质整合",
      "Shift It：随机平移挑战",
      "Read the Parabola：随机性质挑战",
      "Summary + Bridge Out",
    ]);
  });

  it("puts the two bridge formulas on separate rows and reveals the a, h, k roles only after students answer", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson05(stage, { step: 1, onStepChange() {} });

    expect(stage.querySelectorAll("[data-lesson05-bridge-formula]")).toHaveLength(2);
    expect(stage.querySelector('[data-lesson05-bridge-answer="a"]')).not.toBeNull();
    expect(stage.querySelector("[data-lesson05-bridge-reveal]").hidden).toBe(true);
    stage.querySelector('[data-lesson05-bridge-answer="a"]').value = "shape";
    stage.querySelector('[data-lesson05-bridge-answer="h"]').value = "horizontal";
    stage.querySelector('[data-lesson05-bridge-answer="k"]').value = "vertical";
    stage.querySelector("[data-lesson05-reveal-bridge]").click();

    expect(stage.querySelector("[data-lesson05-bridge-reveal]").hidden).toBe(false);
    expect(stage.querySelector("[data-lesson05-bridge-reveal]").textContent).toContain("a 控制形状");
    lesson.destroy();
  });

  it("writes live parameter values, the new vertex form, vertex and axis after a drag", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson05(stage, { step: 2, onStepChange() {} });
    setRange(stage.querySelector('[data-lesson05-parameter="h"] input'), 3);
    setRange(stage.querySelector('[data-lesson05-parameter="k"] input'), -2);

    expect(stage.querySelector('[data-lesson05-value="h"]').textContent).toBe("3");
    expect(stage.querySelector('[data-lesson05-value="k"]').textContent).toBe("-2");
    expect(stage.querySelector("[data-lesson05-function]").getAttribute("aria-label")).toBe("y=(x-3)²-2");
    expect(stage.querySelector("[data-lesson05-vertex]").textContent).toContain("(3, -2)");
    expect(stage.querySelector("[data-lesson05-axis]").textContent).toContain("x=3");
    lesson.destroy();
  });

  it("locks the other sliders in Study h and gives the a=0 non-quadratic notice", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson05(stage, { step: 2, onStepChange() {} });
    stage.querySelector('[data-lesson05-mode="h"]').click();
    expect(stage.querySelector('[data-lesson05-parameter="a"] input').disabled).toBe(true);
    expect(stage.querySelector('[data-lesson05-parameter="k"] input').disabled).toBe(true);
    stage.querySelector('[data-lesson05-mode="free"]').click();
    setRange(stage.querySelector('[data-lesson05-parameter="a"] input'), 0);
    expect(stage.querySelector("[data-lesson05-warning]").hidden).toBe(false);
    expect(stage.querySelector("[data-lesson05-function]").getAttribute("aria-label")).toBe("y=0");
    lesson.destroy();
  });

  it("hides the two random challenge answers until their validation controls are used", () => {
    const stage = document.createElement("main");
    let lesson = renderLesson05(stage, { step: 4, onStepChange() {}, random: () => 0.6 });
    expect(stage.querySelector("[data-lesson05-shift-answer]").hidden).toBe(true);
    stage.querySelector("[data-lesson05-reveal-shift]").click();
    expect(stage.querySelector("[data-lesson05-shift-answer]").hidden).toBe(false);
    lesson.destroy();

    lesson = renderLesson05(stage, { step: 5, onStepChange() {}, random: () => 0.2 });
    expect(stage.querySelector("[data-lesson05-property-graph]").hidden).toBe(true);
    expect(stage.querySelector('[data-lesson05-property-answer="opening"]')).not.toBeNull();
    lesson.destroy();
  });

  it("lets students reveal the random property answer and graph before completing every response", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson05(stage, { step: 5, onStepChange() {}, random: () => 0 });
    const graph = stage.querySelector("[data-lesson05-property-graph]");
    const check = stage.querySelector("[data-lesson05-check-property]");

    check.click();
    expect(graph.hidden).toBe(false);
    expect(stage.querySelector("[data-lesson05-property-feedback]").textContent).toContain("正确答案");

    const answer = (key, value) => {
      const input = stage.querySelector('[data-lesson05-property-answer="' + key + '"]');
      input.value = value;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    };
    answer("opening", "up");
    answer("axis", "-3");
    answer("vertex-x", "-3");
    answer("vertex-y", "-3");
    answer("horizontal-direction", "left");
    answer("horizontal-distance", "3");
    answer("vertical-direction", "down");
    answer("vertical-distance", "3");
    check.click();

    expect(stage.querySelector("[data-lesson05-property-graph]").hidden).toBe(false);
    expect(stage.querySelector("[data-lesson05-property-feedback]").textContent).toContain("y=2x²");
    expect(stage.querySelector("[data-lesson05-property-feedback]").textContent).toContain("全部正确");
    lesson.destroy();
  });

  it("uses a Lesson 4-style base-versus-target comparison before revealing step-three properties", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson05(stage, { step: 3, onStepChange() {} });
    const firstProperty = stage.querySelector("[data-lesson05-property-row=\"vertex\"]");
    const motionStatus = stage.querySelector("[data-lesson05-property-motion-status]");

    expect(stage.querySelector("[data-lesson05-property-graph]")).not.toBeNull();
    expect(stage.querySelector("[data-lesson05-property-table]")).not.toBeNull();
    expect(stage.querySelector("[data-lesson05-property-base]")).not.toBeNull();
    expect(stage.querySelector("[data-lesson05-property-target]")).not.toBeNull();
    expect(firstProperty.textContent).toContain("？");
    stage.querySelector("[data-lesson05-property-motion]").click();
    expect(motionStatus.textContent).toContain("左侧");
    stage.querySelector("[data-lesson05-reveal-properties]").click();
    expect(firstProperty.textContent).toContain("(1, 2)");
    lesson.destroy();
  });
});

