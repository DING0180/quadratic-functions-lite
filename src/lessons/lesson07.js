import { renderFormula } from "../formula.js";
import { createParabolaGraph } from "../graph/parabola-svg.js";
import { applyClassroomSplit } from "../classroom-layout.js";
import "./lesson07.css";

const COLORS = Object.freeze({ curve: "#19735d", point: "#d98935", double: "#7b55b7" });
const VIEWPORT = Object.freeze({ xMin: -5, xMax: 5, yMin: -6, yMax: 10, yTickStep: 2 });

export const LESSON07_STEP_TITLES = Object.freeze([
  "Bridge In：令 y=0",
  "根就是交点横坐标",
  "2 / 1 / 0 个交点",
  "Intersection Lab",
  "Quick Random Challenge：Graph → Equation",
  "Reverse Challenge：Equation / Roots → Graph",
  "Summary + Bridge Out",
]);

function clean(value) {
  return Math.abs(value) < 1e-9 ? 0 : Number(value.toFixed(8));
}

export function analyzeQuadratic({ a, h = 0, k = 0 }) {
  const b = clean(-2 * a * h);
  const c = clean(a * h * h + k);
  const discriminant = clean(b * b - 4 * a * c);
  const rootCount = discriminant > 0 ? 2 : discriminant === 0 ? 1 : 0;
  const roots = rootCount === 0
    ? []
    : rootCount === 1
      ? [clean(-b / (2 * a))]
      : [clean((-b - Math.sqrt(discriminant)) / (2 * a)), clean((-b + Math.sqrt(discriminant)) / (2 * a))];

  return {
    a,
    b,
    c,
    discriminant,
    rootCount,
    roots,
    intersections: roots.map((x) => ({ x, y: 0 })),
  };
}

const CHALLENGES = Object.freeze([
  { a: 1, h: -1, k: -4 },
  { a: 1, h: 1, k: 0 },
  { a: 1, h: 0, k: 1 },
]);

export function createLesson07Challenge(random = Math.random) {
  const roll = Math.max(0, Math.min(0.999999, Number(random()) || 0));
  const parameters = CHALLENGES[Math.floor(roll * CHALLENGES.length)];
  return { parameters: { ...parameters }, analysis: analyzeQuadratic(parameters) };
}

