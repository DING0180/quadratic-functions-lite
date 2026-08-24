// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";
import { renderLesson02 } from "../src/lessons/lesson02.js";

describe("Lesson 02 parameter explorer", () => {
  it("animates b x and c away from the general quadratic on the opening page", () => {
    const stage = document.createElement("div");
    const view = renderLesson02(stage, { step: 1, onStepChange() {} });
    const start = Array.from(stage.querySelectorAll("button")).find((node) => node.textContent.includes("化简动画"));

    expect(stage.querySelectorAll(".lesson02-vanishing-term")).toHaveLength(2);
    expect(start).toBeTruthy();
    start.click();
    expect(stage.querySelector(".lesson02-equation-transform").classList.contains("is-transforming")).toBe(true);
    view.destroy();
  });

  it("keeps plotting and smooth curve connection together on step two", () => {
    const stage = document.createElement("div");
    const onStepChange = vi.fn();
    const view = renderLesson02(stage, { step: 2, onStepChange });

    stage.querySelectorAll(".lesson02-point-choice").forEach((choice) => choice.click());
    const connect = Array.from(stage.querySelectorAll("button")).find((node) => node.textContent.includes("平滑曲线"));
    connect.click();

    expect(onStepChange).not.toHaveBeenCalled();
    expect(connect.disabled).toBe(true);
    expect(stage.textContent).toContain("抛物线");
    view.destroy();
  });

  it("reduces the lesson to eleven steps after merging point plotting and connection", () => {
    const stage = document.createElement("div");
    const view = renderLesson02(stage, { step: 12, onStepChange() {} });

    expect(stage.querySelector(".lesson02-step-count").textContent).toBe("11 / 11");
    view.destroy();
  });

  it("reveals numerical x and y change readouts when the monotonicity demonstration starts", () => {
    const stage = document.createElement("div");
    const view = renderLesson02(stage, { step: 4, onStepChange() {} });

    const readout = stage.querySelector(".lesson02-motion-readout");
    expect(readout.hidden).toBe(true);
    Array.from(stage.querySelectorAll("button")).find((node) => node.textContent.includes("分段演示增减性")).click();
    expect(readout.hidden).toBe(false);
    expect(readout.textContent).toContain("x：−4 → 0（增大）");
    expect(readout.textContent).toContain("y：16 → 0（减小）");
    view.destroy();
  });

  it("keeps both Quick Check questions on the left and their graph areas on the right", () => {
    [8, 9].forEach((step) => {
      const stage = document.createElement("div");
      const view = renderLesson02(stage, { step, onStepChange() {} });
      const layout = stage.querySelector(".lesson02-practice-layout");

      expect(layout).toBeTruthy();
      expect(layout.querySelector(".lesson02-practice-question-pane")).toBeTruthy();
      expect(layout.querySelector(".lesson02-practice-graph-pane")).toBeTruthy();
      view.destroy();
    });
  });

  it("places the six requested comparison functions vertically on the left of one graph", () => {
    const stage = document.createElement("div");
    const view = renderLesson02(stage, { step: 10, onStepChange() {} });
    const layout = stage.querySelector(".lesson02-comparison-layout");

    expect(layout).toBeTruthy();
    expect(layout.querySelector(".lesson02-comparison-controls")).toBeTruthy();
    expect(layout.querySelector(".lesson02-comparison-graph")).toBeTruthy();
    expect(Array.from(stage.querySelectorAll(".lesson02-curve-toggle"), (node) => node.dataset.curveId)).toEqual([
      "two", "four", "one", "negative-one", "half", "negative-half",
    ]);
    view.destroy();
  });

  it("lets students drag the coefficient from negative five through five", () => {
    const stage = document.createElement("div");
    const view = renderLesson02(stage, { step: 6, onStepChange() {} });
    const slider = stage.querySelector('input[type="range"]');

    expect(slider.min).toBe("-5");
    expect(slider.max).toBe("5");
    view.destroy();
  });

  it("starts the comparison board with six hidden curve toggles", () => {
    const stage = document.createElement("div");
    const view = renderLesson02(stage, { step: 10, onStepChange() {} });
    const toggles = stage.querySelectorAll(".lesson02-curve-toggle");

    expect(toggles).toHaveLength(6);
    expect(Array.from(toggles, (toggle) => toggle.getAttribute("aria-pressed"))).toEqual(["false", "false", "false", "false", "false", "false"]);
    expect(stage.querySelectorAll(".parabola-curve")).toHaveLength(0);
    view.destroy();
  });
});
