// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import * as lesson07 from "../src/lessons/lesson07.js";

afterEach(() => {
  document.body.replaceChildren();
});

describe("Lesson 07 graph, roots and discriminant", () => {
  it("derives roots, x-intercepts and discriminant from one quadratic graph state", () => {
    expect(lesson07.analyzeQuadratic).toBeTypeOf("function");
    expect(lesson07.analyzeQuadratic({ a: 1, h: -1, k: -4 })).toEqual({
      a: 1,
      b: 2,
      c: -3,
      discriminant: 16,
      rootCount: 2,
      roots: [-3, 1],
      intersections: [{ x: -3, y: 0 }, { x: 1, y: 0 }],
    });
  });

  it("creates classroom-friendly random cases for two, one and zero real roots", () => {
    expect(lesson07.createLesson07Challenge).toBeTypeOf("function");
    expect(lesson07.createLesson07Challenge(() => 0).analysis).toMatchObject({ rootCount: 2, roots: [-3, 1], discriminant: 16 });
    expect(lesson07.createLesson07Challenge(() => 0.4).analysis).toMatchObject({ rootCount: 1, roots: [1], discriminant: 0 });
    expect(lesson07.createLesson07Challenge(() => 0.8).analysis).toMatchObject({ rootCount: 0, roots: [], discriminant: -4 });
  });

  it("keeps the requested seven-step teaching sequence", () => {
    expect(lesson07.LESSON07_STEP_TITLES).toEqual([
      "Bridge In：令 y=0",
      "根就是交点横坐标",
      "2 / 1 / 0 个交点",
      "Intersection Lab",
      "Quick Random Challenge：Graph → Equation",
      "Reverse Challenge：Equation / Roots → Graph",
      "Summary + Bridge Out",
    ]);
  });

  it("keeps roots hidden until reveal and synchronizes the intersection lab readouts", () => {
    expect(lesson07.renderLesson07).toBeTypeOf("function");
    const stage = document.createElement("main");
    let lesson = lesson07.renderLesson07(stage, { step: 2, onStepChange() {} });
    expect(stage.querySelector("[data-lesson07-root-answer]").hidden).toBe(true);
    expect(Array.from(stage.querySelectorAll(".parabola-label"), (label) => label.textContent)).toEqual(["(-3, 0)", "(1, 0)"]);
    stage.querySelector("[data-lesson07-reveal-roots]").click();
    expect(stage.querySelector("[data-lesson07-root-answer]").hidden).toBe(false);
    lesson.destroy();

    lesson = lesson07.renderLesson07(stage, { step: 4, onStepChange() {} });
    const slider = stage.querySelector("[data-lesson07-lab-slider]");
    slider.value = "0";
    slider.dispatchEvent(new Event("input", { bubbles: true }));
    expect(stage.querySelector("[data-lesson07-current-function]").getAttribute("aria-label")).toBe("y=x²");
    expect(stage.querySelector("[data-lesson07-discriminant]").textContent).toContain("Δ=0");
    expect(stage.querySelector("[data-lesson07-root-status]").textContent).toContain("一个相等实根");
    lesson.destroy();
  });

  it("keeps both random challenge answers hidden before Reveal", () => {
    const stage = document.createElement("main");
    let lesson = lesson07.renderLesson07(stage, { step: 5, onStepChange() {}, random: () => 0 });
    expect(stage.querySelector("[data-lesson07-graph-answer]").hidden).toBe(true);
    stage.querySelector("[data-lesson07-reveal-graph]").click();
    expect(stage.querySelector("[data-lesson07-graph-answer]").hidden).toBe(false);
    lesson.destroy();

    lesson = lesson07.renderLesson07(stage, { step: 6, onStepChange() {}, random: () => 0.8 });
    expect(stage.querySelector("[data-lesson07-reverse-answer]").hidden).toBe(true);
    expect(stage.querySelector("[data-lesson07-reverse-graph]").hidden).toBe(true);
    stage.querySelector("[data-lesson07-reveal-reverse]").click();
    expect(stage.querySelector("[data-lesson07-reverse-answer]").hidden).toBe(false);
    expect(stage.querySelector("[data-lesson07-reverse-graph]").hidden).toBe(false);
    lesson.destroy();
  });
});

