# Lite Classroom Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a deployable Vite classroom shell with a 11-lesson sidebar, normalized hash navigation, and KaTeX rendering, without lesson content or reusable lesson infrastructure.

**Architecture:** A static course configuration supplies the 11 lesson labels. One native ES-module application renders the sidebar and a common pending-content stage, using the browser hash as its only state. A small formula adapter is the sole boundary to KaTeX; no router, graph engine, registry, teacher mode, or lesson modules are created.

**Tech Stack:** Vite 6, native HTML/CSS/JavaScript ES modules, KaTeX 0.16, Vitest 3.

**Spec:** `docs/superpowers/specs/2026-08-22-quadratic-functions-lite-design.md`

## Global Constraints

- Work only in `D:\桌面\quadratic-functions-lite`; `D:\桌面\二次函数` remains read-only.
- Use only Vite, native HTML/CSS/ES modules, KaTeX, and Vitest.
- Define all 11 lesson entries centrally; do not create a `src/lessons/` directory or lesson teaching content.
- Keep state in the URL hash and normalize invalid or empty hashes to Lesson 1.
- Do not create a graph engine, Teacher Mode, Step Registry, Lesson Engine, or complex Router.
- Before committing, run `npm.cmd test` and `npm.cmd run build`.

---

### Task 1: Configure the independent Vite application

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`

**Interfaces:**
- Produces: `npm.cmd run dev`, `npm.cmd test`, and `npm.cmd run build` scripts.
- Produces: `#app` as the sole application mount point.

- [ ] **Step 1: Add the package scripts and narrow dependencies**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": { "katex": "^0.16.22" },
  "devDependencies": { "vite": "^6.3.5", "vitest": "^3.2.4" }
}
```

- [ ] **Step 2: Add the Vite test include rule and HTML mount point**

```js
export default defineConfig({ test: { environment: "node", include: ["tests/**/*.test.js"] } });
```

```html
<main id="app" aria-label="二次函数互动课堂"></main>
```

### Task 2: Define and verify the course configuration

**Files:**
- Create: `src/course.js`
- Create: `tests/course.test.js`

**Interfaces:**
- Produces: `COURSE`, an ordered frozen array of `{ id, number, title }` objects.
- Produces: `getLessonById(id)` and `validateCourse(course)` for the application and test.

- [ ] **Step 1: Write the failing course test**

```js
expect(COURSE).toHaveLength(11);
expect(new Set(COURSE.map((lesson) => lesson.id)).size).toBe(11);
expect(validateCourse(COURSE)).toBe(true);
```

- [ ] **Step 2: Run the focused test and confirm it fails before the module exists**

Run: `npm.cmd test -- tests/course.test.js`

Expected: FAIL because `src/course.js` is absent.

- [ ] **Step 3: Implement the smallest valid central configuration**

```js
export const COURSE = Object.freeze([
  { id: "lesson-01", number: "01", title: "二次函数的概念" },
  { id: "lesson-02", number: "02", title: "y=ax²" },
  { id: "lesson-03", number: "03", title: "y=ax²+k" },
  { id: "lesson-04", number: "04", title: "y=a(x-h)²" },
  { id: "lesson-05", number: "05", title: "y=a(x-h)²+k" },
  { id: "lesson-06", number: "06", title: "y=ax²+bx+c" },
  { id: "lesson-07", number: "07", title: "二次函数图象与 x 轴的交点" },
  { id: "lesson-08", number: "08", title: "利用二次函数图象求一元二次方程近似解" },
  { id: "lesson-09", number: "09", title: "实际问题与二次函数（一）" },
  { id: "lesson-10", number: "10", title: "实际问题与二次函数（二）" },
  { id: "lesson-11", number: "11", title: "实际问题与二次函数（三）" },
]);

export function getLessonById(id) {
  return COURSE.find((lesson) => lesson.id === id) ?? null;
}
```

- [ ] **Step 4: Run the focused test and confirm it passes**

Run: `npm.cmd test -- tests/course.test.js`

Expected: PASS.

### Task 3: Build the classroom shell and formula boundary

**Files:**
- Create: `src/formula.js`
- Create: `src/main.js`
- Create: `src/styles.css`

**Interfaces:**
- Consumes: `COURSE` and `getLessonById()`.
- Produces: sidebar buttons with `href="#lesson-XX"`, `aria-current="page"` on selection, and a readable shared pending-content stage.
- Produces: `renderFormula(element, latex, options)` with KaTeX output or source-text fallback.

- [ ] **Step 1: Implement formula rendering with a text fallback**

```js
export function renderFormula(element, latex, { displayMode = false, ariaLabel = "" } = {}) {
  try { katex.render(String(latex), element, { displayMode, output: "htmlAndMathml", throwOnError: true, trust: false }); }
  catch { element.textContent = String(latex); }
}
```

- [ ] **Step 2: Implement native hash selection and rendering**

```js
function selectedLesson() {
  return getLessonById(window.location.hash.slice(1)) ?? COURSE[0];
}

window.addEventListener("hashchange", render);
render();
```

- [ ] **Step 3: Add responsive whiteboard styles**

```css
@import "katex/dist/katex.min.css";
.classroom { min-height: 100svh; display: grid; grid-template-columns: 19rem minmax(0, 1fr); }
@media (max-width: 760px) { .classroom { grid-template-columns: 1fr; } }
```

### Task 4: Install, verify, inspect, and commit the initial shell

**Files:**
- Create: `package-lock.json`
- Create: `.gitignore`
- Modify: all Task 1–3 files only as verification requires.

**Interfaces:**
- Produces: a buildable production bundle and a clean Git worktree.

- [ ] **Step 1: Install declared dependencies**

Run: `npm.cmd install`

Expected: `package-lock.json` is generated and contains only Vite, Vitest, KaTeX, and their transitive dependencies.

- [ ] **Step 2: Run all automated verification**

Run: `npm.cmd test`

Expected: PASS.

Run: `npm.cmd run build`

Expected: Vite build completes successfully.

- [ ] **Step 3: Inspect classroom layouts in a real browser**

Set viewport sizes to 1920×1080, 1366×768, and 1280×720. Confirm the sidebar remains usable, type is projection-sized, the main stage has room, and no page-level horizontal overflow is present.

- [ ] **Step 4: Amend the initial local commit with the complete verified shell**

```bash
git add index.html package.json package-lock.json vite.config.js .gitignore src tests docs/superpowers
git commit --amend -m "chore: initialize quadratic functions lite classroom shell"
```

- [ ] **Step 5: Create and connect the GitHub repository after local verification**

Run `gh repo create quadratic-functions-lite --public --source . --remote origin --push` only if the GitHub CLI is installed and authenticated. Otherwise stop and ask the owner to create an empty public GitHub repository, then add its provided HTTPS remote and push `main`.
