// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { createHomeLanding } from "../src/home.js";

afterEach(() => {
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

describe("homepage mathematical motion", () => {
  it("continuously moves the vertex from the base parabola to the formal course graph", () => {
    const animationFrames = [];
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    vi.stubGlobal("requestAnimationFrame", (callback) => {
      animationFrames.push(callback);
      return animationFrames.length;
    });
    vi.stubGlobal("cancelAnimationFrame", () => {});

    const home = createHomeLanding();
    document.body.append(home.element);

    const graph = home.element.querySelector(".parabola-svg");
    const equation = home.element.querySelector(".home-equation");
    const caption = home.element.querySelector(".home-graph-caption");

    expect(graph.querySelector(".parabola-symmetry-axis").dataset.axisX).toBe("0");
    expect(equation.getAttribute("aria-label")).toBe("y 等于 x 平方");
    expect(caption.textContent).toBe("顶点 V(0, 0) · 对称轴 x = 0");

    animationFrames.shift()(0);
    animationFrames.shift()(1200);
    const movingAxis = home.element.querySelector(".parabola-symmetry-axis").dataset.axisX;
    expect(Number(movingAxis)).toBeGreaterThan(0);
    expect(Number(movingAxis)).toBeLessThan(1);

    animationFrames.shift()(2500);
    expect(home.element.querySelector(".parabola-symmetry-axis").dataset.axisX).toBe("1");
    expect(equation.getAttribute("aria-label")).toBe("y 等于 x 减一的平方减二");
    expect(caption.textContent).toBe("顶点 V(1, −2) · 对称轴 x = 1");
    home.destroy();
  });

  it("uses the stable final graph immediately when reduced motion is preferred", () => {
    const animationFrame = vi.fn();
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    vi.stubGlobal("requestAnimationFrame", animationFrame);
    vi.stubGlobal("cancelAnimationFrame", () => {});

    const home = createHomeLanding();
    document.body.append(home.element);

    expect(home.element.querySelector(".parabola-symmetry-axis").dataset.axisX).toBe("1");
    expect(home.element.querySelector(".home-equation").getAttribute("aria-label")).toBe("y 等于 x 减一的平方减二");
    expect(animationFrame).not.toHaveBeenCalled();
    home.destroy();
  });
});
