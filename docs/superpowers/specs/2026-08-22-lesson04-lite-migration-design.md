# Lesson 04 Lite Migration Design

## Goal

Migrate the finished horizontal-shift discovery sequence from the legacy Lesson 04 into the existing Lite classroom. The lesson covers `y=x^2` to `y=(x-1)^2`, ending with the rule that replacing `x` by `x-1` shifts the graph one unit to the right.

## Scope

The Lite lesson will have five local steps:

1. Predict whether `y=(x-1)^2` moves left or right.
2. Plot the nine baseline points of `y=x^2` for `x=-4...4`.
3. Plot the ten points of `y=(x-1)^2` for `x=-4...5`, then connect the curve.
4. Compare the baseline and shifted parabolas.
5. Reveal or play the nine corresponding `(x,y)` to `(x+1,y)` arrows.

Legacy point tables, Chinese teaching copy, formulae, reveal timing, colours, and the 650 ms arrow playback are preserved. The legacy plan's unimplemented generalisation, property exploration, random challenge, and bridge-out are excluded.

## Architecture

`src/lessons/lesson04.js` will follow the existing `renderLesson02` lifecycle: it renders one step into the shared stage, updates the browser hash through a supplied callback, and releases timers when destroyed. `src/lessons/lesson04-state.js` will hold immutable coordinate tables, translation arrows, and pure formatting/property helpers copied from the legacy math module.

The existing KaTeX wrapper renders all formulas. `createParabolaGraph` remains the sole graph system. Its options will gain backward-compatible point colour/radius and arrow support, sufficient for Lesson 04 without importing the legacy Canvas engine or a separate graph implementation. `src/main.js` receives only Lesson 04 step-hash normalization and renderer selection alongside the existing Lesson 2 integration.

## Interaction and Accessibility

All interactions use native buttons. Guess and arrow controls expose `aria-pressed`; changing status text uses a polite live region. Curves, coloured points, arrows, and their labels render in the existing SVG graph with an accessible graph label. Destroying the lesson cancels arrow playback.

## Verification

Tests cover exact point and arrow data, formula/property helpers, coloured-point and arrow rendering, the five step states, reveal/reset/destroy behavior, and hash routing to Lesson 04. The existing full Vitest suite and production build remain the final checks.
