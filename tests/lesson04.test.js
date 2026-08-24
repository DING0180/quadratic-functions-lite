// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { LESSON04_STEP_TITLES, renderLesson04 } from "../src/lessons/lesson04.js";

afterEach(() => {
  vi.useRealTimers();
});

describe("Lesson 04 horizontal-shift migration", () => {
  it("uses one shared discovery page before exploration, properties and the quick check", () => {
    expect(LESSON04_STEP_TITLES).toEqual([
      "描点、连线与观察",
      "探索：y=(x-k)²",
      "性质复习：y=(x-1)²",
      "Quick Check",
    ]);
  });

  it("exposes the workbench as a focusable independent scrolling region", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson04(stage, { step: 1, onStepChange() {} });
    const workbench = stage.querySelector(".lesson04-workbench");

    expect(workbench.tabIndex).toBe(0);
    expect(workbench.getAttribute("aria-label")).toBe("Lesson 4 工作台，可独立滚动");
    lesson.destroy();
  });

  it("plots a blue and red point together for each shared x-value", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson04(stage, { step: 1, onStepChange() {} });

    stage.querySelector("[data-lesson04-generate-pair]").click();

    const points = stage.querySelectorAll(".parabola-point");
    expect(points).toHaveLength(2);
    expect(points[0].style.fill).toBe("rgb(37, 99, 235)");
    expect(points[1].style.fill).toBe("rgb(220, 64, 85)");
    expect(stage.querySelector("[data-lesson04-point-table]").textContent).toContain("(-4, 16)");
    expect(stage.querySelector("[data-lesson04-point-table]").textContent).toContain("(-4, 25)");
    lesson.destroy();
  });

  it("turns the shared point workbench into an observation mode after connection", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson04(stage, { step: 1, onStepChange() {} });
    const generate = stage.querySelector("[data-lesson04-generate-pair]");
    const connect = stage.querySelector("[data-lesson04-connect-pairs]");

    for (let index = 0; index < 8; index += 1) generate.click();
    expect(stage.querySelectorAll(".parabola-point")).toHaveLength(16);
    expect(connect.disabled).toBe(true);
    expect(stage.querySelectorAll(".parabola-curve")).toHaveLength(0);

    generate.click();
    expect(connect.disabled).toBe(false);
    connect.click();
    expect(stage.querySelectorAll(".parabola-point")).toHaveLength(18);
    expect(stage.querySelectorAll(".parabola-curve")).toHaveLength(2);
    expect(stage.querySelector("[data-lesson04-point-work]").hidden).toBe(true);
    expect(stage.querySelector("[data-lesson04-observation]").hidden).toBe(false);
    lesson.destroy();
  });

  it("moves the red curve left and right when k changes", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson04(stage, { step: 2, onStepChange() {} });
    const slider = stage.querySelector('[data-lesson04-slider="k"]');

    slider.value = "-2";
    slider.dispatchEvent(new Event("input", { bubbles: true }));

    expect(stage.querySelector("[data-lesson04-shift-readout]").textContent).toContain("向左平移 2 个单位");
    expect(stage.querySelectorAll(".parabola-curve")).toHaveLength(2);
    lesson.destroy();
  });

  it("expands the k exploration viewport around the shifted curve", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson04(stage, { step: 2, onStepChange() {} });
    const slider = stage.querySelector('[data-lesson04-slider="k"]');
    const initialTicks = Array.from(stage.querySelectorAll(".parabola-tick-y"), (tick) => tick.textContent);

    expect(initialTicks).not.toContain("68");
    slider.value = "3";
    slider.dispatchEvent(new Event("input", { bubbles: true }));
    expect(Array.from(stage.querySelectorAll(".parabola-tick:not(.parabola-tick-y)"), (tick) => tick.textContent)).toContain("7");
    expect(Array.from(stage.querySelectorAll(".parabola-tick-y"), (tick) => tick.textContent)).toContain("56");
    slider.value = "-3";
    slider.dispatchEvent(new Event("input", { bubbles: true }));
    expect(Array.from(stage.querySelectorAll(".parabola-tick:not(.parabola-tick-y)"), (tick) => tick.textContent)).toContain("-7");
    lesson.destroy();
  });

  it("reviews the vertex, axis and monotonicity of y=(x-1)² before checking", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson04(stage, { step: 3, onStepChange() {} });
    const properties = stage.querySelector("[data-lesson04-properties-table]");

    expect(properties.textContent).toContain("(1, 0)");
    expect(properties.textContent).toContain("x=1");
    expect(properties.textContent).toContain("x<1 时递减");
    expect(properties.textContent).toContain("x>1 时递增");
    expect(stage.querySelectorAll(".parabola-symmetry-axis")).toHaveLength(1);
    lesson.destroy();
  });

  it("checks a random y=a(x-h)² answer set and shows per-field feedback", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson04(stage, { step: 4, onStepChange() {}, random: () => 0 });

    expect(stage.textContent).toContain("y=(x+3)^2");
    stage.querySelector('[data-lesson04-answer="direction"][value="向左"]').checked = true;
    stage.querySelector('[data-lesson04-answer="units"]').value = "3";
    stage.querySelector('[data-lesson04-answer="axis"]').value = "x=-3";
    stage.querySelector('[data-lesson04-answer="vertex"]').value = "(-3, 0)";
    stage.querySelector('[data-lesson04-answer="monotonicity"][value="upward"]').checked = true;
    stage.querySelector("[data-lesson04-check]").click();

    expect(stage.querySelector("[data-lesson04-feedback]").textContent).toContain("5 / 5 项正确");
    lesson.destroy();
  });
});

