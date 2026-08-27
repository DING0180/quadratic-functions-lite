// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { createHomeLanding } from "../src/home.js";

afterEach(() => {
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

describe("homepage mathematical motion", () => {
  it("removes the duplicate learning journey and makes the highlighted vertex directly manipulable", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }));

    const home = createHomeLanding();
    document.body.append(home.element);
    const graphHost = home.element.querySelector(".home-graph-host");

    expect(home.element.querySelector(".home-learning-journey")).toBeNull();
    const vertex = home.element.querySelector(".home-vertex-handle");
    expect(vertex).not.toBeNull();
    expect(vertex.getAttribute("role")).toBe("slider");
    expect(vertex.getAttribute("aria-valuetext")).toBe("顶点 V(1, −2)");

    const svg = home.element.querySelector(".parabola-svg");
    svg.getBoundingClientRect = () => ({ left: 0, top: 0, width: 358, height: 288 });
    const renderedScale = 358 / 520;
    const clientX = (26 + ((2 + 3) / 8) * 468) * renderedScale;
    const clientY = (288 - 360 * renderedScale) / 2 + (334 - ((-1 + 4) / 14) * 308) * renderedScale;

    vertex.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true, clientX, clientY }));
    graphHost.dispatchEvent(new MouseEvent("pointermove", { bubbles: true, clientX, clientY }));
    graphHost.dispatchEvent(new MouseEvent("pointerup", { bubbles: true, clientX, clientY }));

    expect(home.element.querySelector(".parabola-symmetry-axis").dataset.axisX).toBe("2");
    expect(home.element.querySelector(".home-graph-caption").textContent).toBe("顶点 V(2, −1) · 对称轴 x = 2");
    expect(home.element.querySelector(".home-general-form").getAttribute("aria-label")).toBe("一般式：y 等于 x 平方减 4x 加 3");
    home.destroy();
  });

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

