// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";

afterEach(() => {
  document.body.replaceChildren();
  window.history.replaceState(null, "", "/");
});

describe("Lesson 04 classroom routing", () => {
  it("opens a local Lesson 4 step from the existing sidebar hash route", async () => {
    document.body.innerHTML = '<div id="app"></div>';
    window.history.replaceState(null, "", "/#lesson-04/step-03");

    await import("../src/main.js?lesson04-route-test=" + Date.now());

    expect(window.location.hash).toBe("#lesson-04/step-03");
    expect(document.querySelector(".lesson04-step")).not.toBeNull();
    expect(document.querySelector(".lesson04-kicker").textContent).toContain("03 / 04");
  });
});
