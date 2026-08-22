import { describe, expect, it } from "vitest";
import {
  LESSON03_POINT_X_VALUES,
  createLesson03PointState,
  describeLesson03Function,
} from "../src/lessons/lesson03-state.js";

describe("Lesson 03 teaching state", () => {
  it("keeps the nine original x-values and adds k only to every y-value", () => {
    expect(LESSON03_POINT_X_VALUES).toEqual([-4, -3, -2, -1, 0, 1, 2, 3, 4]);

    const state = createLesson03PointState(1);
    state.plot(-2);
    state.plot(0);

    expect(state.rows).toEqual([
      { x: -2, baseY: 4, shiftedY: 5, delta: 1 },
      { x: 0, baseY: 0, shiftedY: 1, delta: 1 },
    ]);
  });

  it("describes the vertex and extremum of y=ax²+k from the real parameters", () => {
    expect(describeLesson03Function({ a: 1, k: -2 })).toMatchObject({
      vertex: "(0, -2)",
      axis: "x=0",
      opening: "向上",
      extremum: "最小值 -2",
    });

    expect(describeLesson03Function({ a: -1, k: 3 })).toMatchObject({
      vertex: "(0, 3)",
      opening: "向下",
      extremum: "最大值 3",
    });
  });
});
