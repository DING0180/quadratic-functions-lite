// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { LESSON06_STEP_TITLES, renderLesson06, vertexFromGeneral } from "../src/lessons/lesson06.js";

afterEach(() => {
  document.body.replaceChildren();
});

describe("Lesson 06 general-form to vertex-form classroom", () => {
  it("keeps the requested five-step knowledge-first flow", () => {
    expect(LESSON06_STEP_TITLES).toEqual([
      "Bridge In：两种形式",
      "教师示范：配方法",
      "配方后读顶点与对称轴",
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

  it("uses tables to contrast directly readable vertex-form information with unknown general-form information", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson06(stage, { step: 1, onStepChange() {} });

    const vertexInfo = stage.querySelector("[data-lesson06-vertex-info]");
    const generalInfo = stage.querySelector("[data-lesson06-general-info]");
    expect(vertexInfo.textContent).toContain("(h,k)");
    expect(vertexInfo.textContent).toContain("x=h");
    expect(generalInfo.textContent).toContain("？");
    expect(generalInfo.textContent).toContain("顶点");
    lesson.destroy();
  });

  it("replays the numeric derivation without an unrelated graph", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson06(stage, { step: 2, onStepChange() {} });
    const next = stage.querySelector("[data-lesson06-demo-next]");

    expect(stage.querySelector("[data-lesson06-demo-stage]")).not.toBeNull();
    expect(stage.querySelectorAll("[data-lesson06-demo-line]")).toHaveLength(1);
    expect(stage.querySelector(".parabola-svg")).toBeNull();
    next.click();
    expect(next.disabled).toBe(true);
    expect(stage.textContent).toContain("先把要变化的两项标成红色。");
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

  it("keeps completed equations visible and lets students return to the previous stable equation", () => {
    vi.useFakeTimers();
    try {
      const stage = document.createElement("main");
      const lesson = renderLesson06(stage, { step: 2, onStepChange() {} });
      const next = stage.querySelector("[data-lesson06-demo-next]");
      const previous = stage.querySelector("[data-lesson06-demo-previous]");

      expect(previous.disabled).toBe(true);
      next.click();
      expect(previous.disabled).toBe(true);
      vi.runAllTimers();
      expect(previous.disabled).toBe(false);
      const lines = stage.querySelectorAll("[data-lesson06-demo-line]");
      expect(lines).toHaveLength(2);
      expect(lines[0].querySelector(".lesson06-morph-formula").getAttribute("aria-label")).toBe("y=2x^2-8x+3");
      expect(lines[1].querySelector(".lesson06-morph-formula").getAttribute("aria-label")).toBe("y=2(x^2-4x)+3");
      previous.click();
      expect(stage.querySelectorAll("[data-lesson06-demo-line]")).toHaveLength(1);
      expect(next.disabled).toBe(false);
      lesson.destroy();
    } finally {
      vi.useRealTimers();
    }
  });

  it("merges completing-square practice with the direct-reading conclusion", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson06(stage, { step: 3, onStepChange() {} });

    const formAnswer = stage.querySelector("[data-lesson06-practice-form]");
    const formulaAnswer = stage.querySelector("[data-lesson06-practice-answer]");
    const reveal = stage.querySelector("[data-lesson06-practice-reveal]");
    expect(formAnswer.hidden).toBe(true);
    expect(formulaAnswer.hidden).toBe(true);
    reveal.click();
    expect(formAnswer.hidden).toBe(false);
    expect(formAnswer.querySelector(".lesson06-morph-formula").getAttribute("aria-label")).toBe("y=2(x-2)^2-5");
    expect(formulaAnswer.hidden).toBe(true);
    reveal.click();
    expect(formulaAnswer.hidden).toBe(false);
    expect(formulaAnswer.querySelector("[data-lesson06-direct-axis]").getAttribute("aria-label")).toBe("x=-\\frac{b}{2a}");
    expect(formulaAnswer.querySelector("[data-lesson06-direct-vertex]").getAttribute("aria-label")).toBe("\\left(-\\frac{b}{2a},\\frac{4ac-b^2}{4a}\\right)");
    lesson.destroy();
  });

  it("reveals a deterministic random challenge by reading coefficients and applying the direct formulas", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson06(stage, { step: 4, onStepChange() {}, random: () => 0.999 });

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
