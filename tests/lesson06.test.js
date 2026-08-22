// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { LESSON06_STEP_TITLES, renderLesson06, vertexFromGeneral } from "../src/lessons/lesson06.js";

afterEach(() => {
  document.body.replaceChildren();
});

describe("Lesson 06 general-form to vertex-form classroom", () => {
  it("keeps the requested eight-step knowledge-first flow", () => {
    expect(LESSON06_STEP_TITLES).toEqual([
      "Bridge In：两种形式",
      "教师示范：配方法",
      "互动配方：轮到你",
      "从数字到字母",
      "Axis & Vertex Formula",
      "双表示视图",
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

  it("keeps every numeric completing-square line visible and annotates the new change", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson06(stage, { step: 2, onStepChange() {} });
    const next = stage.querySelector("[data-lesson06-demo-next]");

    expect(stage.querySelectorAll("[data-lesson06-demo-line]")).toHaveLength(1);
    next.click();
    expect(stage.querySelectorAll("[data-lesson06-demo-line]")).toHaveLength(2);
    expect(stage.textContent).toContain("原式");
    expect(stage.textContent).toContain("把二次项系数提出");
    expect(stage.querySelectorAll(".lesson06-change-note")).toHaveLength(2);
    lesson.destroy();
  });

  it("builds the symbolic completing-square derivation as a persistent sequence", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson06(stage, { step: 4, onStepChange() {} });
    const next = stage.querySelector("[data-lesson06-symbolic-next]");

    next.click();
    next.click();
    expect(stage.querySelectorAll("[data-lesson06-symbolic-line]")).toHaveLength(3);
    expect(stage.textContent).toContain("一般式");
    expect(stage.textContent).toContain("计算要补的数");
    expect(stage.querySelectorAll(".lesson06-change-note")).toHaveLength(3);
    lesson.destroy();
  });

  it("asks students to identify h and k before revealing the direct general-form reading rule", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson06(stage, { step: 4, onStepChange() {} });
    const next = stage.querySelector("[data-lesson06-symbolic-next]");

    for (let index = 0; index < 7; index += 1) next.click();
    const answer = stage.querySelector("[data-lesson06-hk-answer]");
    expect(answer.hidden).toBe(true);
    stage.querySelector("[data-lesson06-hk-reveal]").click();
    expect(answer.hidden).toBe(false);
    expect(answer.querySelector("[data-lesson06-direct-axis]").getAttribute("aria-label")).toBe("x=-b/(2a)");
    expect(answer.querySelector("[data-lesson06-direct-vertex]").getAttribute("aria-label")).toBe("(-b/(2a), (4ac-b²)/(4a))");
    lesson.destroy();
  });

  it("keeps the interactive completing-square answer hidden until Reveal", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson06(stage, { step: 3, onStepChange() {} });

    expect(stage.querySelector("[data-lesson06-interactive-answer]")).not.toBeNull();
    expect(stage.querySelector("[data-lesson06-interactive-answer]").hidden).toBe(true);
    lesson.destroy();
  });

  it("shows the general-form axis and vertex formula with the correct vertical coordinate", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson06(stage, { step: 5, onStepChange() {} });

    expect(stage.querySelector("[data-lesson06-axis-formula]").getAttribute("aria-label")).toBe("x=-b/(2a)");
    expect(stage.querySelector("[data-lesson06-vertex-formula]").getAttribute("aria-label")).toBe("(-b/(2a), (4ac-b²)/(4a))");
    lesson.destroy();
  });

  it("reveals a deterministic random challenge with its vertex form and graph verification", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson06(stage, { step: 7, onStepChange() {}, random: () => 0.999 });

    const answer = stage.querySelector("[data-lesson06-challenge-answer]");
    expect(answer).not.toBeNull();
    expect(answer.hidden).toBe(true);
    stage.querySelector("[data-lesson06-challenge-reveal]").click();
    expect(answer.hidden).toBe(false);
    expect(answer.textContent).toContain("x=3");
    expect(stage.querySelector(".parabola-svg")).not.toBeNull();
    expect(stage.querySelector("[data-lesson06-challenge-graph]").classList.contains("lesson06-challenge-graph")).toBe(true);
    lesson.destroy();
  });
});
