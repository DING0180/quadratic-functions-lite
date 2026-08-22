// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { renderLesson03, LESSON03_STEP_TITLES } from "../src/lessons/lesson03.js";

describe("Lesson 03 y=ax²+k migration", () => {
  it("preserves the legacy ten-step teaching sequence", () => {
    expect(LESSON03_STEP_TITLES).toEqual([
      "从 y=ax² 到 y=x²+1",
      "同 x 描点：每个 y 都 +1",
      "从九个点到整体上移",
      "推广：k 控制上下平移",
      "变化与不变",
      "顶点、增减性与最值",
      "典型例题与变式",
      "a-k Double Parameter Lab",
      "核心结论",
      "向左右平移的追问",
    ]);
  });

  it("lets students plot matching x-values before connecting the shifted curve", () => {
    const stage = document.createElement("main");
    const changes = [];
    const lesson = renderLesson03(stage, { step: 2, onStepChange: (next) => changes.push(next) });

    stage.querySelector('[data-lesson03-point="0"]').click();
    expect(stage.textContent).toContain("(0, 0)");
    expect(stage.textContent).toContain("(0, 1)");
    expect(stage.querySelector(".lesson03-connect").disabled).toBe(true);

    [-4, -3, -2, -1, 1, 2, 3, 4].forEach((x) => stage.querySelector(`[data-lesson03-point="${x}"]`).click());
    expect(stage.querySelector(".lesson03-connect").disabled).toBe(false);

    stage.querySelector(".lesson03-connect").click();
    expect(changes).toEqual([]);
    expect(stage.querySelector(".lesson03-question").hidden).toBe(false);
    lesson.destroy();
  });

  it("reveals the k conclusion only after students change the parameter", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson03(stage, { step: 4, onStepChange() {} });
    const slider = stage.querySelector('[data-lesson03-slider="k"]');
    const conclusion = stage.querySelector(".lesson03-rule");

    expect(conclusion.hidden).toBe(true);

    slider.value = "-2";
    slider.dispatchEvent(new Event("input", { bubbles: true }));

    expect(stage.textContent).toContain("当前顶点：(0, -2)");
    expect(conclusion.hidden).toBe(false);
    lesson.destroy();
  });

  it("keeps the a-k lab study modes and a previous-graph comparison", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson03(stage, { step: 8, onStepChange() {} });
    const aSlider = stage.querySelector('[data-lesson03-slider="a"]');
    const kSlider = stage.querySelector('[data-lesson03-slider="k"]');

    expect(stage.querySelector('[data-lesson03-mode="free"]').getAttribute("aria-pressed")).toBe("true");
    stage.querySelector('[data-lesson03-mode="study-k"]').click();
    expect(aSlider.disabled).toBe(true);
    expect(kSlider.disabled).toBe(false);

    stage.querySelector('[data-lesson03-keep]').click();
    kSlider.value = "2";
    kSlider.dispatchEvent(new Event("input", { bubbles: true }));
    expect(stage.querySelectorAll(".parabola-curve")).toHaveLength(2);
    lesson.destroy();
  });
});
