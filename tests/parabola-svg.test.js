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

  it("keeps fixed integer tick marks and marks both positive axis directions", () => {
    const container = document.createElement("div");

    createParabolaGraph(container, {
      curves: [{ a: 4 }, { a: -4 }],
    });

    const ticks = Array.from(container.querySelectorAll(".parabola-tick"), (tick) => tick.textContent);
    expect(ticks).toEqual(["-4", "-3", "-2", "-1", "1", "2", "3", "4", "-16", "-12", "-8", "-4", "4", "8", "12", "16"]);
    expect(container.querySelectorAll(".parabola-axis-arrow")).toHaveLength(1);
    expect(Array.from(container.querySelectorAll(".parabola-axis"), (axis) => axis.getAttribute("marker-end")))
      .toEqual([expect.stringContaining("axis-arrow"), expect.stringContaining("axis-arrow")]);
    expect(Array.from(container.querySelectorAll(".parabola-axis-name"), (label) => label.textContent)).toEqual(["x", "y"]);
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

  it("supports one emphasized observation point", () => {
    const container = document.createElement("div");
    const graph = createParabolaGraph(container, { curves: [{ a: 1 }] });

    graph.update({ points: [{ x: 1, y: 1, radius: 9, color: "#19735d" }] });

    const point = container.querySelector(".parabola-point");
    expect(point.getAttribute("r")).toBe("9");
    expect(point.getAttribute("fill")).toBe("#19735d");
  });

  it("renders optional labelled translation arrows", () => {
    const container = document.createElement("div");

    createParabolaGraph(container, {
      arrows: [{
        from: { x: 0, y: 0 },
        to: { x: 1, y: 0 },
        color: "#b45f06",
        label: "+1",
      }],
    });

    expect(container.querySelectorAll(".parabola-arrow")).toHaveLength(3);
    expect(container.querySelectorAll(".parabola-arrow-label")).toHaveLength(1);
    expect(container.querySelector(".parabola-arrow-label").textContent).toBe("+1");
  });

  it("uses an optional viewport so Lesson 4 can show its tenth shifted point", () => {
    const container = document.createElement("div");

    createParabolaGraph(container, {
      viewport: { xMin: -4, xMax: 5, yMin: -4, yMax: 28 },
      points: [{ x: -4, y: 25 }, { x: 5, y: 16 }],
    });

    const points = container.querySelectorAll(".parabola-point");
    expect(Number(points[0].getAttribute("cy"))).toBeGreaterThan(38);
    expect(Number(points[1].getAttribute("cx"))).toBeLessThanOrEqual(482);
  });

  it("moves a curve vertically when its constant term changes", () => {
    const baseContainer = document.createElement("div");
    const shiftedContainer = document.createElement("div");

    createParabolaGraph(baseContainer, { curves: [{ a: 1, k: 0 }] });
    createParabolaGraph(shiftedContainer, { curves: [{ a: 1, k: 2 }] });

    expect(shiftedContainer.querySelector(".parabola-curve").getAttribute("d"))
      .not.toBe(baseContainer.querySelector(".parabola-curve").getAttribute("d"));
  });

  it("moves a curve horizontally when its vertex h changes", () => {
    const baseContainer = document.createElement("div");
    const shiftedContainer = document.createElement("div");

    createParabolaGraph(baseContainer, { curves: [{ a: 1, h: 0 }] });
    createParabolaGraph(shiftedContainer, { curves: [{ a: 1, h: 2 }] });

    expect(shiftedContainer.querySelector(".parabola-curve").getAttribute("d"))
      .not.toBe(baseContainer.querySelector(".parabola-curve").getAttribute("d"));
  });
});
