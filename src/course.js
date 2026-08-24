export const COURSE = Object.freeze([
  { id: "lesson-01", number: "01", title: "二次函数的概念", stepCount: 5 },
  { id: "lesson-02", number: "02", title: "y=ax²" },
  { id: "lesson-03", number: "03", title: "y=ax²+k" },
  { id: "lesson-04", number: "04", title: "y=a(x-h)²" },
  { id: "lesson-05", number: "05", title: "y=a(x-h)²+k", stepCount: 6 },
  { id: "lesson-06", number: "06", title: "一般式与顶点式的转换", stepCount: 8 },
  { id: "lesson-07", number: "07", title: "二次函数图象与 x 轴的交点", stepCount: 7 },
  { id: "lesson-08", number: "08", title: "近似根与图象解不等式", stepCount: 12 },
  { id: "lesson-09", number: "09", title: "区间最值与实际问题建模", stepCount: 10 },
  { id: "lesson-10", number: "10", title: "实际问题与二次函数（二）", stepCount: 8 },
  { id: "lesson-11", number: "11", title: "实际问题与二次函数（三）", stepCount: 9 },
]);

export function getLessonById(id) {
  return COURSE.find((lesson) => lesson.id === id) ?? null;
}

export function getLessonFromHash(hash) {
  const lessonId = String(hash ?? "").replace(/^#/, "").split("/")[0];
  return getLessonById(lessonId) ?? COURSE[0];
}

export function validateCourse(course) {
  if (!Array.isArray(course) || course.length !== 11) {
    throw new TypeError("Course must contain exactly 11 lessons");
  }

  const ids = new Set();
  for (const lesson of course) {
    if (!lesson || typeof lesson.id !== "string" || !/^lesson-\d{2}$/.test(lesson.id)) {
      throw new TypeError("Each lesson needs a valid id");
    }
    if (ids.has(lesson.id)) {
      throw new TypeError("Lesson ids must be unique");
    }
    if (typeof lesson.number !== "string" || typeof lesson.title !== "string" || !lesson.title.trim()) {
      throw new TypeError("Each lesson needs a number and title");
    }
    ids.add(lesson.id);
  }

  return true;
}

validateCourse(COURSE);


