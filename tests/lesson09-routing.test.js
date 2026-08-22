// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";

afterEach(() => {
  document.body.replaceChildren();
  window.history.replaceState(null, "", "/");
});

describe("Lesson 09 classroom routing", () => {
  it("opens a ten-step Lesson 09 stage from the existing sidebar hash route", async () => {
    document.body.innerHTML = '<div id="app"></div>';
    window.history.replaceState(null, "", "/#lesson-09/step-03");

    await import("../src/main.js?lesson09-route-test=" + Date.now());

    expect(window.location.hash).toBe("#lesson-09/step-03");
    expect(document.querySelector(".lesson09-step")).not.toBeNull();
    expect(document.querySelector(".lesson09-kicker").textContent).toContain("03 / 10");
  });
});

