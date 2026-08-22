// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { createParabolaGraph } from "../src/graph/parabola-svg.js";

describe("parabola SVG", () => {
  it("renders axes and one y=ax² curve", () => {
    const container = document.createElement("div");

    createParabolaGraph(container, {
      curves: [{ a: 1, color: "#2563eb" }],
    });

    expect(container.querySelectorAll(".parabola-axis")).toHaveLength(2);
    expect(container.querySelectorAll(".parabola-curve")).toHaveLength(1);
  });

  it("updates curve progress and shown point markers", () => {
    const container = document.createElement("div");
    const graph = createParabolaGraph(container, {
      curves: [{ a: 1 }],
      points: [],
    });

    graph.update({
      curveProgress: 0.5,
      points: [[0, 0], [1, 1]],
    });

    expect(container.querySelectorAll(".parabola-point")).toHaveLength(2);
    expect(container.querySelector(".parabola-curve").getAttribute("stroke-dasharray")).not.toBeNull();
  });

  it("moves a curve vertically when its constant term changes", () => {
    const baseContainer = document.createElement("div");
    const shiftedContainer = document.createElement("div");

    createParabolaGraph(baseContainer, { curves: [{ a: 1, k: 0 }] });
    createParabolaGraph(shiftedContainer, { curves: [{ a: 1, k: 2 }] });

    expect(shiftedContainer.querySelector(".parabola-curve").getAttribute("d"))
      .not.toBe(baseContainer.querySelector(".parabola-curve").getAttribute("d"));
  });
});
