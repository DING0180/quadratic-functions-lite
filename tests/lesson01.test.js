// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import * as lesson01 from "../src/lessons/lesson01.js";

afterEach(() => document.body.replaceChildren());

describe("Lesson 01 quadratic-function concepts", () => {
  it("reveals examples, standard forms, and exponent labels in the teaching order", () => {
    const stage = document.createElement("main");
    const lesson = lesson01.renderLesson01(stage, { step: 1, onStepChange() {} });

    expect(lesson01.LESSON01_STEP_TITLES).toHaveLength(5);
    expect(stage.querySelectorAll("[data-lesson01-linear-example]")).toHaveLength(3);
    expect(stage.querySelector(".lesson01-quadratic-group").hidden).toBe(true);
    expect(stage.querySelector("[data-lesson01-linear-form]").hidden).toBe(true);

    const advance = stage.querySelector("[data-lesson01-bridge-advance]");
    advance.click();
    expect(stage.querySelector("[data-lesson01-linear-form]").hidden).toBe(false);
    expect(stage.querySelector(".lesson01-quadratic-group").hidden).toBe(true);
    advance.click();
    expect(stage.querySelector(".lesson01-quadratic-group").hidden).toBe(false);
    expect(stage.querySelector("[data-lesson01-quadratic-form]").hidden).toBe(true);
    advance.click();
    expect(stage.querySelector("[data-lesson01-quadratic-form]").hidden).toBe(false);
    advance.click();
    expect(stage.querySelectorAll("[data-lesson01-power-badge]")).toHaveLength(6);
    expect(stage.querySelectorAll("[data-lesson01-power-badge='1']")).toHaveLength(3);
    expect(stage.querySelectorAll("[data-lesson01-power-badge='2']")).toHaveLength(3);
    expect(stage.querySelector("[data-lesson01-bridge-answer]").textContent).toContain("最高次数");
    expect(stage.querySelector("[data-lesson01-bridge-answer]").hidden).toBe(false);
    lesson.destroy();
  });

  it("splits the standard form into terms and their coefficients one at a time", () => {
    const stage = document.createElement("main");
    const lesson = lesson01.renderLesson01(stage, { step: 2, onStepChange() {} });

    expect(stage.querySelector("[data-lesson01-decomposition-card='quadratic']").hidden).toBe(true);
    const advance = stage.querySelector("[data-lesson01-decompose-advance]");
    advance.click();
    expect(stage.querySelector("[data-lesson01-decomposition-card='quadratic']").textContent).toContain("二次项系数");
    expect(stage.querySelector("[data-lesson01-decomposition-card='quadratic']").textContent).toContain("a");
    advance.click();
    expect(stage.querySelector("[data-lesson01-decomposition-card='linear']").textContent).toContain("一次项系数");
    expect(stage.querySelector("[data-lesson01-decomposition-card='linear']").textContent).toContain("b");
    advance.click();
    expect(stage.querySelector("[data-lesson01-decomposition-card='constant']").textContent).toContain("常数项");
    lesson.destroy();
  });

  it("uses a shuffled quadratic expression for the final coefficient quick check", () => {
    const stage = document.createElement("main");
    const lesson = lesson01.renderLesson01(stage, { step: 5, onStepChange() {}, random: () => 0 });
    expect(stage.querySelector("[data-lesson01-practice-prompt]").textContent).toContain("二次项");
    expect(stage.querySelector("[data-lesson01-practice-function]").getAttribute("aria-label")).toContain("−3x²");
    expect(stage.querySelector("[data-lesson01-practice-answer]").hidden).toBe(true);
    stage.querySelector("[data-lesson01-practice-check]").click();
    expect(stage.querySelector("[data-lesson01-practice-answer]").textContent).toContain("a=−3");
    stage.querySelector("[data-lesson01-practice-reset]").click();
    expect(stage.querySelector("[data-lesson01-practice-answer]").hidden).toBe(true);
    lesson.destroy();
  });

  it("uses contrasting coefficient and exponent gates in a random parameter challenge", () => {
    const stage = document.createElement("main");
    const lesson = lesson01.renderLesson01(stage, { step: 4, onStepChange() {}, random: () => 0 });

    expect(stage.querySelector("[data-lesson01-parameter-coefficient]").textContent).toContain("m+3");
    expect(stage.querySelector("[data-lesson01-parameter-exponent]").getAttribute("aria-label")).toContain("m²−2m+1");
    expect(stage.querySelector("[data-lesson01-parameter-answer]").hidden).toBe(true);
    stage.querySelector("[data-lesson01-parameter-reveal]").click();
    expect(stage.querySelector("[data-lesson01-parameter-answer]").textContent).toContain("=2");
    expect(stage.querySelector("[data-lesson01-parameter-answer]").textContent).toContain("≠0");
    stage.querySelector("[data-lesson01-parameter-next]").click();
    expect(stage.querySelector("[data-lesson01-parameter-answer]").hidden).toBe(true);
    lesson.destroy();
  });

  it("updates the real-world model and makes the negative solution misconception visible", () => {
    const stage = document.createElement("main");
    const lesson = lesson01.renderLesson01(stage, { step: 3, onStepChange() {} });

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
