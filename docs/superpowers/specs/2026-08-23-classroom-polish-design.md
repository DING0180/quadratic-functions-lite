# Classroom visual polish design

## Goal

Polish the existing single Vite classroom so every current Lesson reads as one projection-first mathematics product. Preserve the current course sequence, step counts, formulas, interactions, KaTeX pipeline, and lightweight SVG graph renderer. This is a visual and interaction pass only; Lesson 10 and Lesson 11 remain the existing generic placeholders.

## Visual system

- Use a quiet off-white stage, a low-contrast green navigation rail, and one orange focus accent. Keep surfaces sparse: one purposeful graph/work area rather than nested dashboard cards.
- Establish shared CSS variables for text, muted text, borders, surfaces, focal colors, radii, shadows, spacing, focus rings, and motion. Existing lesson class names remain supported.
- Normalize button, reveal, secondary action, range input, formula, graph panel, callout, navigation, and step-control styles through low-specificity shared selectors. Preserve per-lesson layout and instructional copy.
- Make classroom-sized layouts fit at 1920×1080, 1366×768, and 1280×720 without hiding step navigation or the main action. Small screens retain their existing horizontal lesson navigation and a readable vertical stage.

## Graph semantics

- Keep `createParabolaGraph` as the sole renderer. Add semantic SVG hooks/classes and CSS for neutral axes/grid, primary curves, muted contextual curves, highlighted curve segments, vertices/roots, symmetry axes, guides, and annotations.
- Add a subtle grid and a labelled plot boundary where it improves orientation, while keeping labels direct and clipped to the plot area. Retain current graph options and output classes so existing lessons and tests stay compatible.
- Use existing curve colors as an input contract; CSS supplies the consistent visual hierarchy and accessible weights. Do not infer or change mathematical data.

## Motion and accessibility

- Standardize reveal, focus, curve drawing, button feedback, and control transitions with CSS custom properties. Respect `prefers-reduced-motion`.
- Retain native controls, keyboard focus, accessible SVG names, and KaTeX MathML. Add no hover-only essential state.

## Verification

- Add focused regression tests for the shared graph output and classroom shell class hooks; retain all existing lesson tests.
- Use browser checks to visit every Lesson and operate its available next/previous/reveal/reset/random/slider controls. Check all mandated desktop classroom resolutions, then rerun for any observed clipping, collision, overflow, console-error, or hash-routing issue.
- Run `npm.cmd test` and `npm.cmd run build`; after commit, push `main` and validate the published Pages site when network access permits.
