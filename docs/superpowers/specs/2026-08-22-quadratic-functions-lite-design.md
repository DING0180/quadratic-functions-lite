# Quadratic Functions Lite Design

## Goal

Build a lightweight, classroom-first quadratic-functions demonstration website. It will be a new Vite application, independent from the legacy repository. The first implementation stage provides the shared classroom shell and Lesson 1–11 entry points only; it does not migrate or invent lesson content.

## Scope and constraints

- Keep the legacy project at `D:\桌面\二次函数` read-only as a reference library.
- Create and maintain the product only in this repository.
- Use Vite, native HTML/CSS/ES modules, and KaTeX. Vitest is development-only.
- Do not use React, Vue, a backend, a database, AI APIs, a UI framework, a state-management library, or an animation framework.
- Prioritize 1920×1080, 1366×768, and 1280×720 classroom displays. Mobile needs basic usability only.
- Use a whiteboard-like visual language: large type, restrained borders and shadows, high contrast, and one main teaching task per screen.
- New instructional content is added only after the teacher supplies that lesson's revised design. In particular, Lesson 2–11 receive no fabricated content or bespoke interactions in this stage.

## Architecture

The initial product has one HTML entry point and one application controller. `src/course.js` is the single course configuration, defining the 11 lesson identifiers, numbers, and supplied titles. `src/main.js` creates the sidebar and main stage, keeps the selected lesson in a small hash value, and renders either the approved lesson view or a single shared pending-content view. It will not introduce a Router, Lesson Engine, Step Registry, or component framework.

`src/formula.js` is the only formula boundary. It renders trusted local LaTeX via KaTeX with HTML-and-MathML output and a readable text fallback. `src/styles.css` owns all visual styling in one file for this first stage.

No graph module is included initially. Once an approved lesson needs a graph, add one focused SVG module under `src/graph/`; its public API will be limited to that lesson's required curve, axes, labels, and points. Do not port the legacy Canvas engine.

```text
quadratic-functions-lite/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.js
│   ├── course.js
│   ├── formula.js
│   └── styles.css
├── tests/
│   └── course.test.js
└── docs/superpowers/specs/
    └── 2026-08-22-quadratic-functions-lite-design.md
```

## Data flow and interaction

On load, `main.js` selects the lesson given by `location.hash`; a missing or invalid hash resolves to Lesson 1. Clicking a sidebar entry updates the hash and re-renders the main stage. The configuration is static, no persistence is required, and the browser back/forward controls work through the standard `hashchange` event.

The default lesson renderer displays the lesson number and title plus one concise pending message. Its role is to confirm navigation and provide a stable target until an approved lesson module replaces it. Lesson modules, formula rendering, and graph utilities are introduced only when their specific lesson requirements arrive.

## Reuse decisions

The following legacy material may be selectively copied after the corresponding lesson design approves it: the KaTeX wrapper, pure quadratic math functions, coefficient/fraction formatting, deterministic random-question state, course labels, and vetted teaching text.

The following is reference-only: the Canvas graph engine, Step Registry, Lesson Engine, Teacher Mode, generic graph controls, broad component catalog, full CSS system, and old integration tests. Their teaching ideas may inform a smaller implementation, but their architecture does not transfer.

## Error handling and accessibility

The application must keep a usable default lesson if the hash is malformed. Formula rendering must show source text if KaTeX rejects input. Navigation uses buttons, identifies the selected lesson with `aria-current`, and remains keyboard operable. The main stage announces a lesson change without forcing focus away from a teacher's controls.

## Verification

The initial scaffold must have one focused test that checks all 11 lessons are present and uniquely identified. After each Lesson is added, test its own pure logic and its critical interaction states; avoid porting legacy tests for unused abstractions. Before commits, run `npm.cmd test` and `npm.cmd run build` in the new repository. Deployment configuration for GitHub Pages is added only once the GitHub repository and its required base path are known.