function element(tag, className = "", text = "") {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function button(text, className = "lesson07-action") {
  const node = element("button", className, text);
  node.type = "button";
  return node;
}

function number(value) {
  const cleaned = clean(value);
  return Number.isInteger(cleaned) ? String(cleaned) : String(cleaned.toFixed(2));
}

function signedTerm(coefficient, suffix, first = false) {
  if (coefficient === 0) return "";
  const magnitude = Math.abs(coefficient);
  const unit = magnitude === 1 && suffix ? "" : number(magnitude);
  const body = unit + suffix;
  if (first) return coefficient < 0 ? "-" + body : body;
  return coefficient < 0 ? "-" + body : "+" + body;
}

function quadraticText(analysis, { latex = false, equalsY = true } = {}) {
  const squared = latex ? "x^2" : "x²";
  const middle = latex ? "x" : "x";
  const expression = [
    signedTerm(analysis.a, squared, true),
    signedTerm(analysis.b, middle),
    signedTerm(analysis.c, ""),
  ].filter(Boolean).join("") || "0";
  return (equalsY ? "y=" : "") + expression;
}

function rootSentence(analysis) {
  if (analysis.rootCount === 2) return "两个不相等实根 (two distinct real roots)：x=" + number(analysis.roots[0]) + "，x=" + number(analysis.roots[1]) + "。";
  if (analysis.rootCount === 1) return "一个相等实根 (one repeated real root)：x=" + number(analysis.roots[0]) + "。";
  return "没有实数根 (no real roots)。";
}

function intersectionSentence(analysis) {
  if (analysis.rootCount === 0) return "图象与 x 轴没有交点 (no x-intercept)。";
  return "交点 (x-intercept)：" + analysis.intersections.map(({ x }) => "(" + number(x) + ", 0)").join("，") + "。";
}

function formula(latex, label, className = "lesson07-formula", dataset = "") {
  const node = element("div", className);
  if (dataset) node.dataset[dataset] = "";
  renderFormula(node, latex, { ariaLabel: label, displayMode: true });
  return node;
}

function createRoot(step) {
  const root = element("section", "lesson07-step");
  const heading = element("header", "lesson07-heading");
  heading.append(
    element("p", "lesson07-kicker", "LESSON 07 · " + String(step).padStart(2, "0") + " / 07"),
    element("h2", "lesson07-title", LESSON07_STEP_TITLES[step - 1]),
  );
  root.append(heading);
  return root;
}

function appendNavigation(root, step, onStepChange) {
  const navigation = element("nav", "lesson07-step-controls");
  navigation.setAttribute("aria-label", "Lesson 7 步骤导航");
  const previous = button("上一步", "lesson07-action lesson07-secondary");
  previous.disabled = step === 1;
  previous.addEventListener("click", () => onStepChange(Math.max(1, step - 1)));
  const next = button(step === 7 ? "回到本课开始" : "下一步");
  next.addEventListener("click", () => onStepChange(step === 7 ? 1 : step + 1));
  navigation.append(previous, element("span", "lesson07-step-count", step + " / 7"), next);
  root.append(navigation);
}

function graphOptions(parameters, analysis, { showPoints = true } = {}) {
  return {
    viewport: VIEWPORT,
    curves: [{ ...parameters, color: analysis.rootCount === 1 ? COLORS.double : COLORS.curve }],
    points: showPoints ? analysis.intersections.map((point) => ({ ...point, color: COLORS.point, radius: 6 })) : [],
    labels: showPoints ? analysis.intersections.map((point) => ({ x: point.x + 0.15, y: 0.8, text: "(" + number(point.x) + ", 0)" })) : [],
    ariaLabel: quadraticText(analysis) + " 的图象；" + intersectionSentence(analysis),
  };
}

function createGraph(host, parameters, cleanup, options = {}) {
  const analysis = analyzeQuadratic(parameters);
  const graph = createParabolaGraph(host, graphOptions(parameters, analysis, options));
  cleanup.push(() => graph.destroy());
  return graph;
}

function updateGraph(graph, parameters, options = {}) {
  graph.update(graphOptions(parameters, analyzeQuadratic(parameters), options));
}

function renderBridge(root) {
  const functionFormula = formula("y=ax^2+bx+c", "y=ax²+bx+c", "lesson07-formula lesson07-hero");
  const equationFormula = formula("ax^2+bx+c=0", "ax²+bx+c=0", "lesson07-formula lesson07-hero");
  const pair = element("div", "lesson07-bridge-pair");
  pair.append(functionFormula, element("span", "lesson07-arrow", "令 y=0 →"), equationFormula);
  const answer = element("p", "lesson07-reveal"); answer.dataset.lesson07BridgeAnswer = ""; answer.hidden = true;
  const reveal = button("Reveal 连接");
  reveal.addEventListener("click", () => {
    answer.textContent = "当图象落在 x 轴 (x-axis) 上时，y=0。因此同一个式子既描述函数，也给出二次方程 (quadratic equation)。";
    answer.hidden = false;
  });
  root.append(element("p", "lesson07-prompt", "图象什么时候会落在 x 轴上？先把函数世界 (Function World) 接到方程世界 (Equation World)。"), pair, reveal, answer);
}

function renderRoots(root, cleanup) {
  const parameters = { a: 1, h: -1, k: -4 };
  const analysis = analyzeQuadratic(parameters);
  const layout = element("div", "lesson07-layout");
  const graphPanel = element("div", "lesson07-graph-panel");
  const host = element("div", "lesson07-graph-host");
  graphPanel.append(host); createGraph(host, parameters, cleanup);
  const workbench = element("div", "lesson07-workbench");
  const answer = element("div", "lesson07-reveal"); answer.dataset.lesson07RootAnswer = ""; answer.hidden = true;
  answer.append(element("p", "", rootSentence(analysis)), element("p", "", "根 (root) 就是交点 (x-intercept) 的横坐标 (x-coordinate)：" + analysis.roots.map(number).join("，") + "。"));
  const reveal = button("Reveal 根"); reveal.dataset.lesson07RevealRoots = "";
  reveal.addEventListener("click", () => { answer.hidden = false; });
  workbench.append(element("p", "lesson07-question", "观察图象上的两个点。方程 " + quadraticText(analysis, { equalsY: false }) + "=0 的根是什么？"), formula(quadraticText(analysis, { latex: true }), quadraticText(analysis), "lesson07-formula lesson07-current"), reveal, answer);
  layout.append(graphPanel, workbench); applyClassroomSplit(layout, workbench, graphPanel); root.append(layout);
}

function renderCases(root, cleanup) {
  const cases = [
    ["两个交点", { a: 1, h: -1, k: -4 }],
    ["一个交点", { a: 1, h: 1, k: 0 }],
    ["没有交点", { a: 1, h: 0, k: 1 }],
  ];
  let parameters = cases[0][1];
  const layout = element("div", "lesson07-layout");
  const graphPanel = element("div", "lesson07-graph-panel"); const host = element("div", "lesson07-graph-host"); graphPanel.append(host);
  const graph = createGraph(host, parameters, cleanup);
  const workbench = element("div", "lesson07-workbench");
  const current = element("div", "lesson07-formula lesson07-current");
  const status = element("p", "lesson07-status");
  const reveal = element("div", "lesson07-mapping"); reveal.hidden = true;
  reveal.append(
    element("p", "", "Δ>0 ↔ 两个交点 ↔ 两个不相等实根。"),
    element("p", "", "Δ=0 ↔ 相切一个交点 ↔ 一个相等实根。"),
    element("p", "", "Δ<0 ↔ 没有交点 ↔ 没有实数根。"),
  );
  const controls = element("div", "lesson07-actions");
  cases.forEach(([label, next]) => {
    const control = button(label, "lesson07-action lesson07-secondary");
    control.addEventListener("click", () => { parameters = next; render(); }); controls.append(control);
  });
  const show = button("Reveal 对应关系"); show.addEventListener("click", () => { reveal.hidden = false; }); controls.append(show);
  function render() {
    const analysis = analyzeQuadratic(parameters);
    current.replaceChildren(); renderFormula(current, quadraticText(analysis, { latex: true }), { ariaLabel: quadraticText(analysis), displayMode: true });
    status.textContent = "Δ=" + number(analysis.discriminant) + "；" + rootSentence(analysis);
    updateGraph(graph, parameters);
  }
  workbench.append(element("p", "lesson07-prompt", "切换图象，观察交点、判别式 (discriminant) 与实数根如何一起变化。"), current, status, controls, reveal);
  layout.append(graphPanel, workbench); applyClassroomSplit(layout, workbench, graphPanel); root.append(layout); render();
}

function renderLab(root, cleanup) {
  let parameters = { a: 1, h: 0, k: -4 };
  const layout = element("div", "lesson07-layout");
  const graphPanel = element("div", "lesson07-graph-panel"); const host = element("div", "lesson07-graph-host"); graphPanel.append(host);
  const graph = createGraph(host, parameters, cleanup);
  const workbench = element("div", "lesson07-workbench");
  const current = element("div", "lesson07-formula lesson07-current"); current.dataset.lesson07CurrentFunction = "";
  const discriminant = element("p", "lesson07-status"); discriminant.dataset.lesson07Discriminant = "";
  const roots = element("p", "lesson07-status"); roots.dataset.lesson07RootStatus = "";
  const sliderLabel = element("label", "lesson07-slider");
  sliderLabel.append(element("span", "", "垂直移动：当前 k="), element("output", "lesson07-slider-value", "-4"));
  const slider = document.createElement("input"); slider.type = "range"; slider.min = "-4"; slider.max = "2"; slider.step = "0.5"; slider.value = "-4"; slider.dataset.lesson07LabSlider = ""; slider.setAttribute("aria-label", "垂直移动参数 k"); sliderLabel.append(slider);
  const conclusion = element("p", "lesson07-reveal", "观察：顶点越过 x 轴时，Δ 由正变零再变负；交点和实根同步改变。"); conclusion.hidden = true;
  const reveal = button("Reveal 观察"); reveal.addEventListener("click", () => { conclusion.hidden = false; });
  function render() {
    const analysis = analyzeQuadratic(parameters);
    current.replaceChildren(); renderFormula(current, quadraticText(analysis, { latex: true }), { ariaLabel: quadraticText(analysis), displayMode: true });
    discriminant.textContent = "判别式 (discriminant)：Δ=" + number(analysis.discriminant);
    roots.textContent = rootSentence(analysis) + " " + intersectionSentence(analysis);
    sliderLabel.querySelector("output").textContent = number(parameters.k);
    updateGraph(graph, parameters);
  }
  slider.addEventListener("input", () => { parameters = { ...parameters, k: Number(slider.value) }; render(); });
  workbench.append(element("p", "lesson07-prompt", "拖动图象上下移动。当前函数、Δ、根和交点会同步更新。"), current, discriminant, roots, sliderLabel, reveal, conclusion);
  layout.append(graphPanel, workbench); applyClassroomSplit(layout, workbench, graphPanel); root.append(layout); render();
}

function renderGraphChallenge(root, cleanup, random) {
  const graphPanel = element("div", "lesson07-graph-panel lesson07-challenge-graph");
  const host = element("div", "lesson07-graph-host"); graphPanel.append(host);
  let challenge = createLesson07Challenge(random);
  const graph = createGraph(host, challenge.parameters, cleanup);
  const question = element("p", "lesson07-question");
  const answer = element("div", "lesson07-reveal"); answer.dataset.lesson07GraphAnswer = "";
  const controls = element("div", "lesson07-actions");
  const reveal = button("Reveal Answer"); reveal.dataset.lesson07RevealGraph = "";
  const next = button("New Challenge", "lesson07-action lesson07-secondary");
  function update() {
    challenge = createLesson07Challenge(random);
    const { analysis } = challenge;
    question.textContent = "看图口答：有几个交点？Δ 的符号？有几个实根？如果有根，它们是什么？";
    answer.replaceChildren(formula(quadraticText(analysis, { latex: true }), quadraticText(analysis)), element("p", "", intersectionSentence(analysis)), element("p", "", "Δ=" + number(analysis.discriminant) + "；" + rootSentence(analysis)));
    answer.hidden = true; updateGraph(graph, challenge.parameters);
  }
  reveal.addEventListener("click", () => { answer.hidden = false; }); next.addEventListener("click", update);
  controls.append(reveal, next); root.append(element("p", "lesson07-prompt", "Graph → Equation：先根据图象判断，再显示函数、判别式与根。"), graphPanel, question, controls, answer); update();
}

function renderReverseChallenge(root, cleanup, random) {
  const question = element("p", "lesson07-question");
  const answer = element("div", "lesson07-reveal"); answer.dataset.lesson07ReverseAnswer = "";
  const graphPanel = element("div", "lesson07-graph-panel lesson07-challenge-graph"); graphPanel.dataset.lesson07ReverseGraph = "";
  const host = element("div", "lesson07-graph-host"); graphPanel.append(host);
  let challenge = createLesson07Challenge(random);
  const graph = createGraph(host, challenge.parameters, cleanup);
  const controls = element("div", "lesson07-actions");
  const reveal = button("Reveal Graph"); reveal.dataset.lesson07RevealReverse = "";
  const next = button("Rapid Fire：New Challenge", "lesson07-action lesson07-secondary");
  function update() {
    challenge = createLesson07Challenge(random);
    const { analysis } = challenge;
    question.textContent = analysis.rootCount === 0 ? "已知：方程没有实数根 (no real roots)。反推：有几个 x 轴交点？Δ 的符号？" : "已知：" + rootSentence(analysis) + "反推：交点坐标是什么？Δ 的符号？";
    answer.replaceChildren(element("p", "", intersectionSentence(analysis)), element("p", "", "Δ=" + number(analysis.discriminant) + "；" + rootSentence(analysis)), formula(quadraticText(analysis, { latex: true }), quadraticText(analysis)));
    answer.hidden = true; graphPanel.hidden = true; updateGraph(graph, challenge.parameters);
  }
  reveal.addEventListener("click", () => { answer.hidden = false; graphPanel.hidden = false; }); next.addEventListener("click", update);
  controls.append(reveal, next); root.append(element("p", "lesson07-prompt", "Equation / Roots → Graph：先由根的情况反推图象，再 Reveal 验证。"), question, controls, answer, graphPanel); update();
}

function renderSummary(root) {
  const grid = element("div", "lesson07-summary-grid");
  [["两个交点", "Δ>0", "两个不相等实根"], ["相切一个交点", "Δ=0", "一个相等实根"], ["没有交点", "Δ<0", "没有实数根"]].forEach(([graph, delta, roots]) => {
    const card = element("article", "lesson07-summary-card"); card.append(element("h3", "", graph), element("p", "", delta), element("p", "", roots)); grid.append(card);
  });
  root.append(element("p", "lesson07-prompt", "把三种语言连成一条线：图象交点 ↔ 方程实根 ↔ 判别式。"), grid, element("p", "lesson07-bridge-out", "Bridge Out：如果交点不是漂亮整数，怎样由图象读出近似根？进入 Lesson 08。"));
}

const RENDERERS = Object.freeze([renderBridge, renderRoots, renderCases, renderLab, renderGraphChallenge, renderReverseChallenge, renderSummary]);

export function renderLesson07(stage, { step = 1, onStepChange = () => {}, random = Math.random } = {}) {
  const safeStep = Math.min(7, Math.max(1, Number(step) || 1));
  const cleanup = [];
  const root = createRoot(safeStep);
  RENDERERS[safeStep - 1](root, cleanup, random);
  appendNavigation(root, safeStep, onStepChange);
  stage.replaceChildren(root);
  return { destroy() { cleanup.forEach((dispose) => dispose()); } };
}

