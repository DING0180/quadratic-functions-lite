// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { LESSON04_STEP_TITLES, renderLesson04 } from "../src/lessons/lesson04.js";

afterEach(() => {
  vi.useRealTimers();
});

describe("Lesson 04 horizontal-shift migration", () => {
  it("preserves the five legacy discovery stages", () => {
    expect(LESSON04_STEP_TITLES).toEqual([
      "猜一猜：图象向哪边移？",
      "描点：生成 y=x²",
      "描点：生成 y=(x-1)²",
      "比较两个图象",
      "对应点的水平平移",
    ]);
  });

  it("records a horizontal-shift guess and keeps the conclusion hidden until reveal", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson04(stage, { step: 1, onStepChange() {} });

    const right = stage.querySelector('[data-lesson04-guess="right"]');
    const conclusion = stage.querySelector("[data-lesson04-conclusion]");
    expect(conclusion.hidden).toBe(true);

    right.click();
    expect(right.getAttribute("aria-pressed")).toBe("true");
    stage.querySelector("[data-lesson04-reveal]").click();
    expect(conclusion.hidden).toBe(false);
    lesson.destroy();
  });

  it("connects the baseline curve only after all nine legacy points are generated", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson04(stage, { step: 2, onStepChange() {} });
    const generate = stage.querySelector("[data-lesson04-generate-base]");

    for (let index = 0; index < 8; index += 1) generate.click();
    expect(stage.querySelectorAll(".parabola-point")).toHaveLength(8);
    expect(stage.querySelectorAll(".parabola-curve")).toHaveLength(0);

    generate.click();
    expect(stage.querySelectorAll(".parabola-point")).toHaveLength(9);
    expect(stage.querySelectorAll(".parabola-curve")).toHaveLength(1);
    lesson.destroy();
  });

  it("requires ten shifted points before a student can connect the new curve", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson04(stage, { step: 3, onStepChange() {} });
    const generate = stage.querySelector("[data-lesson04-generate-shifted]");
    const connect = stage.querySelector("[data-lesson04-connect-shifted]");

    for (let index = 0; index < 9; index += 1) generate.click();
    expect(connect.disabled).toBe(true);
    generate.click();
    expect(connect.disabled).toBe(false);
    expect(stage.querySelectorAll(".parabola-curve")).toHaveLength(0);

    connect.click();
    expect(stage.querySelectorAll(".parabola-curve")).toHaveLength(1);
    lesson.destroy();
  });

  it("reveals the comparison conclusion and plays rightward arrows", () => {
    vi.useFakeTimers();
    const comparisonStage = document.createElement("main");
    const comparison = renderLesson04(comparisonStage, { step: 4, onStepChange() {} });
    expect(comparisonStage.querySelector("[data-lesson04-conclusion]").hidden).toBe(true);
    comparisonStage.querySelector("[data-lesson04-reveal]").click();
    expect(comparisonStage.querySelector("[data-lesson04-conclusion]").hidden).toBe(false);
    comparison.destroy();

    const arrowStage = document.createElement("main");
    const arrows = renderLesson04(arrowStage, { step: 5, onStepChange() {} });
    arrowStage.querySelector("[data-lesson04-play-arrows]").click();
    expect(arrowStage.querySelectorAll(".parabola-arrow-label")).toHaveLength(1);
    arrows.destroy();
    expect(vi.getTimerCount()).toBe(0);
  });
});
