import { describe, expect, it } from "vitest";
import {
  BASE_POINTS,
  SHIFTED_POINTS,
  TRANSLATION_ARROWS,
  createLesson04QuickCheck,
  formatLesson04Formula,
  getLesson04Properties,
} from "../src/lessons/lesson04-state.js";

describe("Lesson 04 migration mathematics", () => {
  it("uses the same nine x-values for blue y=x² points and red y=(x-1)² points", () => {
    expect(BASE_POINTS).toEqual([
      { x: -4, y: 16 }, { x: -3, y: 9 }, { x: -2, y: 4 },
      { x: -1, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 1 },
      { x: 2, y: 4 }, { x: 3, y: 9 }, { x: 4, y: 16 },
    ]);
    expect(SHIFTED_POINTS).toEqual([
      { x: -4, y: 25 }, { x: -3, y: 16 }, { x: -2, y: 9 },
      { x: -1, y: 4 }, { x: 0, y: 1 }, { x: 1, y: 0 },
      { x: 2, y: 1 }, { x: 3, y: 4 }, { x: 4, y: 9 },
    ]);
    expect(SHIFTED_POINTS.map(({ x }) => x)).toEqual(BASE_POINTS.map(({ x }) => x));
    expect(SHIFTED_POINTS.find(({ x }) => x === 1)).toEqual({ x: 1, y: 0 });
    expect(TRANSLATION_ARROWS).toHaveLength(8);
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

  it("creates a checkable random y=a(x-h)² challenge with its derived properties", () => {
    const challenge = createLesson04QuickCheck(() => 0);

    expect(challenge).toMatchObject({
      a: 1,
      h: -3,
      formula: "y=(x+3)^2",
      direction: "向左",
      units: 3,
      axis: "x=-3",
      vertex: { x: -3, y: 0 },
      monotonicity: "在 x<-3 时递减，在 x>-3 时递增",
    });
  });
});
