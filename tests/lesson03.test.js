// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { renderLesson03, LESSON03_STEP_TITLES } from "../src/lessons/lesson03.js";

describe("Lesson 03 y=ax²+k migration", () => {
  it("preserves the legacy ten-step teaching sequence", () => {
    expect(LESSON03_STEP_TITLES).toEqual([
      "从 y=ax² 到 y=x²+1",
      "同 x 描点：每个 y 都 +1",
      "从一个单位到 k 个单位",
      "推广：k 控制上下平移",
      "变化与不变",
      "顶点、增减性与最值",
      "典型例题与变式",
      "a-k Double Parameter Lab",
      "核心结论",
      "向左右平移的追问",
    ]);
  });

  it("plots two colour-coded points for every x, then reveals and animates the vertical shift", () => {
    const stage = document.createElement("main");
    const changes = [];
    const lesson = renderLesson03(stage, { step: 2, onStepChange: (next) => changes.push(next) });

    stage.querySelector('[data-lesson03-point="0"]').click();
    expect(stage.textContent).toContain("(0, 0)");
    expect(stage.textContent).toContain("(0, 1)");
    expect(Array.from(stage.querySelectorAll(".parabola-point"), (point) => point.getAttribute("fill")))
      .toEqual(["#dc4055", "#2563eb"]);
    expect(stage.querySelector(".lesson03-connect").disabled).toBe(true);

    [-4, -3, -2, -1, 1, 2, 3, 4].forEach((x) => stage.querySelector(`[data-lesson03-point="${x}"]`).click());
    expect(stage.querySelector(".lesson03-connect").disabled).toBe(false);

    stage.querySelector(".lesson03-connect").click();
    expect(changes).toEqual([]);
    expect(stage.querySelectorAll(".parabola-point")).toHaveLength(18);
    expect(stage.querySelectorAll(".parabola-curve")).toHaveLength(2);
    expect(stage.querySelector("[data-lesson03-observe]").hidden).toBe(false);
    expect(stage.querySelector("[data-lesson03-reveal]").hidden).toBe(false);

    stage.querySelector("[data-lesson03-reveal]").click();
    expect(stage.querySelector("[data-lesson03-answer]").hidden).toBe(false);
    expect(stage.querySelector("[data-lesson03-overlap]").hidden).toBe(false);

    const requestAnimationFrame = window.requestAnimationFrame;
    window.requestAnimationFrame = (callback) => {
      callback(performance.now() + 1200);
      return 1;
    };
    stage.querySelector("[data-lesson03-overlap]").click();
    window.requestAnimationFrame = requestAnimationFrame;
    const [redPoint, bluePoint] = stage.querySelectorAll(".parabola-point");
    expect(redPoint.getAttribute("cy")).toBe(bluePoint.getAttribute("cy"));
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
    expect(stage.textContent).toContain("当前 a = 1；当前 k = -2；当前函数：y=x²-2");
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
    expect(stage.textContent).toContain("当前 a = 1；当前 k = 2；当前函数：y=x²+2");
    lesson.destroy();
  });

  it("uses a graph-first layout for the k workbench", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson03(stage, { step: 4, onStepChange() {} });

    expect(stage.querySelector(".lesson03-k-lab-layout")).not.toBeNull();
    expect(stage.querySelector(".lesson03-k-lab-layout > .lesson03-workbench")).not.toBeNull();
    expect(stage.querySelector(".lesson03-k-lab-layout > .lesson03-graph-panel")).not.toBeNull();
    lesson.destroy();
  });

  it("pairs the properties reveal with a two-parabola observation animation", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson03(stage, { step: 6, onStepChange() {} });

    expect(stage.querySelector(".lesson03-properties-layout")).not.toBeNull();
    expect(stage.querySelectorAll(".parabola-curve")).toHaveLength(2);
    expect(stage.querySelector(".lesson03-property-motion")).not.toBeNull();
    expect(stage.querySelectorAll(".lesson03-property-table tbody tr:not([hidden])")).toHaveLength(0);

    stage.querySelector("[data-lesson03-property-reveal]").click();
    expect(stage.querySelectorAll(".lesson03-property-table tbody tr:not([hidden])")).toHaveLength(1);
    expect(stage.querySelector(".lesson03-property-motion").textContent).toContain("开口方向");
    lesson.destroy();
  });

  it("keeps the example graph hidden until students reveal the answer", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson03(stage, { step: 7, onStepChange() {} });

    expect(stage.querySelector(".lesson03-example-layout")).not.toBeNull();
    expect(stage.querySelectorAll(".lesson03-answer-input")).toHaveLength(3);
    expect(stage.querySelector(".parabola-curve")).toBeNull();

    stage.querySelector("[data-lesson03-example-reveal]").click();
    expect(stage.querySelector(".parabola-curve")).not.toBeNull();
    expect(stage.querySelector("[data-lesson03-example-answer]").hidden).toBe(false);
    lesson.destroy();
  });

  it("balances the double-parameter workbench and graph in a two-column layout", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson03(stage, { step: 8, onStepChange() {} });

    expect(stage.querySelector(".lesson03-parameter-layout")).not.toBeNull();
    expect(stage.querySelector(".lesson03-parameter-layout > .lesson03-workbench")).not.toBeNull();
    expect(stage.querySelector(".lesson03-parameter-layout > .lesson03-graph-panel")).not.toBeNull();
    lesson.destroy();
  });

  it("uses a compact graph panel only where a large graph is not the teaching focus", () => {
    [3].forEach((step) => {
      const stage = document.createElement("main");
      const lesson = renderLesson03(stage, { step, onStepChange() {} });
      expect(stage.querySelector(".lesson03-compact-graph")).not.toBeNull();
      lesson.destroy();
    });
  });
});
