# Lesson 02 Lite Migration Design

## Goal

Migrate the established classroom effect of legacy Lesson 2, `y=ax²`, into the Lite application without carrying over the legacy application's routing, lifecycle, teacher controls, Canvas engine, CSS system, or broad test suite.

## Audited legacy material

Legacy Lesson 2 has 12 classroom stages: a bridge from the general form; nine-point plotting; a smooth-curve reveal; two paper-drawing prompts; sign and magnitude comparisons; a progressive summary; single- and pair-function challenges; a misconception check; and a bridge to `y=ax²+k`.

### Direct-copy candidates

- The stage order, Chinese teaching copy, LaTeX strings, exercises, reveal prompts, property-table values, and question flow from `js/lessons/lesson02.js` and `js/steps/lesson02/lesson02-renderers.js`.
- `js/steps/lesson02/lesson02-state.js`: the nine x-values, non-zero teaching-friendly coefficient pool, fraction formatting, plotter state, and deterministic random challenge state. It has no legacy UI dependency.
- The Lesson 2-specific visual ideas from the limited `lesson02-*` CSS rules: graph-plus-workbench layouts, paper prompts, comparison tables, progressive summary, and restrained green/orange accent treatments. Rules are rewritten into the existing Lite stylesheet rather than copied wholesale.

### Pure math retained locally

- `y=ax²` evaluation for supplied `x` values.
- Coefficient LaTeX formatting for `±1`, `±1/2`, `±1/3`, and `±1/5`.
- Point creation and absolute-value comparison for the challenges.

Lesson 2 does not require the legacy graph-math module's root, discriminant, line-intersection, or general vertex-form functions.

### Legacy dependencies deliberately excluded

- `Step Registry`, `Lesson Engine`, and old hash router. The only legacy call to the engine, `goNext()` after plotting, becomes a local advance callback.
- `Teacher Mode`, renderer handles, teacher actions, and reset/destroy conventions that exist only for the old shell.
- Old Graph Controls, zoom controls, draggable points, arbitrary lines, roots, vertex labels, and multi-purpose graph APIs.
- Old Canvas graph engine and its resize, pointer, multi-series, ghost, animation, and lifecycle infrastructure.
- Old CSS layers and integration tests.

## Minimal Lite implementation

Create only these new production modules:

```text
src/
├── lessons/
│   ├── lesson02.js        # stage data plus DOM renderers for all 12 Lesson 2 stages
│   └── lesson02-state.js  # migrated pure state and coefficient helpers
└── graph/
    └── parabola-svg.js    # narrow SVG renderer used first by Lesson 2
```

`src/main.js` gains one small conditional branch: when the selected course id is `lesson-02`, it mounts `lesson02.js`; all other lessons retain the shared Lite pending stage. Lesson 2 owns its current stage in the hash as `#lesson-02/step-01` through `#lesson-02/step-12`; hash parsing remains a short local helper, not a reusable router. Sidebar links to Lesson 2 normalize to its first stage.

`parabola-svg.js` exposes only the operations that Lesson 2 visibly needs: coordinate axes and tick labels, one or more `y=ax²` paths, plotted points, partial curve drawing, simple coefficient updates, and a short requestAnimationFrame reveal. It has no drag support, zoom, generic control panel, roots, vertex decorations, arbitrary line support, or future-facing extension API.

`src/styles.css` receives a Lesson 2-scoped section using the Lite type scale, colors, and responsive grid rules. It does not import legacy CSS.

## Interaction and accessibility

- The plotter keeps the curve hidden until all nine values have been selected and the teacher chooses to connect them.
- Reveal buttons disclose one conclusion at a time; all controls are native buttons or range inputs with clear labels.
- The SVG has a short text alternative naming the active function and exposes visible points and formula changes in readable surrounding text.
- Browser back/forward works across Lesson 2 stages through the hash; a malformed Lesson 2 stage resolves to `step-01`.

## Verification and commit boundary

Add focused tests for plotter gating, coefficient formatting, random challenge correctness, and malformed Lesson 2 stage fallback. Verify the full test suite, production build, and the 1920×1080, 1366×768, and 1280×720 classroom layouts in a browser. Commit and push only the verified Lesson 2 paths with:

```text
feat: migrate lesson 02 to lite architecture
```

Only after that commit and browser acceptance may Lesson 3 be audited against the resulting small SVG capability. Lesson 4 remains deferred; its partial implementation lives in the legacy branch `codex/lesson-04-horizontal-shift`, not legacy `main`.
