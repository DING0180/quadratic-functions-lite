# Lesson 01 Migration Design

## Goal

Replace the formal site's Lesson 01 placeholder with the established "二次函数的概念" classroom lesson, while preserving the existing Vite application, Sidebar, hash routing, KaTeX renderer, design system, and all other lessons.

## Source and scope

The standalone source could not be fetched from GitHub in the current network environment. Its locally preserved Lesson 01 implementation is the migration reference. It supplies eight teaching stages: linear-to-quadratic bridge, general form, terms and coefficients, formula scanning, quadratic classification, worked examples, a real-world model, and a summary bridge to Lesson 02.

Only Lesson 01 content, interactions, scoped styling, and tests are in scope. No source-repository Git history, app shell, Router, Sidebar, global CSS reset, dependency, or second graph engine is copied.

## Architecture

Add `src/lessons/lesson01.js` and `src/lessons/lesson01.css`, matching the existing Lesson 02–08 renderer contract: `renderLesson01(stage, { step, onStepChange, random })` returns a destroy handle and renders one of eight local stages. `src/main.js` imports the renderer and adds Lesson 01 to its existing route dispatch and step hashing; `src/course.js` declares `stepCount: 8` for the already-registered lesson.

All formula output uses `renderFormula`. State is local to the active Lesson renderer, so navigating away drops listeners and navigation never creates a second application shell. Lesson 01 CSS is class-prefixed and responsive, including a compact height mode for 1280×720 and 1366×768 teaching stages.

## Interaction and content contract

- Reveal sequence: bridge and general-form stages disclose essential conclusions only after explicit learner action.
- Term/coefficent colors are linked on the general-form stage; formula scanning selects a term and reports its name and coefficient.
- Classification uses a deterministic supplied random function and has a reset/new-question action.
- Examples include standard form, expansion, quadratic-term cancellation, and parameter conditions.
- The model stage includes a range control, formula reveal, and an explicit negative-solution misconception check.
- Every stage has existing-app previous/next controls and the last stage returns to step 1.

## Testing and verification

Tests will use the real Lesson 01 renderer in jsdom to prove step count, route integration, initially hidden reveals, color-linked scanning, deterministic random practice/reset behavior, model interactions, and lifecycle cleanup. Run the complete test suite and Vite production build after integration. Browser checks will exercise 1920×1080, 1366×768, and 1280×720 viewports plus a quick Lesson 02 regression.
