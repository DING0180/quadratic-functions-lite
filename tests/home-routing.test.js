// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";

afterEach(() => {
  document.body.replaceChildren();
  window.history.replaceState(null, "", "/");
});

describe("home landing route", () => {
  it("shows the independent welcome screen before lessons and enters Lesson 01", async () => {
    document.body.innerHTML = '<div id="app"></div>';
    window.history.replaceState(null, "", "/");

    await import("../src/main.js?home-route-test=" + Date.now());

    const home = document.querySelector(".home-shell");
    expect(home).not.toBeNull();
    expect(home.textContent).toContain("重庆德普外国语学校");
    expect(home.textContent).toContain("双语初中数学组");
    expect(home.textContent).toContain("二次函数互动课堂");
    expect(home.textContent).toContain("Quadratic Functions");
    expect(home.querySelector(".home-school-logo").getAttribute("alt")).toBe("重庆德普外国语学校校徽");
    expect(home.querySelector(".home-math-visual .parabola-svg")).not.toBeNull();

    const startLearning = home.querySelector(".home-start-learning");
    expect(startLearning.getAttribute("href")).toBe("#lesson-01/step-01");

    window.location.hash = startLearning.getAttribute("href");
    window.dispatchEvent(new HashChangeEvent("hashchange"));

    expect(document.querySelector(".home-shell")).toBeNull();
    expect(document.querySelector(".classroom")).not.toBeNull();
    expect(document.querySelector(".lesson01-step")).not.toBeNull();
  });
});
