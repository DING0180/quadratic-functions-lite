// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { createParabolaPortal } from "../src/portal-transition.js";

afterEach(() => {
  vi.useRealTimers();
  sessionStorage.clear();
  document.body.replaceChildren();
});

function setupPortal({ reducedMotion = false } = {}) {
  vi.useFakeTimers();
  const home = document.createElement("main");
  home.className = "home-shell";
  home.innerHTML = '<div class="home-graph-host"><svg class="parabola-svg" viewBox="0 0 520 360"><g class="parabola-grid"></g><path class="parabola-curve" d="M0 0"></path><circle class="home-vertex-handle" cx="260" cy="180" r="8"></circle></svg></div>';
  const trigger = document.createElement("a");
  trigger.className = "home-start-learning";
  home.append(trigger);
  document.body.append(home);
  const onComplete = vi.fn();
  const portal = createParabolaPortal({ onComplete, reducedMotion: () => reducedMotion });
  return { home, trigger, onComplete, portal };
}

describe("Parabola Portal transition", () => {
  it("runs the 2.4 second first-entry sequence once and then cleans up", () => {
    const { home, trigger, onComplete, portal } = setupPortal();

    expect(portal.start({ home, trigger })).toBe(true);
    expect(portal.start({ home, trigger })).toBe(false);
    expect(home.classList.contains("home-is-entering")).toBe(true);
    expect(trigger.getAttribute("aria-disabled")).toBe("true");
    expect(document.documentElement.classList.contains("portal-is-active")).toBe(true);
    expect(document.body.classList.contains("portal-is-active")).toBe(true);
    expect(document.querySelector(".parabola-portal").dataset.portalMode).toBe("full");
    expect(document.querySelectorAll(".parabola-portal .portal-math-item")).toHaveLength(6);

    vi.advanceTimersByTime(2399);
    expect(onComplete).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(document.querySelector(".parabola-portal")).toBeNull();
    expect(home.classList.contains("home-is-entering")).toBe(false);
    expect(document.documentElement.classList.contains("portal-is-active")).toBe(false);
    expect(document.body.classList.contains("portal-is-active")).toBe(false);
  });

  it("builds a flyby tunnel so fixed formulas can pass the learner", () => {
    const { home, trigger, portal } = setupPortal();

    portal.start({ home, trigger });

    const overlay = document.querySelector(".parabola-portal");
    expect(overlay.dataset.portalScene).toBe("black-hole");
    expect(overlay.dataset.portalMotion).toBe("flyby");
    expect(overlay.querySelector(".portal-black-hole")).not.toBeNull();
    expect(overlay.querySelectorAll(".portal-depth-ring")).toHaveLength(5);
    expect([...overlay.querySelectorAll(".portal-math-item")].every((item) => item.dataset.portalTrajectory === "flyby")).toBe(true);
    expect([...overlay.querySelectorAll(".portal-math-item")].map((item) => item.textContent)).toEqual([
      "y = x²",
      "x = (−b ± √(b² − 4ac)) / 2a",
      "Δ = b² − 4ac",
      "y = a(x − h)² + k",
      "vertex",
      "axis of symmetry",
    ]);
  });

  it("uses the compact sequence after the session has seen the full portal", () => {
    sessionStorage.setItem("parabola-portal-seen", "true");
    const { home, trigger, onComplete, portal } = setupPortal();

    portal.start({ home, trigger });
    expect(document.querySelector(".parabola-portal").dataset.portalMode).toBe("compact");
    expect(document.querySelector(".parabola-portal").dataset.portalMotion).toBeUndefined();
    expect(document.querySelectorAll(".parabola-portal .portal-math-item")).toHaveLength(0);
    vi.advanceTimersByTime(720);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("uses the accessible 340ms fade instead of a tunnel when motion is reduced", () => {
    const { home, trigger, onComplete, portal } = setupPortal({ reducedMotion: true });

    portal.start({ home, trigger });
    expect(document.querySelector(".parabola-portal").dataset.portalMode).toBe("reduced");
    expect(document.querySelector(".parabola-portal").dataset.portalMotion).toBeUndefined();
    expect(document.querySelectorAll(".parabola-portal .portal-math-item")).toHaveLength(0);
    vi.advanceTimersByTime(340);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("can be cancelled during a return to Home without leaving portal DOM behind", () => {
    const { home, trigger, onComplete, portal } = setupPortal();

    portal.start({ home, trigger });
    portal.cancel();
    vi.advanceTimersByTime(4000);
    expect(onComplete).not.toHaveBeenCalled();
    expect(document.querySelector(".parabola-portal")).toBeNull();
    expect(home.classList.contains("home-is-entering")).toBe(false);
    expect(trigger.hasAttribute("aria-disabled")).toBe(false);
  });
});

