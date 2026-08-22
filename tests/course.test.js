import { describe, expect, it } from "vitest";
import { COURSE, getLessonById, getLessonFromHash, validateCourse } from "../src/course.js";

describe("course configuration", () => {
  it("provides eleven uniquely identified ordered lessons", () => {
    expect(COURSE).toHaveLength(11);
    expect(COURSE.map((lesson) => lesson.id)).toEqual([
      "lesson-01", "lesson-02", "lesson-03", "lesson-04", "lesson-05", "lesson-06",
      "lesson-07", "lesson-08", "lesson-09", "lesson-10", "lesson-11",
    ]);
    expect(new Set(COURSE.map((lesson) => lesson.id)).size).toBe(11);
  });

  it("accepts the published configuration and resolves a known lesson", () => {
    expect(validateCourse(COURSE)).toBe(true);
    expect(getLessonById("lesson-06")).toMatchObject({
      id: "lesson-06",
      number: "06",
      title: "一般式与顶点式的转换",
      stepCount: 8,
    });
  });

  it("uses Lesson 1 for an empty or unknown hash", () => {
    expect(getLessonFromHash("").id).toBe("lesson-01");
    expect(getLessonFromHash("#lesson-08").id).toBe("lesson-08");
    expect(getLessonFromHash("#not-a-lesson").id).toBe("lesson-01");
  });

  it("resolves a lesson hash that includes a local lesson step", () => {
    expect(getLessonFromHash("#lesson-02/step-04").id).toBe("lesson-02");
  });

  it("publishes Lesson 05 as a compact six-step local lesson", () => {
    expect(getLessonById("lesson-05")).toMatchObject({
      id: "lesson-05",
      stepCount: 6,
    });
  });

  it("rejects incomplete or duplicate lesson data", () => {
    expect(() => validateCourse([{ id: "lesson-01", number: "01", title: "A" }])).toThrow("11");
    expect(() => validateCourse(Array.from({ length: 11 }, () => ({
      id: "lesson-01", number: "01", title: "A",
    })))).toThrow("unique");
  });
});
