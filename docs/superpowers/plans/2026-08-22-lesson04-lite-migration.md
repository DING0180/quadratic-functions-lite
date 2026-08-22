# Lesson 04 Lite Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the legacy Lesson 04 horizontal-shift discovery sequence into the existing Lite classroom.

**Architecture:** Add a self-contained Lesson 04 state module and five-step renderer using Lite's KaTeX and SVG parabola helper. Extend that helper only with optional point styling and translation-arrow data, then add the Lesson 04 hash path alongside the existing Lesson 2 path in `src/main.js`.

**Tech Stack:** Vite, native JavaScript ES modules, KaTeX, SVG, Vitest, JSDOM.

**Spec:** `docs/superpowers/specs/2026-08-22-lesson04-lite-migration-design.md`

## Global Constraints

- Do not modify `D:\桌面\二次函数`; it is read-only legacy source.
- Keep the single Lite Vite app, existing sidebar, existing stage, and existing SVG parabola helper.
- Preserve exactly the five legacy discovery steps; do not build legacy planned-but-unimplemented Lesson 04 material.
- Preserve nine `y=x²` points, ten `y=(x-1)²` points, nine rightward `+1` arrows, legacy Chinese copy, colours, and 650 ms arrow playback.
- Do not add dependencies, create a second app, deploy, push, or commit.
- Run `npm.cmd test` and `npm.cmd run build` after implementation.

---

### Task 1: Add Lesson 04 immutable teaching data

**Files:**
- Create: `src/lessons/lesson04-state.js`
- Create: `tests/lesson04-state.test.js`

**Interfaces:**
- Produces `BASE_POINTS`, `SHIFTED_POINTS`, `TRANSLATION_ARROWS`, `formatLesson04Formula({ a, h })`, and `getLesson04Properties({ a, h })`.
- `TRANSLATION_ARROWS` maps every baseline point to `{ x: from.x + 1, y: from.y }` with `label: "+1"`.

- [ ] **Step 1: Write the failing test**

```js
import { expect, it } from "vitest";
import { BASE_POINTS, SHIFTED_POINTS, TRANSLATION_ARROWS } from "../src/lessons/lesson04-state.js";

it("keeps the legacy point tables and nine unit-right translations", () => {
  expect(BASE_POINTS).toHaveLength(9);
  expect(SHIFTED_POINTS).toHaveLength(10);
  expect(SHIFTED_POINTS.at(-1)).toEqual({ x: 5, y: 16 });
  expect(TRANSLATION_ARROWS.every(({ from, to, label }) => (
    to.x === from.x + 1 && to.y === from.y && label === "+1"
  ))).toBe(true);
});
```

- [ ] **Step 2: Run the focused test and observe the expected module-not-found failure**

Run: `npm.cmd test -- tests/lesson04-state.test.js`

- [ ] **Step 3: Implement the smallest state module**

```js
export const BASE_POINTS = Object.freeze([
  { x: -4, y: 16 }, { x: -3, y: 9 }, { x: -2, y: 4 },
  { x: -1, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 1 },
  { x: 2, y: 4 }, { x: 3, y: 9 }, { x: 4, y: 16 },
]);
export const TRANSLATION_ARROWS = Object.freeze(BASE_POINTS.map((from) => ({
  from, to: { x: from.x + 1, y: from.y }, label: "+1",
})));
```

Copy the legacy pure property/formula helpers unchanged in behaviour, including validation for zero or non-finite `a` and non-finite `h`.

- [ ] **Step 4: Add formula and property assertions, then run the focused test again**

Run: `npm.cmd test -- tests/lesson04-state.test.js`

Expected: PASS.

### Task 2: Extend the existing SVG helper minimally

**Files:**
- Modify: `src/graph/parabola-svg.js`
- Modify: `tests/parabola-svg.test.js`

**Interfaces:**
- Existing point arrays and `{ x, y }` objects remain valid.
- A point object may additionally provide `color` and `radius`.
- Optional `arrows` entries use `{ from, to, color, label }` and render a shaft, arrowhead, and label.

- [ ] **Step 1: Write the failing graph test**

```js
it("renders optional coloured points and rightward translation arrows", () => {
  const container = document.createElement("div");
  createParabolaGraph(container, {
    points: [{ x: 0, y: 0, color: "#5c7385", radius: 6 }],
    arrows: [{ from: { x: 0, y: 0 }, to: { x: 1, y: 0 }, color: "#b45f06", label: "+1" }],
  });
  expect(container.querySelector(".parabola-point").getAttribute("fill")).toBe("#5c7385");
  expect(container.querySelectorAll(".parabola-arrow")).toHaveLength(1);
  expect(container.querySelector(".parabola-arrow-label").textContent).toBe("+1");
});
```

- [ ] **Step 2: Run the focused test and observe the expected assertion failure**

Run: `npm.cmd test -- tests/parabola-svg.test.js`

- [ ] **Step 3: Implement only the optional rendering fields**

