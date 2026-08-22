import { describe, expect, it } from "vitest";
import {
  BASE_POINTS,
  SHIFTED_POINTS,
  TRANSLATION_ARROWS,
  formatLesson04Formula,
  getLesson04Properties,
} from "../src/lessons/lesson04-state.js";

describe("Lesson 04 migration mathematics", () => {
  it("keeps the legacy point tables and nine unit-right translations", () => {
    expect(BASE_POINTS).toEqual([
      { x: -4, y: 16 }, { x: -3, y: 9 }, { x: -2, y: 4 },
      { x: -1, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 1 },
      { x: 2, y: 4 }, { x: 3, y: 9 }, { x: 4, y: 16 },
    ]);
    expect(SHIFTED_POINTS).toHaveLength(10);
    expect(SHIFTED_POINTS.at(-1)).toEqual({ x: 5, y: 16 });
    expect(TRANSLATION_ARROWS).toHaveLength(9);
    expect(TRANSLATION_ARROWS.every(({ from, to, label }) => (
      to.x === from.x + 1 && to.y === from.y && label === "+1"
    ))).toBe(true);
  });

  it("derives the legacy horizontal-shift properties from a and h", () => {
    expect(getLesson04Properties({ a: -0.5, h: 3 })).toMatchObject({
      opening: "向下",
      vertex: { x: 3, y: 0 },
      axisLatex: "x=3",
      shift: "向右平移 3 个单位",
      monotonicity: "在 x<3 时递增，在 x>3 时递减",
      extremum: "最大值是 0",
    });
    expect(formatLesson04Formula({ a: -1 / 3, h: -4 })).toBe("y=-\\frac{1}{3}(x+4)^2");
  });

  it("rejects a zero coefficient or non-finite parameters", () => {
    expect(() => getLesson04Properties({ a: 0, h: 1 })).toThrow();
    expect(() => formatLesson04Formula({ a: 1, h: Infinity })).toThrow();
  });
});
