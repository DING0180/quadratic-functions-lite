// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { renderLesson02 } from "../src/lessons/lesson02.js";
import { renderLesson03 } from "../src/lessons/lesson03.js";
import { renderLesson04 } from "../src/lessons/lesson04.js";
import { renderLesson05 } from "../src/lessons/lesson05.js";
import { renderLesson07 } from "../src/lessons/lesson07.js";
import { renderLesson08 } from "../src/lessons/lesson08.js";
import { renderLesson09 } from "../src/lessons/lesson09.js";

afterEach(() => document.body.replaceChildren());

describe("shared graph workspace classroom layout", () => {
  it("marks representative graph workbenches as shared split classrooms", () => {
    const candidates = [
      [renderLesson02, 2], [renderLesson03, 4], [renderLesson04, 1], [renderLesson05, 2],
      [renderLesson07, 2], [renderLesson08, 2], [renderLesson09, 1],
    ];

    candidates.forEach(([render, step]) => {
      const stage = document.createElement("main");
      const lesson = render(stage, { step, onStepChange() {}, random: () => 0 });
      const split = stage.querySelector(".classroom-split");

      expect(split, render.name + " step " + step + " should use the shared split").not.toBeNull();
      expect(split.querySelector(":scope > .classroom-workspace")).not.toBeNull();
      expect(split.querySelector(":scope > .classroom-visualization .parabola-svg")).not.toBeNull();
      expect(split.querySelectorAll(".classroom-workspace button, .classroom-workspace input, .classroom-workspace select").length).toBeGreaterThan(0);
      lesson.destroy();
    });
  });
});
