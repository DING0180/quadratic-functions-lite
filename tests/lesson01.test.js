// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import * as lesson01 from "../src/lessons/lesson01.js";

afterEach(() => document.body.replaceChildren());

describe("Lesson 01 quadratic-function concepts", () => {
  it("compares linear and quadratic functions side by side and highlights their actual exponents", () => {
    const stage = document.createElement("main");
    const lesson = lesson01.renderLesson01(stage, { step: 1, onStepChange() {} });

    expect(lesson01.LESSON01_STEP_TITLES).toHaveLength(5);
    expect(stage.querySelector(".lesson01-compare-grid")).not.toBeNull();
    expect(stage.querySelectorAll("[data-lesson01-linear-example]")).toHaveLength(3);
    expect(stage.querySelectorAll("[data-lesson01-quadratic-example]")).toHaveLength(3);
    expect(stage.querySelector(".lesson01-quadratic-group").hidden).toBe(false);
    expect(stage.querySelector("[data-lesson01-linear-form]").hidden).toBe(false);
    expect(stage.querySelector("[data-lesson01-quadratic-form]").hidden).toBe(false);

    const advance = stage.querySelector("[data-lesson01-bridge-advance]");
    advance.click();
    expect(stage.querySelectorAll("[data-lesson01-power-badge]")).toHaveLength(0);
    expect(stage.querySelectorAll("[data-lesson01-power-highlight='1']")).toHaveLength(3);
    expect(stage.querySelectorAll("[data-lesson01-power-highlight='2']")).toHaveLength(3);
    expect(stage.querySelector("[data-lesson01-linear-example]").getAttribute("aria-label")).toContain("x¹");
    expect(stage.querySelector("[data-lesson01-quadratic-example]").getAttribute("aria-label")).toContain("x²");
    expect(stage.querySelector("[data-lesson01-bridge-answer]").textContent).toContain("最高次数");
    expect(stage.querySelector("[data-lesson01-bridge-answer]").hidden).toBe(false);
    lesson.destroy();
  });

  it("moves the existing formula tokens into term cards before revealing their labels", async () => {
    const stage = document.createElement("main");
    const lesson = lesson01.renderLesson01(stage, { step: 2, onStepChange() {} });

    const source = stage.querySelector("[data-lesson01-token-source]");
    const quadraticToken = stage.querySelector("[data-lesson01-general-token='quadratic']");
    const quadraticCard = stage.querySelector("[data-lesson01-decomposition-card='quadratic']");
    const quadraticSlot = quadraticCard.querySelector("[data-lesson01-token-slot='quadratic']");
    expect(source).toContain(quadraticToken);
    expect(source.textContent).not.toContain("null");
    expect(quadraticSlot).not.toContain(quadraticToken);
    expect(quadraticCard.querySelector("[data-lesson01-token-label]").hidden).toBe(true);

    const advance = stage.querySelector("[data-lesson01-decompose-advance]");
    advance.click();
    expect(quadraticToken.classList).toContain("is-flip-moving");
    expect(source.querySelector("[data-lesson01-token-prefix]").classList).toContain("is-consumed");
    expect(source.querySelector("[data-lesson01-token-separator='quadratic']").classList).toContain("is-consumed");
    await new Promise((resolve) => window.setTimeout(resolve));
    expect(quadraticSlot).toContain(quadraticToken);
    expect(quadraticCard.classList).toContain("is-revealed");
    expect(quadraticCard.querySelector("[data-lesson01-token-label]").hidden).toBe(false);
    advance.click();
    await new Promise((resolve) => window.setTimeout(resolve));
    expect(stage.querySelector("[data-lesson01-token-slot='linear']")).toContain(stage.querySelector("[data-lesson01-general-token='linear']"));
    advance.click();
    await new Promise((resolve) => window.setTimeout(resolve));
    expect(stage.querySelector("[data-lesson01-token-slot='constant']")).toContain(stage.querySelector("[data-lesson01-general-token='constant']"));
    lesson.destroy();
  });

  it("reveals a term after the FLIP safety timeout when an animation completion signal stalls", async () => {
    vi.useFakeTimers();
    const stage = document.createElement("main");
    const lesson = lesson01.renderLesson01(stage, { step: 2, onStepChange() {} });
    const token = stage.querySelector("[data-lesson01-general-token='quadratic']");
    token.animate = () => ({ finished: new Promise(() => {}) });

    stage.querySelector("[data-lesson01-decompose-advance]").click();
    await vi.advanceTimersByTimeAsync(650);

    expect(stage.querySelector("[data-lesson01-token-label='quadratic']").hidden).toBe(false);
    lesson.destroy();
    vi.useRealTimers();
  });

  it("uses a shuffled quadratic expression for the coefficient quick check", () => {
    const stage = document.createElement("main");
    const lesson = lesson01.renderLesson01(stage, { step: 3, onStepChange() {}, random: () => 0 });
    expect(stage.querySelector("[data-lesson01-practice-prompt]").textContent).toContain("二次项");
    expect(stage.querySelector("[data-lesson01-practice-function]").getAttribute("aria-label")).toContain("−3x²");
    expect(stage.querySelector("[data-lesson01-practice-answer]").hidden).toBe(true);
    stage.querySelector("[data-lesson01-practice-check]").click();
    expect(stage.querySelector("[data-lesson01-practice-answer]").textContent).toContain("a=−3");
    stage.querySelector("[data-lesson01-practice-reset]").click();
    expect(stage.querySelector("[data-lesson01-practice-answer]").hidden).toBe(true);
    lesson.destroy();
  });

  it("offers parallel standard, simplification, and parameter questions with independent new problems", () => {
    const stage = document.createElement("main");
    const lesson = lesson01.renderLesson01(stage, { step: 4, onStepChange() {}, random: () => 0 });

    expect(stage.querySelectorAll("[data-lesson01-case]")).toHaveLength(3);
    const standardFormula = stage.querySelector("[data-lesson01-case-formula='standard']");
    const before = standardFormula.getAttribute("aria-label");
    stage.querySelector("[data-lesson01-case-new='standard']").click();
    expect(standardFormula.getAttribute("aria-label")).not.toBe(before);

    expect(stage.querySelector("[data-lesson01-case-new='simplify']")).not.toBeNull();
    expect(stage.querySelector("[data-lesson01-case-new='parameter']")).not.toBeNull();
    expect(stage.querySelector("[data-lesson01-parameter-coefficient]").getAttribute("aria-label")).toContain("(m+3)");
    expect(stage.querySelector("[data-lesson01-parameter-exponent]").getAttribute("aria-label")).toContain("m²−2m+1");
    expect(stage.querySelector("[data-lesson01-parameter-answer]").hidden).toBe(true);
    stage.querySelector("[data-lesson01-case-reveal='parameter']").click();
    expect(stage.querySelector("[data-lesson01-parameter-answer]").textContent).toContain("x 的次数");
    expect(stage.querySelector("[data-lesson01-parameter-answer]").textContent).toContain("≠0");
    stage.querySelector("[data-lesson01-case-new='parameter']").click();
    expect(stage.querySelector("[data-lesson01-parameter-coefficient]").getAttribute("aria-label")).toContain("|");
    expect(stage.querySelector("[data-lesson01-parameter-exponent]").getAttribute("aria-label")).toContain("|");
    lesson.destroy();
  });

  it("updates the real-world model and makes the negative solution misconception visible", () => {
    const stage = document.createElement("main");
    const lesson = lesson01.renderLesson01(stage, { step: 5, onStepChange() {} });

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
