# 全站双语术语层 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 Homepage 与 Lesson 01–11 建立统一的中英数学术语层，保持中文教学、数学内容和现有视觉结构不变。

**Architecture:** `src/math-terms.js` 是术语、短 UI 标签和英文步骤副标题的单一来源。每个 lesson 沿用既有 DOM 与交互，仅引用共享文本；Sidebar 保持 `src/course.js` 中的中文标题。CSS 只新增低权重副标题和既有按钮容器的溢出保护。

**Tech Stack:** Vite 6、原生 ES modules、KaTeX、Vitest、in-app Browser Playwright API。

**Spec:** `docs/superpowers/specs/2026-08-28-bilingual-terminology-design.md`

## Global Constraints

- 中文为主；不得逐句翻译题干、解释、反馈或数学答案。
- 不新增 i18n、语言切换、依赖、框架、页面、路由或部署配置。
- Sidebar 只显示现有中文课程标题；不拼接英文。
- 只使用 glossary 固定译法；不修改公式、图像、数学状态、步骤数、色彩、动画或工作区结构。
- 在 1920×1080、1366×768、1280×720 对 Homepage 与 Lesson 01–11 做 Playwright QA。

---

### Task 1: Shared glossary and executable contract

**Files:**
- Create: `src/math-terms.js`
- Create: `tests/math-terms.test.js`
- Modify: `tests/course.test.js`

**Interfaces:**
- Produces frozen `TERMS`, `UI`, `STEP_SUBTITLES`, `term(key)`, `getStepSubtitle(lessonId, step)`.
- `term(key)` returns `中文 (English)`; both functions throw `RangeError` on invalid lookup.

- [ ] **Step 1: Write a failing focused test**

```js
import { expect, it } from "vitest";
import { TERMS, UI, STEP_SUBTITLES, getStepSubtitle, term } from "../src/math-terms.js";

it("publishes canonical bilingual math text", () => {
  expect(term("vertex")).toBe("顶点 (vertex)");
  expect(term("axisOfSymmetry")).toBe("对称轴 (axis of symmetry)");
  expect(TERMS.generalForm.en).toBe("general form");
  expect(TERMS.vertexForm.en).toBe("vertex form");
  expect(UI.revealAnswer).toBe("Reveal Answer");
  expect(Object.keys(STEP_SUBTITLES)).toHaveLength(11);
  expect(getStepSubtitle("lesson-01", 1)).toBe("Bridge In: Linear to Quadratic Functions");
});
```

- [ ] **Step 2: Run the test and observe failure**

Run: `npm.cmd test -- tests/math-terms.test.js`

Expected: FAIL because the new module is absent.

- [ ] **Step 3: Implement the shared module**

Add the 24 approved entries: linear/quadratic function, parabola, general/vertex form, vertex, axis of symmetry, root/real root/intersection/discriminant, domain/interval/endpoint, maximum/minimum, opens upward/opens downward, translation, three terms and two coefficients. Add `UI.previous`, `UI.next`, `UI.restartLesson`, `UI.revealAnswer`, `UI.reset`, `UI.newQuestion`, `UI.checkWithGraph`, `UI.showMovement`, `UI.startLearning`, `UI.home`. Add all Lesson 01–11 step subtitles, including `From General Form to Vertex Form`, `Quadratic Functions & x-axis Intersections`, `Approximate Roots & Graph Inequalities`, `Extrema on an Interval`, `Revenue, Cost & Profit`, and `Arch Design Modelling`.

- [ ] **Step 4: Verify and commit**

Run: `npm.cmd test -- tests/math-terms.test.js tests/course.test.js`

Expected: PASS and course Sidebar assertions remain Chinese.

```powershell
git add src/math-terms.js tests/math-terms.test.js tests/course.test.js
git commit -m "feat: add bilingual terminology glossary"
```

### Task 2: Homepage, shell, and Lessons 01–04

**Files:**
- Modify: `src/home.js`, `src/main.js`, `src/home.css`, `src/styles.css`
- Modify: `src/lessons/lesson01.js`, `lesson02.js`, `lesson03.js`, `lesson04.js`
- Modify: `src/lessons/lesson01.css`, `lesson02.css`, `lesson03.css`, `lesson04.css`
- Modify: `tests/home-routing.test.js`, `tests/home-graph-motion.test.js`, `tests/sidebar-collapse.test.js`, `tests/lesson01.test.js`, `tests/lesson02-render.test.js`, `tests/lesson03.test.js`, `tests/lesson04.test.js`

