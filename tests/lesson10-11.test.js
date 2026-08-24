// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { LESSON10_STEP_TITLES, renderLesson10 } from "../src/lessons/lesson10.js";
import { LESSON11_STEP_TITLES, renderLesson11 } from "../src/lessons/lesson11.js";

afterEach(() => document.body.replaceChildren());

describe("Lesson 10 and Lesson 11 classroom routes", () => {
  it("opens the new lessons from their existing sidebar hash routes", async () => {
    document.body.innerHTML = '<div id="app"></div>';
    window.history.replaceState(null, "", "/#lesson-11/step-07");

    await import("../src/main.js?lesson10-11-route-test=" + Date.now());

    expect(window.location.hash).toBe("#lesson-11/step-07");
    expect(document.querySelector(".lesson11-step")).not.toBeNull();
    expect(document.querySelector("[data-lesson11-width]")).not.toBeNull();
  });

  it("defines an eight-step profit lesson with a hidden random-practice answer", () => {
    expect(LESSON10_STEP_TITLES).toHaveLength(8);
    const stage = document.createElement("main");
    const lesson = renderLesson10(stage, { step: 8, onStepChange() {}, random: () => 0 });

    expect(stage.querySelector("[data-lesson10-practice-answer]").hidden).toBe(true);
    stage.querySelector("[data-lesson10-reveal-practice]").click();
    expect(stage.querySelector("[data-lesson10-practice-answer]").hidden).toBe(false);
    lesson.destroy();
  });

  it("defines a nine-step arch-model lesson whose controls update key points", () => {
    expect(LESSON11_STEP_TITLES).toHaveLength(9);
    const stage = document.createElement("main");
    const lesson = renderLesson11(stage, { step: 7, onStepChange() {} });
    const width = stage.querySelector("[data-lesson11-width]");

    width.value = "10";
    width.dispatchEvent(new Event("input", { bubbles: true }));
    expect(stage.querySelector("[data-lesson11-key-points]").textContent).toContain("(-5, 0)");
    lesson.destroy();
  });

  it("keeps Lesson 11 random-practice answers hidden until Reveal", () => {
    const stage = document.createElement("main");
    const lesson = renderLesson11(stage, { step: 9, onStepChange() {}, random: () => 0 });

    expect(stage.querySelector("[data-lesson11-practice-answer]").hidden).toBe(true);
    stage.querySelector("[data-lesson11-reveal-practice]").click();
    expect(stage.querySelector("[data-lesson11-practice-answer]").hidden).toBe(false);
    lesson.destroy();
  });
});
