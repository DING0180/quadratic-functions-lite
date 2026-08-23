# Lesson 01 Migration Implementation Plan

Goal: Integrate the established eight-stage Lesson 01 concept lesson into the formal classroom application's existing Sidebar and hash route.

Architecture: A scoped Lesson 01 renderer follows the existing Lesson 08 renderer contract and owns only its DOM and listeners. The existing main.js dispatcher supplies the step and route callback; course.js declares the eight-step count. KaTeX stays on the shared formula renderer.

Tech Stack: Vite, native ES modules, KaTeX, Vitest, jsdom, CSS.

Spec: docs/superpowers/specs/2026-08-23-lesson01-migration-design.md

## Global Constraints

- Modify only Lesson 01 files, its route dispatch, and its direct tests; retain the single Vite app, Sidebar, hash routing, and formula renderer.
- Do not add dependencies, an application shell, iframe, or second graph implementation.
- Prefix all new styles lesson01-; provide a compact desktop-height mode.
- All expected reveal answers start hidden; formulas use renderFormula.
- Never stage node_modules, dist, or temporary artifacts.

### Task 1: Create the scoped Lesson 01 renderer

Files:
- Create: src/lessons/lesson01.js
- Create: src/lessons/lesson01.css
- Test: tests/lesson01.test.js

Interfaces:
- Consumes renderFormula(element, latex, options) from src/formula.js.
- Produces LESSON01_STEP_TITLES and renderLesson01(stage, { step, onStepChange, random }).

- [ ] Step 1: Write failing behavior tests
  - Assert eight stage titles; stage 1 bridge answer is initially hidden then appears after Reveal click.
  - Assert stage 4 scanner reports selected term/coefficient; stage 5 supplied deterministic random generator chooses the expected question and Reset restores a fresh prompt.
  - Assert stage 7 range input updates its real-world readout and negative-solution check; call destroy after each render.
- [ ] Step 2: Verify RED
  - Run npm.cmd test -- tests/lesson01.test.js.
  - Expected: module resolution fails because src/lessons/lesson01.js does not exist.
- [ ] Step 3: Implement minimal renderer and styles
  - Export renderLesson01(stage, { step = 1, onStepChange = () => {}, random = Math.random } = {}).
  - Clamp step to 1–8, select an eight-item renderer list, replace stage contents, append existing-style previous/next controls, and return a listener cleanup handle.
  - Implement bridge/reveal, general-form color links, scanner, random classification, examples, model slider/reset, and summary using renderFormula. Give interactive controls data-lesson01-* attributes.
  - Add only lesson01- scoped responsive CSS, including a desktop low-height media rule.
- [ ] Step 4: Verify GREEN
  - Run npm.cmd test -- tests/lesson01.test.js.
  - Expected: reveal, scanner, deterministic practice, reset, model, navigation, and cleanup tests pass.
- [ ] Step 5: Commit renderer files
  - Stage only the Lesson 01 module, CSS, and direct test; commit with feat: add lesson 01 concept classroom.

### Task 2: Register the lesson in existing route dispatch

Files:
- Modify: src/course.js
- Modify: src/main.js
- Create: tests/lesson01-routing.test.js

Interfaces:
- Consumes renderLesson01 from src/lessons/lesson01.js.
- Produces #lesson-01/step-01 through #lesson-01/step-08 inside the existing stage.

- [ ] Step 1: Write failing route test
  - Mount the real #app, set /#lesson-01/step-03, dynamically import main.js, then assert the hash remains #lesson-01/step-03, a .lesson01-step exists, and its kicker says 03 / 08.
- [ ] Step 2: Verify RED
  - Run npm.cmd test -- tests/lesson01-routing.test.js.
  - Expected: failure because Lesson 01 is generic and its step hash normalizes to #lesson-01.
- [ ] Step 3: Add existing-app dispatch entry
  - Import renderLesson01, set the Lesson 01 course entry stepCount to 8, and include Lesson 01 in the local renderer decision that already serves Lessons 02–08.
  - Do not modify other lesson routing.
- [ ] Step 4: Verify GREEN
  - Run npm.cmd test -- tests/lesson01-routing.test.js tests/course.test.js.
  - Expected: direct sidebar hash route uses current stage; course validation passes.
- [ ] Step 5: Commit route files
  - Stage only course, main, and direct routing-test files; commit with feat: route lesson 01 through classroom.

### Task 3: Regression, build, visual checks, and deployment

Files:
- Verify: tests/**/*.test.js
- Verify: dist/ (generated, never staged)

- [ ] Step 1: Run npm.cmd test; expected every existing and Lesson 01 test passes.
- [ ] Step 2: Run npm.cmd run build; expected Vite exits successfully.
- [ ] Step 3: Use local Vite preview for Lesson 01 steps 01, 04, and 06 plus Lesson 02 step 01 at 1920×1080, 1366×768, and 1280×720. Check KaTeX, controls, reset/reveal, clipping, and visible overflow.
- [ ] Step 4: Inspect git status, git diff, and git diff --cached; stage only the two docs and confirmed Lesson 01 route, module, CSS, and tests. Commit with feat: migrate lesson 01 into classroom.
- [ ] Step 5: Fetch, push main, wait for Pages, and open https://ding0180.github.io/quadratic-functions-lite/#lesson-01/step-01. Expected: Pages is successful and Lesson 01 appears inside the one formal Sidebar and stage.
