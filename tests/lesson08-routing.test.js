// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";

afterEach(() => {
  document.body.replaceChildren();
  window.history.replaceState(null, "", "/");
});

describe("Lesson 08 classroom routing", () => {
  it("opens a local twelve-step Lesson 08 stage from the existing sidebar hash route", async () => {
    document.body.innerHTML = '<div id="app"></div>';
    window.history.replaceState(null, "", "/#lesson-08/step-04");

    await import("../src/main.js?lesson08-route-test=" + Date.now());

    expect(window.location.hash).toBe("#lesson-08/step-04");
    expect(document.querySelector(".lesson08-step")).not.toBeNull();
    expect(document.querySelector(".lesson08-kicker").textContent).toContain("04 / 12");
  });
});

