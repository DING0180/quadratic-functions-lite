// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import * as lesson08 from "../src/lessons/lesson08.js";

afterEach(() => document.body.replaceChildren());

describe("Lesson 08 approximate roots and graph inequalities", () => {
  it("derives a valid shrinking bracket for a non-integer root", () => {
    expect(lesson08.createRootBracket({ a: 1, h: 0, k: -2 }, 1, 2)).toMatchObject({
      left: 1,
      right: 2,
      containsRoot: true,
      leftValue: -1,
      rightValue: 2,
    });
    expect(lesson08.createRootBracket({ a: 1, h: 0, k: -2 }, 1.4, 1.5)).toMatchObject({
      leftValue: -0.04,
      rightValue: 0.25,
      containsRoot: true,
    });
  });

  it("lists exactly the ten compact teaching stages", () => {
    expect(lesson08.LESSON08_STEP_TITLES).toHaveLength(10);
    expect(lesson08.LESSON08_STEP_TITLES[0]).toContain("函数世界");
    expect(lesson08.LESSON08_STEP_TITLES[1]).toContain("交点就是解");
    expect(lesson08.LESSON08_STEP_TITLES[3]).toContain("Root Finder Zoom");
    expect(lesson08.LESSON08_STEP_TITLES[7]).toContain("两个函数比较");
  });

  it("uses the first two stages to bridge function and equation language through one graph", () => {
    const stage = document.createElement("main");
    let lesson = lesson08.renderLesson08(stage, { step: 1, onStepChange() {} });
    expect(stage.querySelector("[data-lesson08-bridge-question]")).not.toBeNull();
    expect(stage.querySelector("[data-lesson08-bridge-hint]").hidden).toBe(true);
    stage.querySelector("[data-lesson08-bridge-prompt]").click();
    expect(stage.querySelector("[data-lesson08-bridge-hint]").textContent).toContain("y=0");
    lesson.destroy();

    lesson = lesson08.renderLesson08(stage, { step: 2, onStepChange() {} });
    const next = stage.querySelector("[data-lesson08-bridge-next]");
    expect(stage.querySelector("[data-lesson08-bridge-conclusion]").hidden).toBe(true);
    expect(stage.querySelectorAll("[data-lesson08-bridge-graph] .parabola-point")).toHaveLength(0);
    next.click();
    expect(stage.querySelector("[data-lesson08-bridge-current-formula]").getAttribute("aria-label")).toBe("x²-2=0");
    expect(stage.querySelectorAll("[data-lesson08-bridge-graph] .parabola-horizontal-guide")).toHaveLength(1);
    next.click();
    expect(stage.querySelectorAll("[data-lesson08-bridge-graph] .parabola-point")).toHaveLength(2);
    stage.querySelector("[data-lesson08-bridge-reveal]").click();
    expect(stage.querySelector("[data-lesson08-bridge-conclusion]").textContent).toContain("x=±√2");
    lesson.destroy();
  });

  it("keeps root and inequality conclusions hidden until Reveal", () => {
    const stage = document.createElement("main");
    let lesson = lesson08.renderLesson08(stage, { step: 3, onStepChange() {} });
    expect(stage.querySelector("[data-lesson08-bracket-answer]").hidden).toBe(true);
    stage.querySelector("[data-lesson08-reveal-bracket]").click();
    expect(stage.querySelector("[data-lesson08-bracket-answer]").hidden).toBe(false);
    lesson.destroy();

    lesson = lesson08.renderLesson08(stage, { step: 6, onStepChange() {} });
    expect(stage.querySelector("[data-lesson08-inequality-answer]").hidden).toBe(true);
    stage.querySelector("[data-lesson08-reveal-inequality]").click();
    expect(stage.querySelector("[data-lesson08-inequality-answer]").hidden).toBe(false);
    lesson.destroy();
  });

  it("updates the zoom viewport and table-linked highlighted sample", () => {
    const stage = document.createElement("main");
    const lesson = lesson08.renderLesson08(stage, { step: 4, onStepChange() {} });
    const zoom = stage.querySelector("[data-lesson08-zoom]");
    const firstViewport = stage.querySelector(".parabola-svg").getAttribute("viewBox");
    zoom.value = "2";
    zoom.dispatchEvent(new Event("input", { bubbles: true }));
    expect(stage.querySelector("[data-lesson08-current-bracket]").textContent).toContain("1.4");
    expect(stage.querySelector("[data-lesson08-viewport-readout]").textContent).toContain("1.4");
    expect(stage.querySelector(".parabola-svg").getAttribute("viewBox")).toBe(firstViewport);
    stage.querySelector("[data-lesson08-sample='1.42']").click();
    expect(stage.querySelector("[data-lesson08-selected-sample]").textContent).toContain("1.42");
    lesson.destroy();
  });
});

