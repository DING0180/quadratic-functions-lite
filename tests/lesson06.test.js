// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { LESSON06_STEP_TITLES, renderLesson06, vertexFromGeneral } from "../src/lessons/lesson06.js";

afterEach(() => {
  document.body.replaceChildren();
});

describe("Lesson 06 general-form to vertex-form classroom", () => {
  it("keeps the requested six-step knowledge-first flow with a parameter exploration lab", () => {
    expect(LESSON06_STEP_TITLES).toEqual([
      "Bridge In：两种形式",
      "教师示范：配方法",
      "配方后读顶点与对称轴",
      "Quick Random Challenge",
      "Summary + Bridge Out",
      "参数探索实验室",
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

  it("splits both 2 factors before moving their common factor outside the parentheses", () => {
    vi.useFakeTimers();
    try {
      const stage = document.createElement("main");
      const lesson = renderLesson06(stage, { step: 2, onStepChange() {} });
      const next = stage.querySelector("[data-lesson06-demo-next]");
      const animatedFormula = stage.querySelector("[data-lesson06-demo-formula]");

      next.click();
      expect(animatedFormula.getAttribute("aria-label")).toBe("y=\\color{#c25443}{2x^2-8x}+3");
      vi.advanceTimersByTime(1900);
      expect(animatedFormula.getAttribute("aria-label")).toBe("y=\\color{#c25443}{2}\\cdot x^2-\\color{#c25443}{2}\\cdot4x+3");
      vi.advanceTimersByTime(1900);
      expect(animatedFormula.getAttribute("aria-label")).toBe("y=\\color{#197b9b}{2}(x^2-4x)+3");
      lesson.destroy();
    } finally {
      vi.useRealTimers();
    }
  });

  it("shows +4, then -4, then groups the completed square in separate animation frames", () => {
    vi.useFakeTimers();
    try {
      const stage = document.createElement("main");
      const lesson = renderLesson06(stage, { step: 2, onStepChange() {} });
      const next = stage.querySelector("[data-lesson06-demo-next]");
      const animatedFormula = stage.querySelector("[data-lesson06-demo-formula]");

      next.click();
      vi.runAllTimers();
      next.click();
      expect(animatedFormula.getAttribute("aria-label")).toBe("y=2(x^2-4x\\color{#c88818}{+4})+3");
      vi.advanceTimersByTime(1900);
      expect(animatedFormula.getAttribute("aria-label")).toBe("y=2(x^2-4x+4\\color{#c88818}{-4})+3");
      vi.advanceTimersByTime(1900);
      expect(animatedFormula.getAttribute("aria-label")).toBe("y=2[\\color{#197b9b}{x^2-4x+4}-4]+3");
      lesson.destroy();
    } finally {
      vi.useRealTimers();
    }
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

  it("starts the third page from the general form and only reveals the symbolic derivation through slow steps", () => {
    vi.useFakeTimers();
    try {
      const stage = document.createElement("main");
      const lesson = renderLesson06(stage, { step: 3, onStepChange() {} });
      const next = stage.querySelector("[data-lesson06-symbolic-next]");
      const panel = stage.querySelector("[data-lesson06-symbolic-conclusion]");

      expect(stage.querySelector("[data-lesson06-symbolic-general]").getAttribute("aria-label")).toBe("y=ax^2+bx+c");
      expect(stage.querySelectorAll("[data-lesson06-symbolic-line]")).toHaveLength(1);
      expect(panel.hidden).toBe(true);
      next.click();
      expect(next.disabled).toBe(true);
      vi.runAllTimers();
      expect(stage.querySelectorAll("[data-lesson06-symbolic-line]")).toHaveLength(2);
      lesson.destroy();
    } finally {
      vi.useRealTimers();
    }
  });

  it("reveals formula-typeset vertex and symmetry-axis conclusions after the symbolic square-completion", () => {
    vi.useFakeTimers();
    try {
      const stage = document.createElement("main");
      const lesson = renderLesson06(stage, { step: 3, onStepChange() {} });
      const next = stage.querySelector("[data-lesson06-symbolic-next]");
      while (!next.disabled) {
        next.click();
        vi.runAllTimers();
      }
      const panel = stage.querySelector("[data-lesson06-symbolic-conclusion]");
      expect(panel.hidden).toBe(false);
      const answer = stage.querySelector("[data-lesson06-hk-answer]");
      expect(answer.hidden).toBe(true);
      stage.querySelector("[data-lesson06-hk-reveal]").click();
      expect(answer.hidden).toBe(false);
      expect(answer.querySelector("[data-lesson06-direct-axis]").getAttribute("aria-label")).toBe("x=-\\frac{b}{2a}");
      expect(answer.querySelector("[data-lesson06-direct-vertex]").getAttribute("aria-label")).toBe("\\left(-\\frac{b}{2a},\\frac{4ac-b^2}{4a}\\right)");
      lesson.destroy();
    } finally {
      vi.useRealTimers();
    }
  });

  it("reveals a deterministic random challenge by reading coefficients and applying the direct formulas", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson06(stage, { step: 4, onStepChange() {}, random: () => 0.999 });

    const answer = stage.querySelector("[data-lesson06-challenge-answer]");
    const graph = stage.querySelector("[data-lesson06-challenge-graph]");
    expect(answer).not.toBeNull();
    expect(answer.hidden).toBe(true);
    expect(graph.hidden).toBe(true);
    stage.querySelector("[data-lesson06-challenge-reveal]").click();
    expect(answer.hidden).toBe(false);
    expect(graph.hidden).toBe(false);
    expect(answer.textContent).toContain("a=-1，b=6，c=-6");
    expect(answer.querySelector("[data-lesson06-challenge-axis-formula]").getAttribute("aria-label")).toContain("x=-\\frac{b}{2a}");
    expect(answer.querySelector("[data-lesson06-challenge-vertex-formula]").getAttribute("aria-label")).toContain("\\frac{4ac-b^2}{4a}");
    expect(answer.querySelector("[data-lesson06-challenge-vertex-form]")).toBeNull();
    expect(answer.textContent).toContain("x=3");
    expect(stage.querySelector(".parabola-svg")).not.toBeNull();
    expect(stage.querySelector("[data-lesson06-challenge-graph]").classList.contains("lesson06-challenge-graph")).toBe(true);
    lesson.destroy();
  });

  it("puts vertex-form and general-form parameter controls beside independent live graphs", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson06(stage, { step: 6, onStepChange() {} });

    const vertexFormula = stage.querySelector("[data-lesson06-vertex-lab-formula]");
    const generalFormula = stage.querySelector("[data-lesson06-general-lab-formula]");
    const hControl = stage.querySelector('[data-lesson06-vertex-slider="h"]');
    const bControl = stage.querySelector('[data-lesson06-general-slider="b"]');
    expect(stage.querySelectorAll(".lesson06-parameter-graph .parabola-svg")).toHaveLength(2);
    expect(stage.querySelectorAll("[data-lesson06-vertex-slider]")).toHaveLength(3);
    expect(stage.querySelectorAll("[data-lesson06-general-slider]")).toHaveLength(3);
    expect(stage.textContent).toContain("a、h、k 分别控制什么");

    hControl.value = "2";
    hControl.dispatchEvent(new Event("input", { bubbles: true }));
    expect(vertexFormula.getAttribute("aria-label")).toBe("y=(x-2)²");
    bControl.value = "-4";
    bControl.dispatchEvent(new Event("input", { bubbles: true }));
    expect(generalFormula.getAttribute("aria-label")).toBe("y=x²-4x");
    lesson.destroy();
  });
});
