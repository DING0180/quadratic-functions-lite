// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { LESSON09_STEP_TITLES, analyzeRestrictedQuadratic, renderLesson09 } from "../src/lessons/lesson09.js";

afterEach(() => document.body.replaceChildren());

describe("Lesson 09 restricted-domain extrema", () => {
  it("uses the vertex only when it belongs to the real domain", () => {
    expect(analyzeRestrictedQuadratic({ a: 1, h: 4, k: -3 }, [2, 3])).toMatchObject({
      vertex: { x: 4, y: -3 },
      vertexInDomain: false,
      minimum: { x: 3, y: -2 },
      maximum: { x: 2, y: 1 },
    });
    expect(analyzeRestrictedQuadratic({ a: 1, h: 4, k: -3 }, [2, 6])).toMatchObject({
      vertexInDomain: true,
      minimum: { x: 4, y: -3 },
      maximum: { y: 1 },
    });
  });

  it("keeps the requested ten-stage teaching flow", () => {
    expect(LESSON09_STEP_TITLES).toHaveLength(10);
    expect(LESSON09_STEP_TITLES[1]).toContain("截取图象");
    expect(LESSON09_STEP_TITLES[5]).toContain("应用题");
  });

  it("updates the current domain, function, and restricted segment together", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson09(stage, { step: 2, onStepChange() {} });
    const left = stage.querySelector("[data-lesson09-left-bound]");
    left.value = "1";
    left.dispatchEvent(new Event("input", { bubbles: true }));

    expect(stage.querySelector("[data-lesson09-domain-readout]").textContent).toContain("[1, 3]");
    expect(stage.querySelector("[data-lesson09-current-function]").getAttribute("aria-label")).toContain("y=(x-4)");
    expect(stage.querySelectorAll(".parabola-highlight-curve")).toHaveLength(1);
    lesson.destroy();
  });

  it("protects case and practice conclusions until Reveal", () => {
    const stage = document.createElement("main");
    let lesson = renderLesson09(stage, { step: 3, onStepChange() {} });
    expect(stage.querySelector("[data-lesson09-case-answer]").hidden).toBe(true);
    stage.querySelector("[data-lesson09-reveal-case]").click();
    expect(stage.querySelector("[data-lesson09-case-answer]").hidden).toBe(false);
    lesson.destroy();

    lesson = renderLesson09(stage, { step: 5, onStepChange() {}, random: () => 0 });
    expect(stage.querySelector("[data-lesson09-practice-answer]").hidden).toBe(true);
    stage.querySelector("[data-lesson09-reveal-practice]").click();
    expect(stage.querySelector("[data-lesson09-practice-answer]").hidden).toBe(false);
    lesson.destroy();
  });
});

