// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";

afterEach(() => {
  document.body.replaceChildren();
  window.history.replaceState(null, "", "/");
});

describe("Lesson 01 classroom routing", () => {
  it("opens the local five-step concept lesson from the existing sidebar hash route", async () => {
    document.body.innerHTML = '<div id="app"></div>';
    window.history.replaceState(null, "", "/#lesson-01/step-03");

    await import("../src/main.js?lesson01-route-test=" + Date.now());

    expect(window.location.hash).toBe("#lesson-01/step-03");
    expect(document.querySelector(".lesson01-step")).not.toBeNull();
    expect(document.querySelector(".lesson01-kicker").textContent).toContain("03 / 05");
    expect(document.querySelectorAll(".sidebar")).toHaveLength(1);
  });

  it("normalizes the removed summary route back to the first lesson step", async () => {
    document.body.innerHTML = '<div id="app"></div>';
    window.history.replaceState(null, "", "/#lesson-01/step-08");

    await import("../src/main.js?lesson01-last-step-test=" + Date.now());

    expect(window.location.hash).toBe("#lesson-01/step-01");
    expect(document.querySelector(".lesson01-kicker").textContent).toContain("01 / 05");
    expect(document.querySelector(".lesson01-title").textContent).toContain("一次函数");
  });
});
