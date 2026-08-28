import schoolLogoUrl from "./assets/depu-school-logo.jpg";
import { renderFormula } from "./formula.js";
import { createParabolaGraph } from "./graph/parabola-svg.js";
import { term } from "./math-terms.js";
import "./home.css";

function element(tag, className, text = "") {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

const HOME_GRAPH_VIEWPORT = Object.freeze({ xMin: -3, xMax: 5, yMin: -4, yMax: 10, xTickStep: 1, yTickStep: 2 });
const HOME_GRAPH_START = Object.freeze({ h: 0, k: 0 });
const HOME_GRAPH_FINAL = Object.freeze({ h: 1, k: -2 });
const HOME_GRAPH_DURATION = 2400;
const HOME_GRAPH_SNAP = 0.5;
const HOME_GRAPH_DRAG_BOUNDS = Object.freeze({ hMin: -2.5, hMax: 4.5, kMin: -3, kMax: 8 });

function roundForDisplay(value) {
  const rounded = Math.round(value * 10) / 10;
  return Math.abs(rounded) < 0.05 ? 0 : rounded;
}

function displayNumber(value) {
  return String(roundForDisplay(value)).replace("-", "−");
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function snapVertex(value) {
  return roundForDisplay(Math.round(value / HOME_GRAPH_SNAP) * HOME_GRAPH_SNAP);
}

function normalizeVertex({ h, k }) {
  return {
    h: snapVertex(clamp(h, HOME_GRAPH_DRAG_BOUNDS.hMin, HOME_GRAPH_DRAG_BOUNDS.hMax)),
    k: snapVertex(clamp(k, HOME_GRAPH_DRAG_BOUNDS.kMin, HOME_GRAPH_DRAG_BOUNDS.kMax)),
  };
}

function homeFormulaState({ h, k }) {
  const horizontal = roundForDisplay(h);
  const vertical = roundForDisplay(k);
  if (horizontal === 0 && vertical === 0) return { latex: "y=x^2", ariaLabel: "y 等于 x 平方" };
  if (horizontal === 1 && vertical === -2) return { latex: "y=(x-1)^2-2", ariaLabel: "y 等于 x 减一的平方减二" };
  const horizontalTerm = horizontal === 0 ? "x" : `x${horizontal > 0 ? "-" : "+"}${Math.abs(horizontal)}`;
  const verticalTerm = vertical === 0 ? "" : `${vertical > 0 ? "+" : "-"}${Math.abs(vertical)}`;
  return { latex: `y=(${horizontalTerm})^2${verticalTerm}`, ariaLabel: `二次函数，顶点为 ${displayNumber(horizontal)}，${displayNumber(vertical)}` };
}

function generalFormulaState({ h, k }) {
  const horizontal = roundForDisplay(h);
  const vertical = roundForDisplay(k);
  const linear = roundForDisplay(-2 * horizontal);
  const constant = roundForDisplay(horizontal ** 2 + vertical);
  const signedTerm = (value, suffix = "") => value === 0 ? "" : `${value > 0 ? "+" : "-"}${Math.abs(value)}${suffix}`;
  const spokenTerm = (value, suffix = "") => value === 0 ? "" : `${value > 0 ? "加" : "减"} ${Math.abs(value)}${suffix}`;
  return {
    latex: `y=x^2${signedTerm(linear, "x")}${signedTerm(constant)}`,
    ariaLabel: `一般式：y 等于 x 平方${spokenTerm(linear, "x")}${constant === 0 ? "" : ` ${spokenTerm(constant)}`}`,
  };
}

function graphOptions({ h, k }) {
  const point = { x: roundForDisplay(h), y: roundForDisplay(k) };
  return {
    viewport: HOME_GRAPH_VIEWPORT,
    plotPadding: 26,
    curves: [{ a: 1, h: point.x, k: point.y, color: "#075445" }],
    points: [{
      ...point,
      color: "#e34d45",
      radius: 8,
      className: "home-vertex-handle",
      attributes: {
        role: "slider",
        tabindex: "0",
        "aria-label": "拖拽顶点以改变二次函数图象",
        "aria-valuetext": `顶点 V(${displayNumber(point.x)}, ${displayNumber(point.y)})`,
      },
    }],
    guides: [{ x: point.x, color: "#bd842e" }],
    labels: [{ x: point.x + 0.25, y: point.y + 0.8, text: `V(${displayNumber(point.x)}, ${displayNumber(point.y)})` }],
    ariaLabel: `二次函数图象，顶点为 ${displayNumber(point.x)}，${displayNumber(point.y)}，对称轴 x 等于 ${displayNumber(point.x)}`,
  };
}

function easeInOut(progress) {
  return progress < 0.5 ? 4 * progress * progress * progress : 1 - ((-2 * progress + 2) ** 3) / 2;
}

export function createHomeLanding() {
  const page = element("main", "home-shell");
  page.setAttribute("aria-labelledby", "home-title");

  const header = element("header", "home-header");
  const identity = element("div", "home-identity");
  const logo = document.createElement("img");
  logo.className = "home-school-logo";
  logo.src = schoolLogoUrl;
  logo.alt = "重庆德普外国语学校校徽";
  const identityCopy = element("div", "home-identity-copy");
  identityCopy.append(
    element("p", "home-school-name", "重庆德普外国语学校"),
    element("p", "home-department-name", "双语初中数学组"),
  );
  identity.append(logo, identityCopy);
  const courseMeta = element("p", "home-course-meta", "11 lessons · From graph to model");
  header.append(identity, courseMeta);

  const content = element("section", "home-content");
  const introduction = element("div", "home-introduction");
  introduction.append(
    element("p", "home-course-kicker", "数学 · 函数与图象"),
    element("h1", "home-title", "二次函数互动课堂"),
    element("p", "home-course-name", "Quadratic Functions"),
    element("p", "home-summary", "从图象出发，观察开口、顶点、对称轴与变量之间的联系。"),
  );
  introduction.querySelector("h1").id = "home-title";

  const startLearning = element("a", "home-start-learning", "进入学习");
  startLearning.href = "#lesson-01/step-01";
  startLearning.setAttribute("aria-label", "进入学习，从第一课开始");
  const startEnglish = element("span", "home-start-learning-english", "Start Learning");
  startLearning.append(startEnglish);
  introduction.append(startLearning);

  const figure = element("figure", "home-math-visual");
  const graphHost = element("div", "home-graph-host");
  const equation = element("div", "home-equation");
  const caption = element("figcaption", "home-graph-caption", term("vertex") + " V(0, 0) · " + term("axisOfSymmetry") + " x = 0");
  const generalFormula = element("div", "home-general-form");
  const formulaDetails = element("div", "home-function-details");
  const vertexFormulaDetail = element("div", "home-vertex-form-detail");
  vertexFormulaDetail.append(element("p", "home-formula-label", term("vertexForm")), equation, caption);
  const generalFormulaDetail = element("div", "home-general-form-detail");
  generalFormulaDetail.append(element("p", "home-formula-label", term("generalForm")), generalFormula);
  formulaDetails.append(vertexFormulaDetail, generalFormulaDetail);
  figure.append(graphHost, formulaDetails);

  content.append(introduction, figure);
  page.append(header, content);

  let formulaBucket = -1;
  function setMathCopy(state, progress, force = false) {
    const bucket = Math.round(progress * 12);
    if (force || bucket !== formulaBucket || progress === 1) {
      formulaBucket = bucket;
      const formula = homeFormulaState(state);
      renderFormula(equation, formula.latex, { ariaLabel: formula.ariaLabel });
      const generalFormulaData = generalFormulaState(state);
      renderFormula(generalFormula, generalFormulaData.latex, { ariaLabel: generalFormulaData.ariaLabel });
    }
    caption.textContent = `${term("vertex")} V(${displayNumber(state.h)}, ${displayNumber(state.k)}) · ${term("axisOfSymmetry")} x = ${displayNumber(state.h)}`;
  }

  const graph = createParabolaGraph(graphHost, graphOptions(HOME_GRAPH_START));
  setMathCopy(HOME_GRAPH_START, 0);

  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const request = window.requestAnimationFrame ?? ((callback) => window.setTimeout(() => callback(performance.now()), 16));
  const cancel = window.cancelAnimationFrame ?? window.clearTimeout;
  let frame = null;
  let destroyed = false;
  let currentState = HOME_GRAPH_START;
  let draggingPointerId = null;

  function renderState(progress) {
    const eased = easeInOut(progress);
    const state = {
      h: HOME_GRAPH_START.h + (HOME_GRAPH_FINAL.h - HOME_GRAPH_START.h) * eased,
      k: HOME_GRAPH_START.k + (HOME_GRAPH_FINAL.k - HOME_GRAPH_START.k) * eased,
    };
    currentState = state;
    graph.update(graphOptions(state));
    setMathCopy(state, progress);
  }

  function renderManualState(nextState) {
    if (frame !== null) {
      cancel(frame);
      frame = null;
    }
    currentState = normalizeVertex(nextState);
    graph.update(graphOptions(currentState));
    setMathCopy(currentState, 1, true);
  }

  function vertexFromPointer(event) {
    const svg = graphHost.querySelector(".parabola-svg");
    const bounds = svg?.getBoundingClientRect();
    if (!bounds || bounds.width <= 0 || bounds.height <= 0) return currentState;
    const renderedScale = Math.min(bounds.width / 520, bounds.height / 360);
    const renderedWidth = 520 * renderedScale;
    const renderedHeight = 360 * renderedScale;
    const svgX = (event.clientX - bounds.left - (bounds.width - renderedWidth) / 2) / renderedScale;
    const svgY = (event.clientY - bounds.top - (bounds.height - renderedHeight) / 2) / renderedScale;
    const plotWidth = 520 - 52;
    const plotHeight = 360 - 52;
    return normalizeVertex({
      h: HOME_GRAPH_VIEWPORT.xMin + ((svgX - 26) / plotWidth) * (HOME_GRAPH_VIEWPORT.xMax - HOME_GRAPH_VIEWPORT.xMin),
      k: HOME_GRAPH_VIEWPORT.yMin + ((334 - svgY) / plotHeight) * (HOME_GRAPH_VIEWPORT.yMax - HOME_GRAPH_VIEWPORT.yMin),
    });
  }

  function isVertexHandle(target) {
    return target instanceof Element && target.closest(".home-vertex-handle");
  }

  function handlePointerDown(event) {
    if (!isVertexHandle(event.target)) return;
    event.preventDefault();
    draggingPointerId = event.pointerId ?? "mouse";
    graphHost.setPointerCapture?.(event.pointerId);
    renderManualState(vertexFromPointer(event));
    // Updating the SVG replaces the original handle. Restore focus to its
    // replacement so the same drag target remains keyboard-adjustable.
    queueMicrotask(() => graphHost.querySelector(".home-vertex-handle")?.focus());
  }

  function handlePointerMove(event) {
    if (draggingPointerId === null || (event.pointerId != null && event.pointerId !== draggingPointerId)) return;
    renderManualState(vertexFromPointer(event));
  }

  function finishDragging(event) {
    if (draggingPointerId === null || (event.pointerId != null && event.pointerId !== draggingPointerId)) return;
    graphHost.releasePointerCapture?.(event.pointerId);
    draggingPointerId = null;
  }

  function handleVertexKeyboard(event) {
    if (!isVertexHandle(event.target)) return;
    const adjustments = {
      ArrowLeft: { h: -HOME_GRAPH_SNAP, k: 0 }, ArrowRight: { h: HOME_GRAPH_SNAP, k: 0 },
      ArrowDown: { h: 0, k: -HOME_GRAPH_SNAP }, ArrowUp: { h: 0, k: HOME_GRAPH_SNAP },
    };
    const adjustment = adjustments[event.key];
    if (!adjustment) return;
    event.preventDefault();
    renderManualState({ h: currentState.h + adjustment.h, k: currentState.k + adjustment.k });
    graphHost.querySelector(".home-vertex-handle")?.focus();
  }

  graphHost.addEventListener("pointerdown", handlePointerDown);
  graphHost.addEventListener("pointermove", handlePointerMove);
  graphHost.addEventListener("pointerup", finishDragging);
  graphHost.addEventListener("pointercancel", finishDragging);
  graphHost.addEventListener("keydown", handleVertexKeyboard);

  if (reducedMotion) {
    renderState(1);
  } else {
    let startedAt = null;
    const animate = (timestamp) => {
      if (destroyed) return;
      startedAt ??= timestamp;
      const progress = Math.min(1, (timestamp - startedAt) / HOME_GRAPH_DURATION);
      renderState(progress);
      if (progress < 1) frame = request(animate);
    };
    frame = request(animate);
  }

  return {
    element: page,
    destroy() {
      destroyed = true;
      if (frame !== null) cancel(frame);
      graphHost.removeEventListener("pointerdown", handlePointerDown);
      graphHost.removeEventListener("pointermove", handlePointerMove);
      graphHost.removeEventListener("pointerup", finishDragging);
      graphHost.removeEventListener("pointercancel", finishDragging);
      graphHost.removeEventListener("keydown", handleVertexKeyboard);
      graph.destroy();
    },
  };
}

