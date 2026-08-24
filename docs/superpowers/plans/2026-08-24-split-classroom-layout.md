# Split Classroom Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every eligible graph-and-workspace lesson step a single responsive classroom workbench while retaining the existing Vite, native-module, KaTeX, and SVG graph architecture.

**Architecture:** Add a small shared CSS contract in the existing classroom stylesheet, then opt existing lesson layout wrappers and their panels into it rather than creating a new component, router, or graph engine. Preserve lesson-specific markup and teaching interactions; only normalize layout, order, sizing, and controls.

**Tech Stack:** Vite, native JavaScript ES modules, CSS Grid/Flexbox, KaTeX, custom SVG quadratic graph engine, Vitest, Playwright/browser automation.

**Spec:** `docs/superpowers/specs/2026-08-24-split-classroom-layout-design.md`

## Global Constraints

- Keep one Vite application, Sidebar, Router, Lesson Engine, Step Registry, KaTeX renderer, and quadratic SVG graph engine.
- Do not alter teaching text, step ordering, questions, answers, or mathematical logic.
- Use the shared layout classes only for steps that contain both a graph and a workspace/question/control surface.
- Preserve step navigation below the split content.
- Do not add a dependency or framework.

---

### Task 1: Audit and lock the shared layout contract

**Files:**
- Modify: `src/classroom-polish.css`
- Create: `tests/classroom-layout.test.js`

**Interfaces:**
- Produces CSS classes: `.classroom-split`, `.classroom-workspace`, `.classroom-visualization`, `.classroom-controls`.
- Consumes existing lesson-specific graph panel and workbench classes without changing graph options.

- [ ] **Step 1: Write the failing test**

```js
expect(stage.querySelector(".classroom-split > .classroom-workspace")).not.toBeNull();
expect(stage.querySelector(".classroom-split > .classroom-visualization .parabola-svg")).not.toBeNull();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd test -- tests/classroom-layout.test.js`
Expected: FAIL because no eligible renderer exposes the shared classes.

- [ ] **Step 3: Write minimal implementation**

```css
.classroom-split { display: grid; grid-template-columns: minmax(18rem, 34fr) minmax(0, 66fr); }
.classroom-workspace { min-width: 0; }
.classroom-visualization { min-width: 0; }
.classroom-controls { display: flex; flex-wrap: wrap; gap: .55rem; }
```

Add 1024–1279px and sub-1024px media rules matching the design specification.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm.cmd test -- tests/classroom-layout.test.js`
Expected: PASS after the first eligible lesson is opted in.

### Task 2: Opt eligible lessons into the shared contract

**Files:**
- Modify: `src/lessons/lesson02.js`, `src/lessons/lesson03.js`, `src/lessons/lesson04.js`, `src/lessons/lesson05.js`, `src/lessons/lesson07.js`, `src/lessons/lesson08.js`, `src/lessons/lesson09.js`
- Test: `tests/classroom-layout.test.js`

**Interfaces:**
- Consumes the Task 1 classes.
- Produces semantic workspace/visualization ordering in eligible existing layouts.

- [ ] **Step 1: Write failing coverage for representative layouts**

```js
for (const render of eligibleSteps) {
  render(stage);
  expect(stage.querySelector(".classroom-split")).not.toBeNull();
}
```

- [ ] **Step 2: Run the focused test**

Run: `npm.cmd test -- tests/classroom-layout.test.js`
Expected: FAIL for every unconverted candidate.

- [ ] **Step 3: Add shared classes without changing lesson content**

```js
layout.classList.add("classroom-split");
workbench.classList.add("classroom-workspace");
graphPanel.classList.add("classroom-visualization");
controls.classList.add("classroom-controls");
layout.append(workbench, graphPanel);
```

Keep graph-only and no-graph steps untouched. Use existing controls containers where present; do not add duplicate wrappers.

- [ ] **Step 4: Run focused and affected lesson tests**

Run: `npm.cmd test -- tests/classroom-layout.test.js tests/lesson02-render.test.js tests/lesson03.test.js tests/lesson04.test.js tests/lesson05.test.js tests/lesson07.test.js tests/lesson08.test.js tests/lesson09.test.js`
Expected: PASS.

### Task 3: Validate graph-space use and responsive behaviour

**Files:**
- Modify: `src/classroom-polish.css`
- Test: `tests/classroom-layout.test.js`

**Interfaces:**
- Consumes `.classroom-visualization` and graph hosts from Task 2.
- Produces a graph host that uses the visual panel's available width and a bounded classroom-height drawing area.

- [ ] **Step 1: Write layout assertions for host placement**

```js
expect(stage.querySelector(".classroom-visualization .parabola-svg")).not.toBeNull();
expect(stage.querySelector(".classroom-workspace [type=button], .classroom-workspace input")).not.toBeNull();
```

- [ ] **Step 2: Run test to verify DOM coverage**

Run: `npm.cmd test -- tests/classroom-layout.test.js`
Expected: PASS after Task 2; the test protects regressions while CSS is tuned.

- [ ] **Step 3: Implement only shared sizing rules**

```css
.classroom-split .classroom-visualization :is(.lesson02-graph-host, .lesson03-graph-host, .parabola-svg) { min-height: clamp(22rem, 53vh, 38rem); }
@media (max-width: 1023px) { .classroom-split { grid-template-columns: 1fr; } }
```

Scope exact selectors to existing graph panel descendants so the viewBox, axis range, labels, and interaction engine remain unchanged.

- [ ] **Step 4: Run the full automated verification**

Run: `npm.cmd test && npm.cmd run build`
Expected: all tests pass and Vite emits no CSS syntax warnings.

### Task 4: Browser QA, deployment, and reporting

**Files:**
- Verify only; no planned source changes.

- [ ] **Step 1: Start the local Vite server and scan Lesson 01–11**

Run browser/Playwright checks at 1920×1080, 1366×768, and 1280×720. Record every graph-and-workspace candidate, its graph/host rectangles, and document scroll height.

- [ ] **Step 2: Exercise representative interactions**

Run Random/New Case, Reveal, Reset, parameter sliders, Check Answer/Graph, and Study Mode. Confirm that revealing answers does not collapse graph area or move navigation into the workspace.

- [ ] **Step 3: Iterate any observed layout defect**

Make the smallest shared CSS or existing-wrapper class correction, rerun the affected browser workflow, then rerun `npm.cmd test && npm.cmd run build`.

- [ ] **Step 4: Commit and deploy exact paths**

```powershell
git add -- src/classroom-polish.css src/lessons/lesson02.js src/lessons/lesson03.js src/lessons/lesson04.js src/lessons/lesson05.js src/lessons/lesson07.js src/lessons/lesson08.js src/lessons/lesson09.js tests/classroom-layout.test.js docs/superpowers/specs/2026-08-24-split-classroom-layout-design.md docs/superpowers/plans/2026-08-24-split-classroom-layout.md
git commit -m "feat: unify graph workspace layouts"
git push origin main
```

- [ ] **Step 5: Verify Pages and report**

Use the GitHub workflow state and deployed site after the push. Report candidate count, conversion count, intentional exclusions, viewport coverage, residual scrolling, measured graph area change, test/build output, commit SHA, and online result.