Make `appendPoint` select `point.color ?? "#2563eb"` and `point.radius ?? 4`. Add `appendArrow` with SVG `line`, two short arrowhead lines, and an optional `text` label at the geometric midpoint. Initialize `arrows: []`, draw it after points, and retain all existing axes/curves/labels behavior.

- [ ] **Step 4: Run SVG regression tests**

Run: `npm.cmd test -- tests/parabola-svg.test.js`

Expected: PASS, including pre-existing vertical-shift coverage.

### Task 3: Implement and test the five Lesson 04 render states

**Files:**
- Create: `src/lessons/lesson04.js`
- Create: `tests/lesson04.test.js`
- Modify: `src/styles.css`

**Interfaces:**
- Produces `renderLesson04(stage, { step, onStepChange })` and returns `{ destroy() }`.
- Steps are ordered `guess`, `base-plot`, `shifted-plot`, `compare`, `arrows`.
- Destroy cancels any pending 650 ms playback timeout.

- [ ] **Step 1: Write failing JSDOM tests for each interaction**

```js
it("keeps the guess conclusion hidden until Reveal the answer", () => {
  const stage = document.createElement("section");
  const lesson = renderLesson04(stage, { step: 1, onStepChange() {} });
  expect(stage.querySelector("[data-lesson04-conclusion]").hidden).toBe(true);
  stage.querySelector('[data-lesson04-guess="right"]').click();
  expect(stage.querySelector('[data-lesson04-guess="right"]').getAttribute("aria-pressed")).toBe("true");
  stage.querySelector("[data-lesson04-reveal]").click();
  expect(stage.querySelector("[data-lesson04-conclusion]").hidden).toBe(false);
  lesson.destroy();
});
```

Also test the ninth baseline click completes its curve, ten shifted clicks enable connection, comparison conclusion remains hidden before its reveal, and arrow playback renders the first arrow immediately and is cleared on `destroy()`.

- [ ] **Step 2: Run the new test file and observe the expected module-not-found failure**

Run: `npm.cmd test -- tests/lesson04.test.js`

- [ ] **Step 3: Implement the renderer using only Lite helpers**

Use `renderFormula` from `src/formula.js` and `createParabolaGraph` from `src/graph/parabola-svg.js`. Preserve the legacy copy, values, colours (`#5c7385`, `#1f8a70`, `#b45f06`), point counts, `aria-pressed` controls, `aria-live="polite"` status, reveal/reset-by-rerender behavior, and 650 ms sequence timing. Render native Previous/Next controls matching Lesson 2's hash callback contract.

- [ ] **Step 4: Add only scoped Lesson 04 styles**

Port the legacy visual composition as `.lesson04-*`: a 63/37 graph/workbench grid above 860 px; one column below it; bordered light graph panel; white workbench; and green conclusion callout. Do not alter Lesson 2 selectors.

- [ ] **Step 5: Run the renderer tests**

Run: `npm.cmd test -- tests/lesson04.test.js tests/lesson04-state.test.js tests/parabola-svg.test.js`

Expected: PASS.

### Task 4: Connect Lesson 04 to the shared Lite stage

**Files:**
- Modify: `src/main.js`
- Modify: `tests/course.test.js`

**Interfaces:**
- `#lesson-04/step-01` through `#lesson-04/step-05` canonicalize to the valid local step.
- Existing Lesson 2 canonical hashes and destruction lifecycle remain unchanged.

- [ ] **Step 1: Write the failing course-level hash expectation**

```js
it("continues resolving Lesson 04 step hashes to the Lesson 04 course item", () => {
  expect(getLessonFromHash("#lesson-04/step-05")).toMatchObject({
    id: "lesson-04", number: "04", title: "y=a(x-h)²",
  });
});
```

- [ ] **Step 2: Run the focused course test**

Run: `npm.cmd test -- tests/course.test.js`

Expected: PASS once the existing generic hash behavior is confirmed; this test records the Lesson 04 routing contract before the `main.js` change.

- [ ] **Step 3: Add the minimal Lesson 04 dispatch branch**

Import `renderLesson04`; generalize the active renderer handle so switching any interactive lesson calls its `destroy()`; add Lesson 04 step parse/hash helpers with range `1..5`; preserve generic placeholder rendering for all other lessons. Confirm sidebar anchors remain `#lesson-04` and canonicalization redirects that entry to `#lesson-04/step-01`.

- [ ] **Step 4: Run full verification**

Run: `npm.cmd test`

Run: `npm.cmd run build`

Expected: both exit with code 0.

- [ ] **Step 5: Inspect the exact migration diff without committing**

Run: `git status --short` and `git diff --check`

Expected: only Lesson 04 files, the SVG helper, `main.js`, `src/styles.css`, the plan/spec, and targeted tests are changed; no `dist`, `node_modules`, commits, pushes, or deployment changes.

## Plan Review

The plan ports every legacy item that was actually implemented: guess, nine-point baseline, ten-point shifted plot, comparison, and nine-arrow playback. It deliberately leaves out the legacy branch's planned but absent properties/challenge/bridge renderers. The only shared modification is the backwards-compatible SVG point/arrow support needed to avoid a separate Lesson 4 graph implementation.
