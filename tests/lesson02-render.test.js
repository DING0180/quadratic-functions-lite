// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { renderLesson02 } from "../src/lessons/lesson02.js";

describe("Lesson 02 parameter explorer", () => {
  it("keeps the magnitude slider inside the nonzero quadratic range", () => {
    const stage = document.createElement("div");
    const view = renderLesson02(stage, { step: 7, onStepChange() {} });
    const slider = stage.querySelector('input[type="range"]');

    expect(slider.min).toBe("0.2");
    expect(slider.max).toBe("4");
    view.destroy();
  });
});
