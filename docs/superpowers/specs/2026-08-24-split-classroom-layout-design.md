# Split Classroom Layout Design

## Goal

Make graph-and-workspace lesson steps read as one responsive mathematics workbench: a compact, actionable workspace at left and a primary quadratic graph at right, without changing lesson content, sequence, or mathematical behaviour.

## Existing architecture

The single Vite application mounts one shared classroom shell in `src/main.js`. Lessons 01–09 are registered through `src/course.js`, render their steps in their modules, use KaTeX through `src/formula.js`, and use the shared SVG renderer in `src/graph/parabola-svg.js`. Lessons 10–11 remain shared-shell placeholder routes and contain no lesson graph or workspace.

## Layout contract

Use the shared `classroom-split`, `classroom-workspace`, `classroom-visualization`, and `classroom-controls` classes for eligible graph-and-workspace steps.

- At 1280px and wider, the split is `minmax(18rem, 34fr) minmax(0, 66fr)`.
- From 1024px through 1279px, it becomes `minmax(20rem, 38fr) minmax(0, 62fr)`.
- Below 1024px it stacks, retaining workspace before visualization in reading order.
- The visualization panel gets a responsive graph drawing height; SVGs fill their host while preserving the graph engine's coordinate geometry.
- Workspace controls wrap in rows; answer/reveal material remains inside the workspace and does not create a full-width key-idea band.
- Step navigation remains outside the split layout at the lesson root.

## Scope

Audit all implemented Lesson 01–09 steps and convert only pages that actually co-locate a mathematical graph with a question, controls, a lab, or answer/reveal workbench. Preserve summary, bridge, formula-only, graph-only, and no-graph steps. Lessons 10–11 are not candidates because their shared placeholder has neither a graph nor a workspace.

## Verification

Add DOM coverage for the shared split contract, run the entire Vitest suite and Vite build, then use Playwright/browser automation at 1920×1080, 1366×768, and 1280×720 to exercise representative Random, Reveal, Reset, sliders, Check Answer/Graph, and study-mode controls. Measure rendered graph and host rectangles to compare visible graph area before and after the shared layout.