**Interfaces:**
- Consumes Task 1 exports.
- Produces Chinese `h2` followed by a small `.lessonNN-title-subtitle`, canonical property labels, compact English UI, and unchanged Chinese Sidebar titles.

- [ ] **Step 1: Write failing DOM assertions**

```js
expect(document.body.textContent).toContain("顶点式 (vertex form)");
expect(document.body.textContent).toContain("一般式 (general form)");
expect(stage.querySelector(".lesson01-title-subtitle").textContent).toBe("Bridge In: Linear to Quadratic Functions");
expect(stage.textContent).toContain("二次项 (quadratic term)");
expect(stage.textContent).toContain("顶点 (vertex)");
expect(stage.textContent).toContain("对称轴 (axis of symmetry)");
```

- [ ] **Step 2: Run affected tests and observe failure**

Run: `npm.cmd test -- tests/home-routing.test.js tests/home-graph-motion.test.js tests/sidebar-collapse.test.js tests/lesson01.test.js tests/lesson02-render.test.js tests/lesson03.test.js tests/lesson04.test.js`

Expected: FAIL only for the new language assertions.

- [ ] **Step 3: Implement language-only changes**

Use `term`, `UI`, and `getStepSubtitle` in the Homepage and each root factory. Add subtitle immediately after existing Chinese `h2`; replace only formula-panel/property/readout/reveal/random-practice keyword labels. Replace matching controls with short UI text but retain `data-*`, equations, random seeds, callbacks and Chinese explanatory sentences. Keep `COURSE[*].title` untouched.

- [ ] **Step 4: Add compact title styling**

Add `.lesson-title-subtitle` and per-lesson subtitle selectors beside existing title rules: muted green, `clamp(.78rem, 1.1vw, .98rem)`, line-height `1.35`, no nowrap. At low-height desktop breakpoints alter only subtitle size/margin; do not shrink graph hosts.

- [ ] **Step 5: Verify and commit**

Run: `npm.cmd test`

Expected: PASS with unchanged routing, graphs, answer hiding and math state.

```powershell
git add src/home.js src/main.js src/home.css src/styles.css src/lessons/lesson01.js src/lessons/lesson02.js src/lessons/lesson03.js src/lessons/lesson04.js src/lessons/lesson01.css src/lessons/lesson02.css src/lessons/lesson03.css src/lessons/lesson04.css tests/home-routing.test.js tests/home-graph-motion.test.js tests/sidebar-collapse.test.js tests/lesson01.test.js tests/lesson02-render.test.js tests/lesson03.test.js tests/lesson04.test.js
git commit -m "feat: bilingualize homepage and foundational lessons"
```

### Task 3: Lessons 05–08

**Files:**
- Modify: `src/lessons/lesson05.js`, `lesson06.js`, `lesson07.js`, `lesson08.js`
- Modify: `src/lessons/lesson05.css`, `lesson06.css`, `lesson07.css`, `lesson08.css`
- Modify: `tests/lesson05.test.js`, `lesson06.test.js`, `lesson07.test.js`, `lesson08.test.js`, `lesson06-routing.test.js`, `lesson07-routing.test.js`, `lesson08-routing.test.js`

**Interfaces:**
- Consumes Task 1 exports.
- Produces uniform general/vertex form, vertex, axis, root, real root, intersection, discriminant, domain, interval and endpoint labels.

- [ ] **Step 1: Write failing assertions and verify failure**

```js
expect(stage.textContent).toContain("顶点式 (vertex form)");
expect(stage.textContent).toContain("一般式 (general form)");
expect(stage.textContent).toContain("判别式 (discriminant)");
expect(stage.textContent).toContain("定义域 (domain)");
expect(stage.textContent).toContain("区间 (interval)");
```

Run: `npm.cmd test -- tests/lesson05.test.js tests/lesson06.test.js tests/lesson07.test.js tests/lesson08.test.js`

Expected: FAIL only on new labels.

- [ ] **Step 2: Implement, test and commit**

Append subtitles; use glossary in property/readout/reveal labels; use `UI.revealAnswer`, `UI.reset`, `UI.newQuestion`, `UI.checkWithGraph`, `UI.showMovement` only for matching controls. Preserve equations, values, callbacks, graph host dimensions and answer gates. Add subtitle styles beside each existing title rule. Run the focused suite, routing suites and `npm.cmd test`; all must PASS.

