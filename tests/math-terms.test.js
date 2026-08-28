import { describe, expect, it } from "vitest";
import { TERMS, UI, STEP_SUBTITLES, getStepSubtitle, term } from "../src/math-terms.js";

describe("shared bilingual mathematics terminology", () => {
  it("formats every canonical term consistently", () => {
    expect(term("quadraticFunction")).toBe("二次函数 (quadratic function)");
    expect(term("vertex")).toBe("顶点 (vertex)");
    expect(term("axisOfSymmetry")).toBe("对称轴 (axis of symmetry)");
    expect(TERMS.generalForm.en).toBe("general form");
    expect(TERMS.vertexForm.en).toBe("vertex form");
    expect(TERMS.discriminant.en).toBe("discriminant");
  });

  it("provides concise reusable classroom UI labels", () => {
    expect(UI.previous).toBe("Previous");
    expect(UI.next).toBe("Next");
    expect(UI.revealAnswer).toBe("Reveal Answer");
    expect(UI.newQuestion).toBe("New Question");
  });

  it("provides a subtitle for every lesson step", () => {
    expect(Object.keys(STEP_SUBTITLES)).toHaveLength(11);
    expect(getStepSubtitle("lesson-01", 1)).toBe("Bridge In: Linear to Quadratic Functions");
    expect(getStepSubtitle("lesson-06", 2)).toBe("Teacher Demonstration: Completing the Square");
    expect(getStepSubtitle("lesson-11", 9)).toBe("Bridge Out: From a Model to a Function");
    expect(() => term("turningPoint")).toThrow(RangeError);
    expect(() => getStepSubtitle("lesson-12", 1)).toThrow(RangeError);
    expect(() => getStepSubtitle("lesson-01", 0)).toThrow(RangeError);
  });
});
