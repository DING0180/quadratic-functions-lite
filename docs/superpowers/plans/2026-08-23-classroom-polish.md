# Classroom visual polish implementation plan

> **For implementation:** Execute this plan inline with test-first changes. The formal repository is `D:\桌面\quadratic-functions-lite` on `main`.

**Goal:** Make the current 11-lesson classroom visually coherent and projection-ready without changing its teaching sequence or adding dependencies.

**Architecture:** Keep one Vite entry, the current lesson renderers, KaTeX formula helper, and `createParabolaGraph`. Move visual consistency into shared CSS tokens and additive SVG semantics rather than copying lesson components or changing lesson data.

**Tech stack:** Vite, native ES modules, CSS, KaTeX, SVG, Vitest.

**Spec:** `docs/superpowers/specs/2026-08-23-classroom-polish-design.md`

## Global constraints

- Do not change the lesson order, step counts, formulas, question copy, or introduce Lesson 10/11 content.
- Do not add dependencies, frameworks, a router, or a second graph renderer.
- Preserve all existing class names and graph options consumed by Lesson 01–09 and their tests.
- Treat 1920×1080, 1366×768, and 1280×720 as required classroom layouts; include `prefers-reduced-motion` behavior.

### Task 1: Give the SVG renderer a reusable classroom grid and semantic plot surface

**Files:**
- Modify: `src/graph/parabola-svg.js`
- Modify: `tests/parabola-svg.test.js`

**Interfaces:**
- Consumes: existing `viewport`, `createScale`, and `createParabolaGraph` options.
- Produces: `.parabola-grid`, `.parabola-grid-line`, and `.parabola-plot-area` SVG hooks; existing graph classes and options remain unchanged.

- [ ] **Step 1: Write the failing test**

```js
it("renders a clipped semantic grid behind graph content", () => {
  const container = document.createElement("div");
  createParabolaGraph(container, { curves: [{ a: 1 }] });

  expect(container.querySelector(".parabola-grid")).not.toBeNull();
  expect(container.querySelectorAll(".parabola-grid-line").length).toBeGreaterThan(0);
  expect(container.querySelector(".parabola-plot-area")).not.toBeNull();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm.cmd test -- tests/parabola-svg.test.js`

Expected: failure because the three new semantic SVG hooks do not exist.

- [ ] **Step 3: Implement only the additive SVG layer**

```js
function appendGrid(svg, scale, viewport) {
  const grid = createSvgElement("g", "parabola-grid");
  // Create vertical and horizontal lines from the existing viewport tick steps.
  // Append it after defs and before appendAxes.
}

plotContent.setAttribute("class", "parabola-plot-area");
```

Use `clip-path` for the grid and the plot content so visible labels remain outside the clipped group exactly as today.

- [ ] **Step 4: Run the focused test and full suite**

Run: `npm.cmd test -- tests/parabola-svg.test.js` then `npm.cmd test`

Expected: all graph and lesson tests pass.

### Task 2: Introduce one additive classroom design language

**Files:**
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: current `.classroom`, `.sidebar`, `.lesson-stage`, `.lessonNN-*`, and `.parabola-*` classes.
- Produces: global CSS variables and low-specificity shared visual rules; lesson-specific layout selectors continue to own content geometry.

- [ ] **Step 1: Establish visual acceptance checks before styling**

At 1280×720, route to `#lesson-01/step-01`, `#lesson-04/step-01`, and `#lesson-09/step-01`. Record: no horizontal overflow; sidebar remains readable; stage heading, graph, and primary control are visible without clipping.

- [ ] **Step 2: Add shared tokens and shell refinement**

Add `--surface-*`, `--ink-*`, `--accent-*`, `--radius-*`, `--shadow-*`, `--space-*`, and `--motion-*` variables to `:root`. Apply them to the classroom shell, sidebar, active lesson navigation, stage, focus outlines, and small-height desktop breakpoint. Keep the present green/orange teaching palette but reduce superfluous shadows and framing.

- [ ] **Step 3: Add shared component-family rules after current lesson rules**

Use prefix attribute selectors to cover existing classes without markup rewrites:

```css
[class$="-action"], [class*="-action "] { /* primary control */ }
[class$="-secondary"], [class*="-secondary "] { /* secondary control */ }
[class$="-graph-panel"], [class*="-graph-panel "] { /* graph frame */ }
[class$="-workbench"], [class*="-workbench "] { /* working surface */ }
```

Pair those with explicit selectors for reveal blocks, formula regions, step controls, and range inputs. Preserve any special feedback state selectors already declared by lessons.

- [ ] **Step 4: Style SVG semantic layers and motion**

Make the grid neutral and low contrast, increase focal curve/point legibility, keep labels direct and unobscured, and apply the common 160–240ms timing to curve draw, reveal/focus, and control state. Add a `prefers-reduced-motion: reduce` override that removes nonessential transitions.

- [ ] **Step 5: Verify browser visual acceptance checks**

Revisit the Task 2 entry screens at 1280×720, 1366×768, and 1920×1080. Correct any visible clipping, collision, unreadable typography, or loss of focus before proceeding.

### Task 3: Exercise the existing course interactions and release checks

**Files:**
- No source files expected unless browser QA identifies a concrete visual defect.

**Interfaces:**
- Consumes: current lesson routes, buttons, range inputs, and graph data attributes.
- Produces: verified browser behavior with no teaching-logic changes.

- [ ] **Step 1: Run real-browser coverage**

For Lesson 01–09, visit each route and step with the existing next/previous controls; activate every available Reveal, Reset, Random/New Case, Check with Graph, mode toggle, and slider. Visit Lesson 10 and 11 and verify their intentionally generic views retain navigation and layout parity.

- [ ] **Step 2: Collect regression signals**

At each mandated desktop size, check stage overflow, horizontal scrolling, hidden controls, SVG clipping, label collisions, keyboard focus, hash correctness, and console errors. Fix only concrete defects in the owning shared CSS or SVG renderer, then repeat the affected route and size.

- [ ] **Step 3: Build and review the exact change set**

Run: `npm.cmd test` and `npm.cmd run build`.

Then run: `git status --short`, `git diff -- src/styles.css src/graph/parabola-svg.js tests/parabola-svg.test.js docs/superpowers`, and `git diff --cached`.

Expected: all tests and build pass; changes are limited to shared polish, one SVG renderer enhancement, one regression test, and the design/plan documents.

- [ ] **Step 4: Commit, push, and validate Pages**

Stage only the verified paths above, commit as `feat: polish classroom visual system`, fetch `origin`, fast-forward push `main`, wait for Pages success, then run online QA for the homepage and Lessons 01, 05, 09, and 11.