```powershell
git add src/lessons/lesson05.js src/lessons/lesson06.js src/lessons/lesson07.js src/lessons/lesson08.js src/lessons/lesson05.css src/lessons/lesson06.css src/lessons/lesson07.css src/lessons/lesson08.css tests/lesson05.test.js tests/lesson06.test.js tests/lesson07.test.js tests/lesson08.test.js tests/lesson06-routing.test.js tests/lesson07-routing.test.js tests/lesson08-routing.test.js
git commit -m "feat: bilingualize roots and transformation lessons"
```

### Task 4: Lessons 09–11

**Files:**
- Modify: `src/lessons/lesson09.js`, `lesson10.js`, `lesson11.js`
- Modify: `src/lessons/lesson09.css`, `lesson10.css`, `lesson11.css`
- Modify: `tests/lesson09.test.js`, `lesson10-11.test.js`, `lesson09-routing.test.js`

**Interfaces:**
- Consumes Task 1 exports.
- Produces uniform interval, endpoint, maximum, minimum, vertex, axis, parabola and quadratic function terms while retaining model calculations.

- [ ] **Step 1: Add failing assertions and verify failure**

```js
expect(stage.textContent).toContain("区间 (interval)");
expect(stage.textContent).toContain("端点 (endpoint)");
expect(stage.textContent).toContain("最大值 (maximum)");
expect(stage.textContent).toContain("最小值 (minimum)");
expect(stage.textContent).toContain("顶点 (vertex)");
```

Run: `npm.cmd test -- tests/lesson09.test.js tests/lesson10-11.test.js tests/lesson09-routing.test.js`

Expected: FAIL because labels remain Chinese-only.

- [ ] **Step 2: Implement, test and commit**

Add subtitles; replace only property/readout/reveal/random-practice labels. Lesson 09 uses interval/endpoint/domain/extrema, Lesson 10 uses revenue/cost/profit/maximum, Lesson 11 uses vertex/axis/parabola/quadratic function. Preserve model formulae, random states and reveal gating. Add compact subtitle CSS, run the focused suite and `npm.cmd test`, then commit.

```powershell
git add src/lessons/lesson09.js src/lessons/lesson10.js src/lessons/lesson11.js src/lessons/lesson09.css src/lessons/lesson10.css src/lessons/lesson11.css tests/lesson09.test.js tests/lesson10-11.test.js tests/lesson09-routing.test.js
git commit -m "feat: bilingualize modelling lesson terminology"
```

### Task 5: Build, Playwright QA, publish, and Pages QA

**Files:**
- Modify only after reproduced overflow: exact affected `src/home.css`, `src/styles.css`, or `src/lessons/lessonNN.css`.

- [ ] **Step 1: Run final automation**

```powershell
npm.cmd test
npm.cmd run build
```

Expected: all Vitest tests pass and Vite emits `dist/`.

- [ ] **Step 2: Start the Vite server and inspect all pages**

Run: `npm.cmd run dev -- --host 127.0.0.1`

At 1920×1080, 1366×768 and 1280×720 visit `#home` and `#lesson-01/step-01` through `#lesson-11/step-01`. For each route collect DOM state, assert `document.documentElement.scrollWidth <= window.innerWidth`, inspect buttons, formula visibility and SVG graph dimensions, and read console errors.

Expected: no console error or horizontal overflow; unchanged Sidebar width; visible graph; no unwanted 1280×720 body scroll except an intentional scrollable workbench.

- [ ] **Step 3: Correct only demonstrated CSS overflow**

Shorten only the affected English subtitle or reduce its own low-height margin/font size. Never reduce graph host or SVG dimensions. Repeat the failing viewport and route check.

- [ ] **Step 4: Finalize and publish**

```powershell
npm.cmd test
npm.cmd run build
git status
git diff
git diff --cached
git fetch origin
git push origin main
```

Expected: test/build PASS; no unintended changes; push fast-forwards `main`.

- [ ] **Step 5: Verify deployment**

Wait for `Deploy GitHub Pages` on `main`, then verify Homepage, Sidebar, Lessons 01, 06, 08 and 11 at `https://ding0180.github.io/quadratic-functions-lite/` for bilingual terminology, KaTeX, graphs and console errors. Report deployed SHA and all three viewport results.
