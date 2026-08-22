# Lesson 02 Lite Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (\`- [ ]\`) syntax for tracking.

**Goal:** Migrate the established Lesson 2, “y=ax²”, into the Lite classroom while keeping only its essential mathematical state, classroom interactions, and graph rendering.

**Architecture:** Keep the existing shell as the single application entry point. Add a focused Lesson 2 state module, a focused Lesson 2 renderer, and a compact SVG-only parabola renderer; \`main.js\` selects the Lesson 2 view through a narrow conditional rather than adding a generic lesson engine or router.

**Tech Stack:** Vite 6, browser-native ES modules, Vitest 3, KaTeX, SVG, CSS.

**Spec:** \`docs/superpowers/specs/2026-08-22-lesson02-lite-migration-design.md\`

## Global Constraints

- Keep \`D:\\桌面\\二次函数\` strictly read-only; no legacy files may be altered or committed.
- Work on the Lite repository’s \`main\` branch, use only explicit Git paths, and push the completed Lesson 2 commit to \`origin/main\`.
- Do not import the legacy Step Registry, Lesson Engine, Teacher Mode, Router, Graph Controls, Canvas Engine, global CSS system, or integration tests.
- Do not create Lesson 3–11 modules or begin their migration in this implementation.
- Use KaTeX through the existing \`src/formula.js\` helper; retain the Lite whiteboard visual style.
- Implement only the SVG capabilities Lesson 2 needs: axes, tick labels, y=ax² curves, point markers, labels, partial curve reveal, and parameter updates.
- Every production behavior starts with a focused Vitest assertion that is observed failing before implementation.

---

## File Structure

| File | Responsibility |
| --- | --- |
| \`src/lessons/lesson02-state.js\` | Pure deterministic coefficient formatting, plotting rows, and random practice challenge factories. |
| \`src/graph/parabola-svg.js\` | A small SVG graph factory that renders axes, curves, labels, points, and a progressive curve reveal. |
| \`src/lessons/lesson02.js\` | Owns the twelve Lesson 2 classroom stages and renders/cleans up only this lesson’s interactions. |
| \`src/main.js\` | Delegates \`lesson-02\` to the Lesson 2 renderer and normalizes its step hash while preserving existing lesson shell behavior. |
| \`src/styles.css\` | Adds only Lesson 2’s cards, controls, table, practice, and compact responsive rules. |
| \`tests/lesson02-state.test.js\` | Tests the extracted pure mathematical behavior. |
| \`tests/parabola-svg.test.js\` | Tests the SVG renderer’s public DOM output without a browser harness. |
| \`tests/course.test.js\` | Adds the \`#lesson-02/step-01\` hash lookup expectation if hash parsing is extended. |

### Task 1: Record the approved migration boundary

**Files:**
- Add: \`docs/superpowers/specs/2026-08-22-lesson02-lite-migration-design.md\`
- Add: \`docs/superpowers/plans/2026-08-22-lesson02-lite-migration.md\`

**Interfaces:**
- Consumes: the user-approved migration requirements and legacy Lesson 2 dependency audit.
- Produces: the reviewed constraints for all following tasks.

- [ ] **Step 1: Verify the working tree contains only the approved design and this plan**

Run: \`git status --short\`

Expected: only the two named documentation paths are untracked; no legacy-project path appears.

- [ ] **Step 2: Commit the design and plan explicitly**

Run:

\`\`\`powershell
git add docs/superpowers/specs/2026-08-22-lesson02-lite-migration-design.md docs/superpowers/plans/2026-08-22-lesson02-lite-migration.md
git commit -m "docs: define lesson 02 lite migration"
\`\`\`

Expected: one documentation-only commit; no application source is staged.

### Task 2: Extract and verify Lesson 2’s pure mathematics

**Files:**
- Create: \`tests/lesson02-state.test.js\`
- Create: \`src/lessons/lesson02-state.js\`

**Interfaces:**
- Produces: \`LESSON02_X_VALUES\`, \`formatCoefficientLatex(a)\`, \`formatFunctionLatex(a)\`, \`createPlotterState(a)\`, \`createSingleChallenge(random)\`, and \`createPairChallenge(random)\`.
- Consumes: no DOM APIs and no legacy code at runtime.

- [ ] **Step 1: Write the failing state tests**

\`\`\`js
import { describe, expect, it } from "vitest";
import {
  LESSON02_X_VALUES,
  createPairChallenge,
  createPlotterState,
  formatCoefficientLatex,
  formatFunctionLatex,
} from "../src/lessons/lesson02-state.js";

describe("lesson 02 mathematics", () => {
  it("formats fraction coefficients and the matching y=ax² formula", () => {
    expect(formatCoefficientLatex(-0.5)).toBe("-\\frac{1}{2}");
    expect(formatFunctionLatex(1 / 3)).toBe("y=\\frac{1}{3}x^2");
  });

  it("creates one plotting row for every x from negative four through four", () => {
    const state = createPlotterState(-2);
    expect(LESSON02_X_VALUES).toEqual([-4, -3, -2, -1, 0, 1, 2, 3, 4]);
    expect(state.rows.map((row) => row.y)).toEqual([-32, -18, -8, -2, 0, -2, -8, -18, -32]);
    expect(state.revealedCount).toBe(0);
  });

  it("creates a pair challenge whose answer follows absolute coefficient magnitude", () => {
    const pair = createPairChallenge(() => 0);
    expect(pair.left.a).not.toBe(pair.right.a);
    expect(pair.answer).toBe(Math.abs(pair.left.a) > Math.abs(pair.right.a) ? "left" : "right");
  });
});
\`\`\`

- [ ] **Step 2: Run the focused test to verify the expected missing-module failure**

Run: \`npm.cmd test -- tests/lesson02-state.test.js\`

Expected: FAIL because \`src/lessons/lesson02-state.js\` does not exist.

- [ ] **Step 3: Implement the minimal pure module**

\`\`\`js
export const LESSON02_X_VALUES = Object.freeze([-4, -3, -2, -1, 0, 1, 2, 3, 4]);
const COEFFICIENTS = Object.freeze([-4, -3, -2, -1, -0.5, -1 / 3, -0.2, 0.2, 1 / 3, 0.5, 1, 2, 3, 4]);
const FRACTIONS = new Map([
  [0.5, "\\frac{1}{2}"], [-0.5, "-\\frac{1}{2}"],
  [1 / 3, "\\frac{1}{3}"], [-1 / 3, "-\\frac{1}{3}"],
  [0.2, "\\frac{1}{5}"], [-0.2, "-\\frac{1}{5}"],
]);
const indexFor = (random) => Math.min(COEFFICIENTS.length - 1, Math.floor(Math.max(0, random()) * COEFFICIENTS.length));

export function formatCoefficientLatex(a) { return FRACTIONS.get(a) ?? String(a); }
export function formatFunctionLatex(a) {
  if (a === 1) return "y=x^2";
  if (a === -1) return "y=-x^2";
  return \`y=\${formatCoefficientLatex(a)}x^2\`;
}
export function createPlotterState(a) {
  return { a, rows: LESSON02_X_VALUES.map((x) => ({ x, y: a * x * x })), revealedCount: 0 };
}
export function createSingleChallenge(random = Math.random) {
  const a = COEFFICIENTS[indexFor(random)];
  return { a, formula: formatFunctionLatex(a), answer: a };
}
export function createPairChallenge(random = Math.random) {
  const leftIndex = indexFor(random);
  const rightIndex = (leftIndex + 1 + Math.floor(Math.max(0, random()) * (COEFFICIENTS.length - 1))) % COEFFICIENTS.length;
  const left = createSingle(() => leftIndex / COEFFICIENTS.length);
  const right = createSingle(() => rightIndex / COEFFICIENTS.length);
  return { left, right, answer: Math.abs(left.a) > Math.abs(right.a) ? "left" : "right" };
}
\`\`\`

The implementation must return plain objects and must not read global state.

- [ ] **Step 4: Run the focused state test and the whole suite**

Run: \`npm.cmd test -- tests/lesson02-state.test.js\`, then \`npm.cmd test\`

Expected: all tests PASS.

### Task 3: Add the minimal SVG parabola renderer

**Files:**
- Create: \`tests/parabola-svg.test.js\`
- Create: \`src/graph/parabola-svg.js\`

**Interfaces:**
- Consumes: \`createParabolaGraph(container, options)\` where \`options\` includes \`curves\`, \`points\`, \`labels\`, and \`curveProgress\`.
- Produces: \`{ update(nextOptions), destroy() }\`; \`update\` re-renders only the stated graph primitives.

- [ ] **Step 1: Write the failing SVG renderer tests**

\`\`\`js
import { describe, expect, it } from "vitest";
import { createParabolaGraph } from "../src/graph/parabola-svg.js";

describe("parabola SVG", () => {
  it("renders axes and one y=ax² curve", () => {
    const container = document.createElement("div");
    createParabolaGraph(container, { curves: [{ a: 1, color: "#2563eb" }] });
    expect(container.querySelectorAll(".parabola-axis")).toHaveLength(2);
    expect(container.querySelectorAll(".parabola-curve")).toHaveLength(1);
  });

  it("updates curve progress and shown point markers", () => {
    const container = document.createElement("div");
    const graph = createParabolaGraph(container, { curves: [{ a: 1 }], points: [] });
    graph.update({ curveProgress: 0.5, points: [[0, 0], [1, 1]] });
    expect(container.querySelectorAll(".parabola-point")).toHaveLength(2);
    expect(container.querySelector(".parabola-curve").getAttribute("stroke-dasharray")).not.toBeNull();
  });
});
\`\`\`

Set Vitest’s environment to \`jsdom\` only for this test file using an inline \`// @vitest-environment jsdom\` directive.

- [ ] **Step 2: Run the focused test to verify the expected missing-module failure**

Run: \`npm.cmd test -- tests/parabola-svg.test.js\`

Expected: FAIL because \`src/graph/parabola-svg.js\` does not exist.

- [ ] **Step 3: Install the smallest DOM test runtime and implement the renderer**

Run: \`npm.cmd install --save-dev jsdom\`.

Then implement:

\`\`\`js
export function createParabolaGraph(container, initialOptions = {}) {
  let options = initialOptions;
  const render = () => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("parabola-svg");
    svg.setAttribute("viewBox", "-5 -5 10 10");
    appendAxes(svg);
    options.curves.forEach((curve) => appendCurve(svg, curve, options.curveProgress ?? 1));
    options.points.forEach(([x, y]) => appendPoint(svg, x, y));
    options.labels.forEach(({ x, y, text }) => appendLabel(svg, x, y, text));
    container.replaceChildren(svg);
  };
  render();
  return { update(nextOptions = {}) { options = { ...options, ...nextOptions }; render(); }, destroy() { container.replaceChildren(); } };
}
\`\`\`

Define \`appendAxes(svg)\` to append the two \`.parabola-axis\` lines at x=0 and y=0 plus integer tick text from -4 through 4; define \`appendCurve(svg, curve, progress)\` to sample x from -4 to 4 in 0.1 intervals, set the \`.parabola-curve\` path’s \`d\`, stroke colour, \`stroke-dasharray\` equal to its computed path length, and \`stroke-dashoffset\` equal to \`(1 - progress) * length\`; define \`appendPoint\` and \`appendLabel\` to append \`.parabola-point\` circles and text. Sample the x-domain from -4 to 4, transform to the fixed SVG view box, and clip only by SVG bounds. Do not create controls, dragging, zooming, roots, vertex overlays, a canvas, or a generic series registry.

- [ ] **Step 4: Run the focused SVG tests and the whole suite**

Run: \`npm.cmd test -- tests/parabola-svg.test.js\`, then \`npm.cmd test\`

Expected: all tests PASS.

### Task 4: Render the twelve Lesson 2 classroom stages

**Files:**
- Create: \`src/lessons/lesson02.js\`
- Modify: \`src/main.js\`
- Modify: \`src/course.js\`
- Modify: \`src/styles.css\`
- Modify: \`tests/course.test.js\`

**Interfaces:**
- Consumes: \`renderLesson02(stage, { step, onStepChange })\`, Lesson 2 state factories, \`createParabolaGraph\`, and \`renderFormula\`.
- Produces: \`{ destroy() }\` from \`renderLesson02\`; the current step remains in the \`#lesson-02/step-01\` through \`#lesson-02/step-12\` hash.

- [ ] **Step 1: Write the failing hash expectation**

Add to \`tests/course.test.js\`:

\`\`\`js
it("resolves a lesson hash that includes a local lesson step", () => {
  expect(getLessonFromHash("#lesson-02/step-04").id).toBe("lesson-02");
});
\`\`\`

- [ ] **Step 2: Run the focused test to verify it fails because subpaths are unsupported**

Run: \`npm.cmd test -- tests/course.test.js\`

Expected: FAIL with Lesson 1 returned for \`#lesson-02/step-04\`.

- [ ] **Step 3: Add the smallest hash parsing extension**

Change the first line of \`getLessonFromHash\` to:

\`\`\`js
const lessonId = String(hash ?? "").replace(/^#/, "").split("/")[0];
\`\`\`

Keep \`getLessonFromHash\` as a lesson resolver only; local step parsing belongs in \`main.js\`.

- [ ] **Step 4: Implement \`renderLesson02\` with the twelve established stages**

\`\`\`js
export function renderLesson02(stage, { step = 1, onStepChange }) {
  const renderers = [renderBridge, renderPoints, renderConnect, renderNegative, renderSign, renderMagnitude, renderCompare, renderSummary, renderSinglePractice, renderPairPractice, renderMisconception, renderBridgeOut];
  return renderers[step - 1](stage, onStepChange);
}
\`\`\`

Stage content must preserve the existing sequence: general-to-\`ax²\` bridge, \`y=x²\` points, curve connection, \`y=-x²\`, sign comparison, \`2x²\`/\`1/2x²\`, magnitude comparison, summary, single-coefficient practice, pair comparison practice, misconception correction, and \`ax²+k\` bridge. Use local buttons for reveal/progression, call \`onStepChange(nextStep)\` for the next/previous controls, and use the SVG graph only in stages requiring it.

- [ ] **Step 5: Integrate the local Lesson 2 view into the existing shell**

In \`src/main.js\`, retain the current sidebar and generic content for every lesson except \`lesson-02\`. For Lesson 2, parse \`/step-XX\`, normalize invalid step values to \`step-01\`, replace the stage’s generic children through \`renderLesson02\`, and store/destroy the previous Lesson 2 cleanup before any re-render. Sidebar links remain \`#lesson-02\`, which enters its first stage; all other navigation stays hash based.

- [ ] **Step 6: Add only scoped responsive visual rules**

Create \`lesson02-*\` styles inside \`src/styles.css\` for the stage header, two-column exploration layout, graph panel, point table, formula tiles, practice choices, feedback, and next/previous controls. At widths below \`900px\`, stack the local two-column content; at screen heights below \`760px\`, compact margins and controls. Do not paste legacy global selectors or alter the shell’s desktop grid.

- [ ] **Step 7: Run the course and complete automated suite**

Run: \`npm.cmd test -- tests/course.test.js\`, then \`npm.cmd test\` and \`npm.cmd run build\`.

Expected: all tests and production build PASS.

### Task 5: Browser acceptance and the Lesson 2 release commit

**Files:**
- Modify: only files completed in Tasks 2–4.

**Interfaces:**
- Consumes: the built Vite application.
- Produces: a browser-verified Lesson 2 and one pushed release commit.

- [ ] **Step 1: Start the Lite app locally on a fixed, unused port**

Run: \`npm.cmd run dev -- --host 127.0.0.1 --port 4173\`

Expected: Vite serves \`http://127.0.0.1:4173/quadratic-functions-lite/\`.

- [ ] **Step 2: Check Lesson 2’s classroom flow in a real browser**

At 1920×1080, 1366×768, and 1280×720, open \`#lesson-02/step-01\`; use the next controls through the graph/reveal stages; confirm each graph shows only axes, the expected parabola(s), point markers, and labels. Complete one single challenge and one pair challenge. Confirm sidebar navigation returns to Lesson 1 and browser back/forward returns to Lesson 2’s hash state.

- [ ] **Step 3: Capture the final automated evidence**

Run: \`npm.cmd test\` and \`npm.cmd run build\`.

Expected: all tests PASS and \`dist/\` builds successfully.

- [ ] **Step 4: Review and commit only Lesson 2 paths**

Run:

\`\`\`powershell
git status --short
git add src/lessons/lesson02.js src/lessons/lesson02-state.js src/graph/parabola-svg.js src/main.js src/course.js src/styles.css tests/lesson02-state.test.js tests/parabola-svg.test.js tests/course.test.js package.json package-lock.json
git commit -m "feat: migrate lesson 02 to lite architecture"
git push origin main
\`\`\`

Expected: \`git status --short\` is clean after the push; the commit contains no \`node_modules\`, \`dist\`, legacy files, or Lesson 3/4 paths.

## Self-Review

- Spec coverage: Tasks 2–4 retain Lesson 2’s mathematical, visual, and interactive teaching effects. Task 3 limits graph scope, Task 4 explicitly excludes the legacy infrastructure and adds local hash state, and Task 5 performs the required browser/test/build/commit/push sequence.
- Placeholder scan: no task delegates an unspecified behavior; stage order, module interfaces, tests, allowed graph primitives, commands, and Git paths are named.
- Type consistency: Task 2 exports are consumed by Task 4; Task 3’s \`createParabolaGraph\` and its \`{ update, destroy }\` return shape are the graph interface used by Task 4; Task 4’s \`renderLesson02\` return shape is the cleanup interface used by \`main.js\`.
