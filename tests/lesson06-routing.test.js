// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { getLessonById } from "../src/course.js";

afterEach(() => {
  document.body.replaceChildren();
  window.history.replaceState(null, "", "/");
});

describe("Lesson 06 classroom routing", () => {
  it("opens the eight-step general-form to vertex-form lesson from the shared sidebar route", async () => {
    document.body.innerHTML = '<div id="app"></div>';
    window.history.replaceState(null, "", "/#lesson-06/step-07");

    await import("../src/main.js?lesson06-route-test=" + Date.now());

    expect(getLessonById("lesson-06").title).toBe("一般式与顶点式的转换");
    expect(window.location.hash).toBe("#lesson-06/step-07");
    expect(document.querySelector(".lesson06-step")).not.toBeNull();
    expect(document.querySelector(".lesson06-kicker").textContent).toContain("07 / 08");
  });
});
