// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";

afterEach(() => {
  document.body.replaceChildren();
  window.history.replaceState(null, "", "/");
});

describe("Lesson 07 classroom routing", () => {
  it("opens a local Lesson 07 step from the existing sidebar hash route", async () => {
    document.body.innerHTML = '<div id="app"></div>';
    window.history.replaceState(null, "", "/#lesson-07/step-04");

    await import("../src/main.js?lesson07-route-test=" + Date.now());

    expect(window.location.hash).toBe("#lesson-07/step-04");
    expect(document.querySelector(".lesson07-step")).not.toBeNull();
    expect(document.querySelector(".lesson07-kicker").textContent).toContain("04 / 07");
  });
});

