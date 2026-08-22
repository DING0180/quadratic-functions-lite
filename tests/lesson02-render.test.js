// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { renderLesson02 } from "../src/lessons/lesson02.js";

describe("Lesson 02 parameter explorer", () => {
  it("lets students drag the coefficient from negative five through five", () => {
    const stage = document.createElement("div");
    const view = renderLesson02(stage, { step: 7, onStepChange() {} });
    const slider = stage.querySelector('input[type="range"]');

    expect(slider.min).toBe("-5");
    expect(slider.max).toBe("5");
    view.destroy();
  });

  it("starts the comparison board with six hidden curve toggles", () => {
    const stage = document.createElement("div");
    const view = renderLesson02(stage, { step: 11, onStepChange() {} });
    const toggles = stage.querySelectorAll(".lesson02-curve-toggle");

    expect(toggles).toHaveLength(6);
    expect(Array.from(toggles, (toggle) => toggle.getAttribute("aria-pressed"))).toEqual(["false", "false", "false", "false", "false", "false"]);
    expect(stage.querySelectorAll(".parabola-curve")).toHaveLength(0);
    view.destroy();
  });
});
