// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { LESSON04_STEP_TITLES, renderLesson04 } from "../src/lessons/lesson04.js";

afterEach(() => {
  vi.useRealTimers();
});

describe("Lesson 04 horizontal-shift migration", () => {
  it("starts with paired same-x plotting and ends with the k exploration page", () => {
    expect(LESSON04_STEP_TITLES).toEqual([
      "同 x 描点：两组点",
      "连接两条抛物线",
      "观察：向右平移 1 个单位",
      "对应点验证",
      "探索：y=(x-k)²",
    ]);
  });

  it("plots a blue and red point together for each shared x-value", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson04(stage, { step: 1, onStepChange() {} });

    stage.querySelector("[data-lesson04-generate-pair]").click();

    expect(stage.querySelectorAll(".parabola-point")).toHaveLength(2);
    expect(stage.querySelector("[data-lesson04-point-table]").textContent).toContain("(-4, 16)");
    expect(stage.querySelector("[data-lesson04-point-table]").textContent).toContain("(-4, 25)");
    lesson.destroy();
  });

  it("connects both curves only after all nine blue-red pairs are generated", () => {
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
    lesson.destroy();
  });

  it("moves the red curve left and right when k changes", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson04(stage, { step: 5, onStepChange() {} });
    const slider = stage.querySelector('[data-lesson04-slider="k"]');

    slider.value = "-2";
    slider.dispatchEvent(new Event("input", { bubbles: true }));

    expect(stage.querySelector("[data-lesson04-shift-readout]").textContent).toContain("向左平移 2 个单位");
    expect(stage.querySelectorAll(".parabola-curve")).toHaveLength(2);
    lesson.destroy();
  });
});
