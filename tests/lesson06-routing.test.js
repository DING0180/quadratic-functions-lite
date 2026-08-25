// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { getLessonById } from "../src/course.js";

afterEach(() => {
  document.body.replaceChildren();
  window.history.replaceState(null, "", "/");
});

describe("Lesson 06 classroom routing", () => {
  it("clamps a removed Lesson 06 step route to the final five-step lesson screen", async () => {
    document.body.innerHTML = '<div id="app"></div>';
    window.history.replaceState(null, "", "/#lesson-06/step-07");

    await import("../src/main.js?lesson06-route-test=" + Date.now());

    expect(getLessonById("lesson-06").title).toBe("一般式与顶点式的转换");
    expect(window.location.hash).toBe("#lesson-06/step-07");
    expect(document.querySelector(".lesson06-step")).not.toBeNull();
    expect(document.querySelector(".lesson06-kicker").textContent).toContain("05 / 05");
  });
});
