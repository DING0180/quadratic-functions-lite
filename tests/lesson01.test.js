// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import * as lesson01 from "../src/lessons/lesson01.js";

afterEach(() => document.body.replaceChildren());

describe("Lesson 01 quadratic-function concepts", () => {
  it("keeps the bridge conclusion hidden until students request the reveal", () => {
    const stage = document.createElement("main");
    const lesson = lesson01.renderLesson01(stage, { step: 1, onStepChange() {} });

    expect(lesson01.LESSON01_STEP_TITLES).toHaveLength(8);
    expect(stage.querySelector("[data-lesson01-bridge-answer]").hidden).toBe(true);
    stage.querySelector("[data-lesson01-bridge-reveal]").click();
    expect(stage.querySelector("[data-lesson01-bridge-answer]").textContent).toContain("最高次数");
    expect(stage.querySelector("[data-lesson01-bridge-answer]").hidden).toBe(false);
    lesson.destroy();
  });

  it("links the selected general-form term with its coefficient", () => {
    const stage = document.createElement("main");
    const lesson = lesson01.renderLesson01(stage, { step: 2, onStepChange() {} });

    stage.querySelector("[data-lesson01-term='linear']").click();
    expect(stage.querySelector("[data-lesson01-term='linear']").getAttribute("aria-pressed")).toBe("true");
    expect(stage.querySelector("[data-lesson01-term-explanation]").textContent).toContain("b");
    lesson.destroy();
  });

  it("scans a chosen term and resets a deterministic quick check", () => {
    const stage = document.createElement("main");
    let lesson = lesson01.renderLesson01(stage, { step: 4, onStepChange() {} });
    stage.querySelector("[data-lesson01-scan='quadratic']").click();
    expect(stage.querySelector("[data-lesson01-scan-result]").textContent).toContain("二次项");
    lesson.destroy();

    lesson = lesson01.renderLesson01(stage, { step: 5, onStepChange() {}, random: () => 0 });
    expect(stage.querySelector("[data-lesson01-practice-prompt]").textContent).toContain("最高次数");
    expect(stage.querySelector("[data-lesson01-practice-prompt]").nextElementSibling.getAttribute("aria-label")).toContain("x²");
    expect(stage.querySelector("[data-lesson01-practice-answer]").hidden).toBe(true);
    stage.querySelector("[data-lesson01-practice-check]").click();
    expect(stage.querySelector("[data-lesson01-practice-answer]").hidden).toBe(false);
    stage.querySelector("[data-lesson01-practice-reset]").click();
    expect(stage.querySelector("[data-lesson01-practice-answer]").hidden).toBe(true);
    lesson.destroy();
  });

  it("updates the real-world model and makes the negative solution misconception visible", () => {
    const stage = document.createElement("main");
    const lesson = lesson01.renderLesson01(stage, { step: 7, onStepChange() {} });

    const slider = stage.querySelector("[data-lesson01-model-size]");
    slider.value = "3";
    slider.dispatchEvent(new Event("input", { bubbles: true }));
    expect(stage.querySelector("[data-lesson01-model-readout]").textContent).toContain("7 × 6");
    expect(stage.querySelector("[data-lesson01-negative-note]").hidden).toBe(true);
    stage.querySelector("[data-lesson01-negative-choice]").click();
    expect(stage.querySelector("[data-lesson01-negative-note]").textContent).toContain("不能为负");
    expect(stage.querySelector("[data-lesson01-negative-note]").hidden).toBe(false);
    lesson.destroy();
  });
});
