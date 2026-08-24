// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { LESSON06_STEP_TITLES, renderLesson06, vertexFromGeneral } from "../src/lessons/lesson06.js";

afterEach(() => {
  document.body.replaceChildren();
});

describe("Lesson 06 general-form to vertex-form classroom", () => {
  it("keeps the requested six-step knowledge-first flow", () => {
    expect(LESSON06_STEP_TITLES).toEqual([
      "Bridge In：两种形式",
      "教师示范：配方法",
      "快问快答：自己配方",
      "从一般式读顶点与对称轴",
      "Quick Random Challenge",
      "Summary + Bridge Out",
    ]);
  });

  it("derives the vertex of 2x²-8x+3 from the general-form formula", () => {
    expect(vertexFromGeneral({ a: 2, b: -8, c: 3 })).toEqual({ a: 2, h: 2, k: -5 });
  });

  it("reveals the demonstration completing-square transformations one move at a time", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson06(stage, { step: 2, onStepChange() {} });

    expect(stage.querySelector("[data-lesson06-demo-next]")).not.toBeNull();
    expect(stage.querySelector("[data-lesson06-demo-result]").hidden).toBe(true);
    lesson.destroy();
  });

  it("replays the numeric derivation in one animated equation stage without an unrelated graph", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson06(stage, { step: 2, onStepChange() {} });
    const next = stage.querySelector("[data-lesson06-demo-next]");

    expect(stage.querySelector("[data-lesson06-demo-stage]")).not.toBeNull();
    expect(stage.querySelectorAll("[data-lesson06-demo-line]")).toHaveLength(0);
    expect(stage.querySelector(".parabola-svg")).toBeNull();
    next.click();
    expect(next.disabled).toBe(true);
    expect(stage.textContent).toContain("先把要变化的两项标成红色。");
    lesson.destroy();
  });

  it("uses one equation stage and a short annotation instead of a stack of derivation cards", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson06(stage, { step: 2, onStepChange() {} });
    const next = stage.querySelector("[data-lesson06-demo-next]");

    expect(stage.querySelector("[data-lesson06-demo-stage]")).not.toBeNull();
    expect(stage.querySelectorAll("[data-lesson06-demo-line]")).toHaveLength(0);
    next.click();
    expect(stage.textContent).toContain("先把要变化的两项标成红色。");
    expect(stage.querySelectorAll(".lesson06-change-note")).toHaveLength(1);
    lesson.destroy();
  });

  it("uses color highlighting inside the animated equation rather than a separate transformation card", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson06(stage, { step: 2, onStepChange() {} });
    const next = stage.querySelector("[data-lesson06-demo-next]");

    next.click();
    expect(stage.querySelector("[data-lesson06-demo-motion]")).toBeNull();
    expect(stage.querySelector("[data-lesson06-demo-formula]").getAttribute("aria-label")).toContain("\\color");
    expect(stage.textContent).toContain("先把要变化的两项标成红色。");
    lesson.destroy();
  });

  it("lets students return to the previous stable equation before replaying a slow move", () => {
    vi.useFakeTimers();
    try {
      const stage = document.createElement("main");
      const lesson = renderLesson06(stage, { step: 2, onStepChange() {} });
      const next = stage.querySelector("[data-lesson06-demo-next]");
      const previous = stage.querySelector("[data-lesson06-demo-previous]");

      expect(previous.disabled).toBe(true);
      next.click();
      expect(previous.disabled).toBe(true);
      vi.advanceTimersByTime(3150);
      expect(previous.disabled).toBe(false);
      previous.click();
      expect(stage.querySelector("[data-lesson06-demo-formula]").getAttribute("aria-label")).toBe("y=2x^2-8x+3");
      expect(next.disabled).toBe(false);
      lesson.destroy();
    } finally {
      vi.useRealTimers();
    }
  });

  it("combines the formula derivation and direct-reading conclusion on one compact page", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson06(stage, { step: 4, onStepChange() {} });

    expect(stage.querySelector("[data-lesson06-compact-derivation]")).not.toBeNull();
    expect(stage.querySelector("[data-lesson06-hk-answer]").hidden).toBe(true);
    expect(stage.textContent).toContain("请先说出 h 和 k 分别是谁");
    lesson.destroy();
  });

  it("asks students to identify h and k before revealing the direct general-form reading rule", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson06(stage, { step: 4, onStepChange() {} });

    const answer = stage.querySelector("[data-lesson06-hk-answer]");
    expect(answer.hidden).toBe(true);
    stage.querySelector("[data-lesson06-hk-reveal]").click();
    expect(answer.hidden).toBe(false);
    expect(answer.querySelector("[data-lesson06-direct-axis]").getAttribute("aria-label")).toBe("x=-b/(2a)");
    expect(answer.querySelector("[data-lesson06-direct-vertex]").getAttribute("aria-label")).toBe("(-b/(2a), (4ac-b²)/(4a))");
    lesson.destroy();
  });

  it("uses only Reveal Answer and New Challenge for the quick completing-square prompt", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson06(stage, { step: 3, onStepChange() {}, random: () => 0.999 });

    expect(stage.querySelector("[data-lesson06-interactive-answer]")).not.toBeNull();
    expect(stage.querySelector("[data-lesson06-interactive-answer]").hidden).toBe(true);
    expect(stage.querySelectorAll("[data-lesson06-interactive-choice]")).toHaveLength(0);
    expect(stage.querySelector("[data-lesson06-interactive-reveal]")).not.toBeNull();
    expect(stage.querySelector("[data-lesson06-interactive-new]")).not.toBeNull();
    lesson.destroy();
  });

  it("reveals a deterministic random challenge by reading coefficients and applying the direct formulas", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson06(stage, { step: 5, onStepChange() {}, random: () => 0.999 });

    const answer = stage.querySelector("[data-lesson06-challenge-answer]");
    expect(answer).not.toBeNull();
    expect(answer.hidden).toBe(true);
    stage.querySelector("[data-lesson06-challenge-reveal]").click();
    expect(answer.hidden).toBe(false);
    expect(answer.textContent).toContain("a=-1，b=6，c=-6");
    expect(answer.querySelector("[data-lesson06-challenge-axis-formula]").getAttribute("aria-label")).toContain("x=-\\frac{b}{2a}");
    expect(answer.querySelector("[data-lesson06-challenge-vertex-formula]").getAttribute("aria-label")).toContain("\\frac{4ac-b^2}{4a}");
    expect(answer.querySelector("[data-lesson06-challenge-vertex-form]")).toBeNull();
    expect(answer.textContent).toContain("x=3");
    expect(stage.querySelector(".parabola-svg")).not.toBeNull();
    expect(stage.querySelector("[data-lesson06-challenge-graph]").classList.contains("lesson06-challenge-graph")).toBe(true);
    lesson.destroy();
  });
});
