import schoolLogoUrl from "./assets/depu-school-logo.jpg";
import { renderFormula } from "./formula.js";
import { createParabolaGraph } from "./graph/parabola-svg.js";
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

function roundForDisplay(value) {
  const rounded = Math.round(value * 10) / 10;
  return Math.abs(rounded) < 0.05 ? 0 : rounded;
}

function displayNumber(value) {
  return String(roundForDisplay(value)).replace("-", "−");
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

function graphOptions({ h, k }) {
  const point = { x: roundForDisplay(h), y: roundForDisplay(k) };
  return {
    viewport: HOME_GRAPH_VIEWPORT,
    plotPadding: 26,
    curves: [{ a: 1, h: point.x, k: point.y, color: "#075445" }],
    points: [{ ...point, color: "#bd842e", radius: 6 }],
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
  const caption = element("figcaption", "home-graph-caption", "顶点 V(0, 0) · 对称轴 x = 0");
  figure.append(graphHost, equation, caption);

  content.append(introduction, figure);
  const learningPath = element("ol", "home-learning-path");
  [
    ["01", "认识函数"],
    ["02", "观察图象"],
    ["03", "建立模型"],
  ].forEach(([number, label]) => {
    const item = element("li", "home-path-item");
    item.append(element("span", "home-path-number", number), element("span", "home-path-label", label));
    learningPath.append(item);
  });

  const learningJourney = element("section", "home-learning-journey");
  learningJourney.setAttribute("aria-label", "学习路径");
  learningJourney.append(element("p", "home-learning-label", "学习路径"), learningPath);
  page.append(header, content, learningJourney);

  let formulaBucket = -1;
  function setMathCopy(state, progress) {
    const bucket = Math.round(progress * 12);
    if (bucket !== formulaBucket || progress === 1) {
      formulaBucket = bucket;
      const formula = homeFormulaState(state);
      renderFormula(equation, formula.latex, { ariaLabel: formula.ariaLabel });
    }
    caption.textContent = `顶点 V(${displayNumber(state.h)}, ${displayNumber(state.k)}) · 对称轴 x = ${displayNumber(state.h)}`;
  }

  const graph = createParabolaGraph(graphHost, graphOptions(HOME_GRAPH_START));
  setMathCopy(HOME_GRAPH_START, 0);

  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const request = window.requestAnimationFrame ?? ((callback) => window.setTimeout(() => callback(performance.now()), 16));
  const cancel = window.cancelAnimationFrame ?? window.clearTimeout;
  let frame = null;
  let destroyed = false;

  function renderState(progress) {
    const eased = easeInOut(progress);
    const state = {
      h: HOME_GRAPH_START.h + (HOME_GRAPH_FINAL.h - HOME_GRAPH_START.h) * eased,
      k: HOME_GRAPH_START.k + (HOME_GRAPH_FINAL.k - HOME_GRAPH_START.k) * eased,
    };
    graph.update(graphOptions(state));
    setMathCopy(state, progress);
  }

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
      graph.destroy();
    },
  };
}
