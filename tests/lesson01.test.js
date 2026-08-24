// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import * as lesson01 from "../src/lessons/lesson01.js";

afterEach(() => document.body.replaceChildren());

describe("Lesson 01 quadratic-function concepts", () => {
  it("reveals a vertical quadratic comparison only after the linear examples", () => {
    const stage = document.createElement("main");
    const lesson = lesson01.renderLesson01(stage, { step: 1, onStepChange() {} });

    expect(lesson01.LESSON01_STEP_TITLES).toHaveLength(5);
    expect(stage.querySelector(".lesson01-compare-grid")).not.toBeNull();
    expect(stage.querySelector(".lesson01-linear-group .lesson01-example-grid").classList).toContain("is-vertical");
    expect(stage.querySelector(".lesson01-quadratic-group .lesson01-example-grid").classList).toContain("is-vertical");
    expect(stage.querySelectorAll("[data-lesson01-linear-example]")).toHaveLength(3);
    expect(stage.querySelectorAll("[data-lesson01-quadratic-example]")).toHaveLength(3);
    expect(stage.querySelector(".lesson01-quadratic-group").hidden).toBe(true);
    expect(stage.querySelector("[data-lesson01-linear-form]").hidden).toBe(false);
    expect(stage.querySelector("[data-lesson01-quadratic-form]").hidden).toBe(true);

    const advance = stage.querySelector("[data-lesson01-bridge-advance]");
    advance.click();
    expect(stage.querySelector(".lesson01-quadratic-group").hidden).toBe(false);
    expect(stage.querySelector("[data-lesson01-quadratic-form]").hidden).toBe(false);
    expect(advance.disabled).toBe(false);
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
  it("keeps the original formula while colored copies move into term cards", async () => {
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
    expect(stage.querySelector("[data-lesson01-flight-token='quadratic']").classList).toContain("is-flip-moving");
    expect(source).toContain(quadraticToken);
    expect(quadraticToken.classList).toContain("is-quadratic");
    await new Promise((resolve) => window.setTimeout(resolve));
    expect(source).toContain(quadraticToken);
    expect(quadraticSlot.querySelector("[data-lesson01-decomposed-token='quadratic']")).not.toBeNull();
    expect(quadraticCard.classList).toContain("is-revealed");
    expect(quadraticCard.querySelector("[data-lesson01-token-label]").hidden).toBe(false);
    advance.click();
    await new Promise((resolve) => window.setTimeout(resolve));
    expect(stage.querySelector("[data-lesson01-token-slot='linear'] [data-lesson01-decomposed-token='linear']")).not.toBeNull();
    advance.click();
    await new Promise((resolve) => window.setTimeout(resolve));
    expect(stage.querySelector("[data-lesson01-token-slot='constant'] [data-lesson01-decomposed-token='constant']")).not.toBeNull();
    expect(advance.disabled).toBe(false);
    expect(advance.textContent).toContain("二次项系数 a");
    advance.click();
    expect(stage.querySelector("[data-lesson01-coefficient-token='quadratic']").classList).toContain("is-coefficient-emphasized");
    expect(stage.querySelector("[data-lesson01-coefficient-callout='quadratic']").hidden).toBe(false);
    expect(advance.textContent).toContain("一次项系数 b");
    advance.click();
    expect(stage.querySelector("[data-lesson01-coefficient-token='linear']").classList).toContain("is-coefficient-emphasized");
    expect(stage.querySelector("[data-lesson01-coefficient-callout='linear']").hidden).toBe(false);
    expect(advance.disabled).toBe(true);
    lesson.destroy();
  });

  it("reveals a copied term after the FLIP safety timeout when an animation completion signal stalls", async () => {
    vi.useFakeTimers();
    const stage = document.createElement("main");
    const lesson = lesson01.renderLesson01(stage, { step: 2, onStepChange() {} });
    const originalAnimate = HTMLElement.prototype.animate;
    HTMLElement.prototype.animate = () => ({ finished: new Promise(() => {}) });

    stage.querySelector("[data-lesson01-decompose-advance]").click();
    await vi.advanceTimersByTimeAsync(650);

    expect(stage.querySelector("[data-lesson01-token-label='quadratic']").hidden).toBe(false);
    lesson.destroy();
    HTMLElement.prototype.animate = originalAnimate;
    vi.useRealTimers();
  });

  it("asks all four term and coefficient questions and reveals each answer on the original formula", () => {
    const stage = document.createElement("main");
    const lesson = lesson01.renderLesson01(stage, { step: 3, onStepChange() {}, random: () => 0 });
    expect(stage.querySelector("[data-lesson01-practice-prompt]").textContent).toContain("二次项");
    expect(stage.querySelector("[data-lesson01-practice-function]").getAttribute("aria-label")).toContain("−3x²");
    expect(stage.querySelector("[data-lesson01-practice-answer-term='quadratic']")).toBeNull();
    stage.querySelector("[data-lesson01-practice-check]").click();
    expect(stage.querySelector("[data-lesson01-practice-term='quadratic']").classList).toContain("is-answer-term");
    stage.querySelector("[data-lesson01-practice-reset]").click();
    expect(stage.querySelector("[data-lesson01-practice-prompt]").textContent).toContain("二次项系数");
    stage.querySelector("[data-lesson01-practice-check]").click();
    expect(stage.querySelector("[data-lesson01-practice-coefficient='quadratic']").classList).toContain("is-answer-coefficient");
    stage.querySelector("[data-lesson01-practice-reset]").click();
    expect(stage.querySelector("[data-lesson01-practice-prompt]").textContent).toContain("一次项");
    stage.querySelector("[data-lesson01-practice-reset]").click();
    expect(stage.querySelector("[data-lesson01-practice-prompt]").textContent).toContain("一次项系数");
    lesson.destroy();
  });

  it("shows one selected problem type at a time and keeps its new-problem interaction", () => {
    const stage = document.createElement("main");
    const lesson = lesson01.renderLesson01(stage, { step: 4, onStepChange() {}, random: () => 0 });

    const selector = stage.querySelector("[data-lesson01-case-selector]");
    expect(stage.querySelectorAll("[data-lesson01-case]")).toHaveLength(1);
    expect(selector.value).toBe("standard");
    const standardFormula = stage.querySelector("[data-lesson01-case-formula='standard']");
    const before = standardFormula.getAttribute("aria-label");
    stage.querySelector("[data-lesson01-case-new='standard']").click();
    expect(standardFormula.getAttribute("aria-label")).not.toBe(before);

    selector.value = "simplify";
    selector.dispatchEvent(new Event("change", { bubbles: true }));
    expect(stage.querySelectorAll("[data-lesson01-case]")).toHaveLength(1);
    expect(stage.querySelector("[data-lesson01-case-new='simplify']")).not.toBeNull();

    selector.value = "parameter";
    selector.dispatchEvent(new Event("change", { bubbles: true }));
    expect(stage.querySelectorAll("[data-lesson01-case]")).toHaveLength(1);
    expect(stage.querySelector("[data-lesson01-case-new='parameter']")).not.toBeNull();
    expect(stage.querySelector("[data-lesson01-parameter-coefficient]").getAttribute("aria-label")).toBe("(m+3)");
    expect(stage.querySelector("[data-lesson01-parameter-exponent]").getAttribute("aria-label")).toContain("m²−2m+1");
    expect(stage.querySelector("[data-lesson01-parameter-green-gate]").textContent).toContain("x 的最高次数必须等于 2");
    expect(stage.querySelector("[data-lesson01-parameter-red-gate]").textContent).toContain("二次项系数必须不等于 0");
    expect(stage.querySelector("[data-lesson01-parameter-answer]").hidden).toBe(true);
    stage.querySelector("[data-lesson01-case-reveal='parameter']").click();
    expect(stage.querySelector("[data-lesson01-parameter-green-work]").textContent).toContain("m²−2m+1 = 2");
    expect(stage.querySelector("[data-lesson01-parameter-red-work]").textContent).toContain("(m+3) ≠ 0");
    expect(stage.querySelector("[data-lesson01-parameter-answer]").textContent).toContain("同时通过");
    stage.querySelector("[data-lesson01-case-new='parameter']").click();
    expect(stage.querySelector("[data-lesson01-parameter-coefficient]").getAttribute("aria-label")).toBe("(|p−2|)");
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

