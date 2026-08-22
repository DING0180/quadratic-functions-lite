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
    stage.querySelector("[data-lesson05-check-property]").click();
    expect(stage.querySelector("[data-lesson05-property-graph]").hidden).toBe(false);
    lesson.destroy();
  });
});
