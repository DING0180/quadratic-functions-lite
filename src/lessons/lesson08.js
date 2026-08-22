import { renderFormula } from "../formula.js";
import { createParabolaGraph } from "../graph/parabola-svg.js";
import "./lesson08.css";

const COLORS = Object.freeze({ curve: "#19735d", muted: "#a8bbb4", root: "#d98935", guide: "#7b55b7", compare: "#197b9b" });
const ROOT_FUNCTION = Object.freeze({ a: 1, h: 0, k: -2 });

export const LESSON08_STEP_TITLES = Object.freeze([
  "Bridge In：函数世界与方程世界",
  "同一条式子：交点就是解",
  "First Bracket：根在哪两个整数之间？",
  "Root Finder Zoom",
  "Interval Shrink：越来越准确",
  "从 =0 到 >0 / <0",
  "≥ / ≤ 与水平线 y=k",
  "两个函数比较",
  "Quick Random Practice",
  "Summary + Bridge Out",
]);

function clean(value) { return Math.abs(value) < 1e-9 ? 0 : Number(value.toFixed(6)); }
function number(value) { const result = clean(value); return Number.isInteger(result) ? String(result) : String(result); }
function evaluate({ a, h = 0, k = 0 }, x) { return clean(a * (x - h) ** 2 + k); }
function element(tag, className = "", text = "") { const node = document.createElement(tag); if (className) node.className = className; if (text) node.textContent = text; return node; }
function button(text, className = "lesson08-action") { const node = element("button", className, text); node.type = "button"; return node; }

function formula(latex, label, className = "lesson08-formula") {
  const node = element("div", className);
  renderFormula(node, latex, { ariaLabel: label, displayMode: true });
  return node;
}

function functionText(parameters, { latex = false } = {}) {
  const a = parameters.a === 1 ? "" : parameters.a === -1 ? "-" : String(parameters.a);
  const squared = latex ? "x^2" : "x²";
  const core = parameters.h === 0 ? squared : "(" + (parameters.h > 0 ? "x-" + parameters.h : "x+" + Math.abs(parameters.h)) + ")" + (latex ? "^2" : "²");
  const tail = parameters.k === 0 ? "" : parameters.k > 0 ? "+" + parameters.k : String(parameters.k);
  return "y=" + a + core + tail;
}

function rootsOf(parameters) {
  if (parameters.a === 0 || -parameters.k / parameters.a < 0) return [];
  const offset = Math.sqrt(-parameters.k / parameters.a);
  return [clean(parameters.h - offset), clean(parameters.h + offset)];
}

export function createRootBracket(parameters, left, right) {
  const roots = rootsOf(parameters);
  return {
    left,
    right,
    leftValue: evaluate(parameters, left),
    rightValue: evaluate(parameters, right),
    containsRoot: roots.some((root) => root >= left && root <= right),
  };
}

function rootIntervalText(bracket) { return "[" + number(bracket.left) + ", " + number(bracket.right) + "]"; }

function rootAnswer(bracket) {
  return "f(" + number(bracket.left) + ")=" + number(bracket.leftValue) + "，f(" + number(bracket.right) + ")=" + number(bracket.rightValue) + "，一正一负；所以正根 (positive root) 在 " + rootIntervalText(bracket) + " 内。";
}

function createRoot(step) {
  const root = element("section", "lesson08-step");
  const heading = element("header", "lesson08-heading");
  heading.append(element("p", "lesson08-kicker", "LESSON 08 · " + String(step).padStart(2, "0") + " / 10"), element("h2", "lesson08-title", LESSON08_STEP_TITLES[step - 1]));
  root.append(heading);
  return root;
}

function appendNavigation(root, step, onStepChange) {
  const navigation = element("nav", "lesson08-step-controls");
  navigation.setAttribute("aria-label", "Lesson 8 步骤导航");
  const previous = button("上一步", "lesson08-action lesson08-secondary"); previous.disabled = step === 1;
  previous.addEventListener("click", () => onStepChange(Math.max(1, step - 1)));
  const next = button(step === 10 ? "回到本课开始" : "下一步");
  next.addEventListener("click", () => onStepChange(step === 10 ? 1 : step + 1));
  navigation.append(previous, element("span", "lesson08-step-count", step + " / 10"), next);
  root.append(navigation);
}

function graphOptions({ parameters = ROOT_FUNCTION, viewport, points = [], labels = [], highlightedCurves = [], horizontalGuides = [], curves = null, ariaLabel = "二次函数图象" }) {
  return {
    viewport,
    curves: curves ?? [{ ...parameters, color: COLORS.curve }],
    highlightedCurves,
    horizontalGuides,
    points,
    labels,
    ariaLabel,
  };
}

function createGraph(host, cleanup, options) {
  const graph = createParabolaGraph(host, graphOptions(options));
  cleanup.push(() => graph.destroy());
  return graph;
}

function updateGraph(graph, options) { graph.update(graphOptions(options)); }

function layoutWithGraph(root, cleanup, options, workbench) {
  const layout = element("div", "lesson08-layout");
  const graphPanel = element("div", "lesson08-graph-panel");
  const host = element("div", "lesson08-graph-host"); graphPanel.append(host);
  const graph = createGraph(host, cleanup, options);
  layout.append(graphPanel, workbench); root.append(layout);
  return graph;
}

function renderBridge(root) {
  const question = element("p", "lesson08-question", "同一个式子，一次写成函数 y=x²−2，一次写成方程 x²−2=0。它们在说同一件事吗？");
  question.dataset.lesson08BridgeQuestion = "";
  const cards = element("div", "lesson08-equation-sequence");
  const functionCard = element("div", "lesson08-sequence-card");
  functionCard.append(element("p", "lesson08-status", "函数世界 (function)"), formula("y=x^2-2", "y=x²-2", "lesson08-formula"));
  const equationCard = element("div", "lesson08-sequence-card");
  equationCard.append(element("p", "lesson08-status", "方程世界 (equation)"), formula("x^2-2=0", "x²-2=0", "lesson08-formula"));
  cards.append(functionCard, equationCard);
  const hint = element("p", "lesson08-reveal"); hint.dataset.lesson08BridgeHint = ""; hint.hidden = true;
  const prompt = button("给一个提示：先想 y=0"); prompt.dataset.lesson08BridgePrompt = "";
  prompt.addEventListener("click", () => { hint.textContent = "提示：把函数值设成 y=0，函数式 y=x²−2 就会变成方程 x²−2=0。下一页把这一步画在图上。"; hint.hidden = false; });
  root.append(element("p", "lesson08-prompt", "先不要急着求解。带着这个问题进入图象：函数世界与方程世界之间，缺少的那座桥是什么？"), question, cards, prompt, hint);
}

function renderEquationFunction(root, cleanup) {
  const rootValue = Math.sqrt(2);
  let phase = 0;
  const workbench = element("div", "lesson08-workbench");
  const phaseLabel = element("p", "lesson08-status");
  const currentFormula = element("div", "lesson08-formula lesson08-current"); currentFormula.dataset.lesson08BridgeCurrentFormula = "";
  const explanation = element("p", "lesson08-prompt");
  const next = button("继续：令 y=0"); next.dataset.lesson08BridgeNext = "";
  const reveal = button("Reveal：交点就是解"); reveal.dataset.lesson08BridgeReveal = ""; reveal.hidden = true;
  const conclusion = element("p", "lesson08-reveal"); conclusion.dataset.lesson08BridgeConclusion = ""; conclusion.hidden = true;
  const graph = layoutWithGraph(root, cleanup, { viewport: { xMin: -2.5, xMax: 2.5, yMin: -2.5, yMax: 4.5, yTickStep: 1 }, ariaLabel: "二次函数 y=x²-2 的图象" }, workbench);
  root.querySelector(".lesson08-graph-panel").dataset.lesson08BridgeGraph = "";

  const phases = [
    { label: "函数世界：先画出 y=x²−2", latex: "y=x^2-2", ariaLabel: "y=x²-2", explanation: "曲线上每个点都在报告一个函数值 y。现在请找一找：哪些点的 y 值会恰好等于 0？", graph: {} },
    { label: "搭桥：令 y=0", latex: "x^2-2=0", ariaLabel: "x²-2=0", explanation: "当 y=0 时，点正好落在 x 轴上。所以函数式立刻变成了同一个一元二次方程。", graph: { horizontalGuides: [{ y: 0, label: "y=0，也就是 x 轴", color: COLORS.root, dash: "" }] } },
    { label: "方程世界：读出横坐标", latex: "x=\\pm\\sqrt{2}", ariaLabel: "x=±√2", explanation: "曲线在 x 轴上留下两个交点。读出它们的横坐标。", graph: { horizontalGuides: [{ y: 0, label: "y=0", color: COLORS.root, dash: "" }], points: [{ x: -rootValue, y: 0, color: COLORS.root, radius: 7 }, { x: rootValue, y: 0, color: COLORS.root, radius: 7 }], labels: [{ x: -rootValue, y: 0.45, text: "x=−√2" }, { x: rootValue, y: 0.45, text: "x=√2" }] } },
  ];

  function render() {
    const current = phases[phase];
    phaseLabel.textContent = current.label;
    renderFormula(currentFormula, current.latex, { ariaLabel: current.ariaLabel, displayMode: true });
    explanation.textContent = current.explanation;
    next.hidden = phase === phases.length - 1;
    if (phase === 0) next.textContent = "继续：令 y=0";
    if (phase === 1) next.textContent = "继续：读交点横坐标";
    reveal.hidden = phase !== phases.length - 1;
    updateGraph(graph, { viewport: { xMin: -2.5, xMax: 2.5, yMin: -2.5, yMax: 4.5, yTickStep: 1 }, ariaLabel: "y=x²-2：" + current.label, ...current.graph });
  }
  next.addEventListener("click", () => { if (phase < phases.length - 1) { phase += 1; render(); } });
  reveal.addEventListener("click", () => { conclusion.textContent = "核心连接：二次函数 y=x²−2 与 x 轴交点的横坐标 x=±√2，就是一元二次方程 x²−2=0 的解。"; conclusion.hidden = false; });
  workbench.append(phaseLabel, currentFormula, explanation, next, reveal, conclusion);
  render();
}

function renderFirstBracket(root, cleanup) {
  const bracket = createRootBracket(ROOT_FUNCTION, 1, 2);
  const workbench = element("div", "lesson08-workbench");
  const answer = element("p", "lesson08-reveal"); answer.dataset.lesson08BracketAnswer = ""; answer.hidden = true;
  const reveal = button("Reveal 区间结论"); reveal.dataset.lesson08RevealBracket = "";
  reveal.addEventListener("click", () => { answer.textContent = rootAnswer(bracket); answer.hidden = false; });
  workbench.append(element("p", "lesson08-question", "两个取样点一个在 x 轴上方、一个在下方。正根在哪里？"), element("p", "lesson08-status", "x=1 时 f(x)=" + number(bracket.leftValue) + "；x=2 时 f(x)=" + number(bracket.rightValue)), reveal, answer);
  layoutWithGraph(root, cleanup, { viewport: { xMin: 0, xMax: 3, yMin: -2.5, yMax: 3, yTickStep: 1 }, points: [{ x: 1, y: bracket.leftValue, color: COLORS.root, radius: 7 }, { x: 2, y: bracket.rightValue, color: COLORS.root, radius: 7 }], labels: [{ x: 1.05, y: -1.25, text: "(1, -1)" }, { x: 2.05, y: 2.25, text: "(2, 2)" }], highlightedCurves: [{ ...ROOT_FUNCTION, xMin: 1, xMax: 2, color: COLORS.root }] }, workbench);
}

const ZOOM_STAGES = Object.freeze([
  { bracket: [1, 2], viewport: { xMin: 0.8, xMax: 2.2, yMin: -1.4, yMax: 2.4, yTickStep: 0.5 }, samples: [1, 1.4, 1.5, 2] },
  { bracket: [1.4, 1.5], viewport: { xMin: 1.35, xMax: 1.55, yMin: -0.3, yMax: 0.35, yTickStep: 0.1 }, samples: [1.4, 1.41, 1.42, 1.5] },
  { bracket: [1.41, 1.42], viewport: { xMin: 1.405, xMax: 1.425, yMin: -0.03, yMax: 0.03, yTickStep: 0.01 }, samples: [1.41, 1.414, 1.42] },
]);

function renderZoom(root, cleanup) {
  let index = 0; let selected = 1.4;
  const workbench = element("div", "lesson08-workbench");
  const bracketReadout = element("p", "lesson08-status"); bracketReadout.dataset.lesson08CurrentBracket = "";
  const viewportReadout = element("p", "lesson08-status"); viewportReadout.dataset.lesson08ViewportReadout = "";
  const selectedReadout = element("p", "lesson08-selected"); selectedReadout.dataset.lesson08SelectedSample = "";
  const sliderLabel = element("label", "lesson08-slider"); sliderLabel.append(element("span", "", "Zoom level"));
  const slider = document.createElement("input"); slider.type = "range"; slider.min = "0"; slider.max = "2"; slider.step = "1"; slider.value = "0"; slider.dataset.lesson08Zoom = ""; slider.setAttribute("aria-label", "Root Finder Zoom"); sliderLabel.append(slider);
  const table = element("div", "lesson08-value-table");
  const graph = layoutWithGraph(root, cleanup, { viewport: ZOOM_STAGES[0].viewport }, workbench);
  function render() {
    const stage = ZOOM_STAGES[index]; const bracket = createRootBracket(ROOT_FUNCTION, ...stage.bracket);
    if (!stage.samples.includes(selected)) selected = stage.samples[0];
    bracketReadout.textContent = "当前根区间 (current bracket)：x∈" + rootIntervalText(bracket);
    viewportReadout.textContent = "当前坐标范围：x∈[" + number(stage.viewport.xMin) + ", " + number(stage.viewport.xMax) + "]";
    selectedReadout.textContent = "选中的函数值：f(" + number(selected) + ")=" + number(evaluate(ROOT_FUNCTION, selected));
    table.replaceChildren(...stage.samples.map((x) => { const sample = button("x=" + number(x) + " → " + number(evaluate(ROOT_FUNCTION, x)), "lesson08-sample"); sample.dataset.lesson08Sample = String(x); sample.setAttribute("aria-pressed", String(x === selected)); sample.addEventListener("click", () => { selected = x; render(); }); return sample; }));
    updateGraph(graph, { viewport: stage.viewport, points: [{ x: bracket.left, y: bracket.leftValue, color: COLORS.root, radius: 6 }, { x: bracket.right, y: bracket.rightValue, color: COLORS.root, radius: 6 }, { x: selected, y: evaluate(ROOT_FUNCTION, selected), color: COLORS.guide, radius: 8 }], highlightedCurves: [{ ...ROOT_FUNCTION, xMin: bracket.left, xMax: bracket.right, color: COLORS.root }], ariaLabel: "Root Finder Zoom，当前根区间 " + rootIntervalText(bracket) });
  }
  slider.addEventListener("input", () => { index = Number(slider.value); render(); });
  workbench.append(element("p", "lesson08-prompt", "拖动 Zoom：真正改变坐标范围。点击函数值表的一行，图上的同一个取样点会亮起。"), formula("y=x^2-2", "y=x²-2", "lesson08-formula lesson08-current"), bracketReadout, viewportReadout, sliderLabel, table, selectedReadout); render();
}

function renderShrink(root, cleanup) {
  const brackets = [[1, 2], [1.4, 1.5], [1.41, 1.42]].map((pair) => createRootBracket(ROOT_FUNCTION, ...pair));
  let shown = 1;
  const workbench = element("div", "lesson08-workbench");
  const strip = element("div", "lesson08-interval-strip");
  const answer = element("p", "lesson08-reveal"); answer.hidden = true;
  const advance = button("缩小一次区间");
  const graph = layoutWithGraph(root, cleanup, { viewport: { xMin: 1.35, xMax: 1.55, yMin: -0.3, yMax: 0.35, yTickStep: 0.1 } }, workbench);
  function render() {
    strip.replaceChildren(...brackets.map((bracket, index) => { const item = element("div", "lesson08-strip-item", rootIntervalText(bracket)); item.hidden = index >= shown; return item; }));
    const current = brackets[shown - 1];
    updateGraph(graph, { viewport: ZOOM_STAGES[Math.min(shown, 2)].viewport, highlightedCurves: [{ ...ROOT_FUNCTION, xMin: current.left, xMax: current.right, color: COLORS.root }], points: [{ x: current.left, y: current.leftValue, color: COLORS.root, radius: 6 }, { x: current.right, y: current.rightValue, color: COLORS.root, radius: 6 }] });
    advance.textContent = shown < brackets.length ? "缩小一次区间" : "Reveal 核心方法";
  }
  advance.addEventListener("click", () => { if (shown < brackets.length) { shown += 1; render(); return; } answer.textContent = "近似根 (approximate root) 不是随机猜：每一步都保留一个夹住根的更小区间。这里正根约为 1.41。"; answer.hidden = false; });
  workbench.append(element("p", "lesson08-prompt", "每次检查新的端点：保留一正一负的那一段，让根被更紧地夹住。"), strip, advance, answer); render();
}

function positiveSegments(condition) {
  const root = Math.sqrt(2);
  return condition === "negative" ? [{ xMin: -root, xMax: root }] : [{ xMin: -3, xMax: -root }, { xMin: root, xMax: 3 }];
}

function renderInequality(root, cleanup) {
  let condition = "positive";
  const workbench = element("div", "lesson08-workbench");
  const conditionText = element("p", "lesson08-status");
  const answer = element("p", "lesson08-reveal"); answer.dataset.lesson08InequalityAnswer = ""; answer.hidden = true;
  const controls = element("div", "lesson08-actions");
  const reveal = button("Reveal 图象语言"); reveal.dataset.lesson08RevealInequality = "";
  const graph = layoutWithGraph(root, cleanup, { viewport: { xMin: -3, xMax: 3, yMin: -3, yMax: 7, yTickStep: 2 } }, workbench);
  function render() {
    const isPositive = condition === "positive";
    conditionText.textContent = isPositive ? "当前条件：f(x)>0" : "当前条件：f(x)<0";
    answer.hidden = true;
    updateGraph(graph, { viewport: { xMin: -3, xMax: 3, yMin: -3, yMax: 7, yTickStep: 2 }, highlightedCurves: positiveSegments(condition).map((segment) => ({ ...ROOT_FUNCTION, ...segment, color: COLORS.root })), ariaLabel: conditionText.textContent + " 的高亮曲线段" });
  }
  [["positive", "f(x)>0"], ["negative", "f(x)<0"]].forEach(([value, label]) => { const control = button(label, "lesson08-action lesson08-secondary"); control.addEventListener("click", () => { condition = value; render(); }); controls.append(control); });
  reveal.addEventListener("click", () => { answer.textContent = condition === "positive" ? "f(x)>0：图象在 x 轴上方，对应 x<−√2 或 x>√2。" : "f(x)<0：图象在 x 轴下方，对应 −√2<x<√2。"; answer.hidden = false; });
  controls.append(reveal); workbench.append(element("p", "lesson08-prompt", "先选一个条件，再看高亮的曲线段与 x 轴区间。答案先不显示。"), conditionText, controls, answer); render();
}

function renderLevelLine(root, cleanup) {
  const workbench = element("div", "lesson08-workbench");
  const answer = element("p", "lesson08-reveal"); answer.hidden = true;
  const reveal = button("Reveal f(x)≤1");
  reveal.addEventListener("click", () => { answer.textContent = "f(x)≤1 表示曲线在水平线 y=1 下方或重合。交点 x=±√3 也包含在内：−√3≤x≤√3。"; answer.hidden = false; });
  workbench.append(element("p", "lesson08-prompt", "等号意味着边界点也要保留。观察曲线与水平线 y=1 的位置关系。"), formula("x^2-2\\leq1", "x²-2≤1", "lesson08-formula lesson08-current"), reveal, answer);
  const bound = Math.sqrt(3);
  layoutWithGraph(root, cleanup, { viewport: { xMin: -3, xMax: 3, yMin: -3, yMax: 7, yTickStep: 2 }, highlightedCurves: [{ ...ROOT_FUNCTION, xMin: -bound, xMax: bound, color: COLORS.root }], horizontalGuides: [{ y: 1, label: "y=1", color: COLORS.guide }], points: [{ x: -bound, y: 1, color: COLORS.root, radius: 6 }, { x: bound, y: 1, color: COLORS.root, radius: 6 }] }, workbench);
}

function renderComparison(root, cleanup) {
  const compare = { a: -1, h: 0, k: 1 };
  const boundary = Math.sqrt(1.5);
  const workbench = element("div", "lesson08-workbench");
  const answer = element("p", "lesson08-reveal"); answer.hidden = true;
  const reveal = button("Reveal 谁在上面");
  reveal.addEventListener("click", () => { answer.textContent = "f(x)>g(x) 就是 f 的曲线在 g 的曲线上方。这里在 x<−√1.5 或 x>√1.5 时成立。"; answer.hidden = false; });
  workbench.append(element("p", "lesson08-prompt", "两条曲线比较时，不必先代数展开：先找谁在上面。"), formula("f(x)=x^2-2,\\quad g(x)=-x^2+1", "f(x)=x²-2，g(x)=-x²+1", "lesson08-formula lesson08-current"), reveal, answer);
  layoutWithGraph(root, cleanup, { viewport: { xMin: -3, xMax: 3, yMin: -3, yMax: 7, yTickStep: 2 }, curves: [{ ...ROOT_FUNCTION, color: COLORS.curve }, { ...compare, color: COLORS.compare }], highlightedCurves: [{ ...ROOT_FUNCTION, xMin: -3, xMax: -boundary, color: COLORS.root }, { ...ROOT_FUNCTION, xMin: boundary, xMax: 3, color: COLORS.root }], points: [{ x: -boundary, y: -0.5, color: COLORS.root, radius: 6 }, { x: boundary, y: -0.5, color: COLORS.root, radius: 6 }], ariaLabel: "f 和 g 的图象，橙色段表示 f 大于 g" }, workbench);
}

const PRACTICE = Object.freeze([{ k: -2, label: "x²−2" }, { k: -3, label: "x²−3" }, { k: -5, label: "x²−5" }]);

function renderPractice(root, cleanup, random) {
  let challenge = PRACTICE[Math.min(PRACTICE.length - 1, Math.floor(Math.max(0, Math.min(.99999, Number(random()) || 0)) * PRACTICE.length))];
  const workbench = element("div", "lesson08-workbench");
  const prompt = element("p", "lesson08-question");
  const answer = element("p", "lesson08-reveal"); answer.hidden = true;
  const controls = element("div", "lesson08-actions"); const reveal = button("Check with Graph"); const next = button("New Challenge", "lesson08-action lesson08-secondary");
  const graph = layoutWithGraph(root, cleanup, { viewport: { xMin: 0, xMax: 3, yMin: -5.5, yMax: 5, yTickStep: 1 } }, workbench);
  function render() {
    const parameters = { a: 1, h: 0, k: challenge.k }; const rootValue = Math.sqrt(-challenge.k); const coarseLeft = Math.floor(rootValue); const coarseRight = Math.ceil(rootValue);
    prompt.textContent = "Root Finder：y=" + challenge.label + " 的正根在哪两个整数之间？再口答：f(x)>0 的图象在哪一侧？";
    answer.textContent = "正根约为 " + number(rootValue) + "，先夹在 [" + coarseLeft + ", " + coarseRight + "]；f(x)>0 在两根外侧。"; answer.hidden = true;
    updateGraph(graph, { parameters, viewport: { xMin: 0, xMax: 3, yMin: Math.min(-5.5, challenge.k - .5), yMax: 5, yTickStep: 1 }, highlightedCurves: [{ ...parameters, xMin: coarseLeft, xMax: coarseRight, color: COLORS.root }], points: [{ x: coarseLeft, y: evaluate(parameters, coarseLeft), color: COLORS.root, radius: 6 }, { x: coarseRight, y: evaluate(parameters, coarseRight), color: COLORS.root, radius: 6 }] });
  }
  reveal.addEventListener("click", () => { answer.hidden = false; }); next.addEventListener("click", () => { const index = (PRACTICE.indexOf(challenge) + 1) % PRACTICE.length; challenge = PRACTICE[index]; render(); }); controls.append(reveal, next); workbench.append(element("p", "lesson08-prompt", "随机口答只做一轮快速判断：先夹根，再用图象判断正负。"), prompt, controls, answer); render();
}

function renderSummary(root) {
  const grid = element("div", "lesson08-summary-grid");
  [["f(x)=0", "曲线与 x 轴的交点 (x-intercept)"], ["f(x)>0", "曲线在 x 轴上方"], ["f(x)<0", "曲线在 x 轴下方"], ["f(x)>g(x)", "f 的曲线在 g 的曲线上方"]].forEach(([symbol, copy]) => { const card = element("article", "lesson08-summary-card"); card.append(formula(symbol, symbol, "lesson08-card-formula"), element("p", "", copy)); grid.append(card); });
  root.append(element("p", "lesson08-prompt", "Graph Language Translator：把式子先翻译成图上的位置关系。"), grid, element("p", "lesson08-bridge-out", "Bridge Out：真实问题里的 x 往往还有实际取值范围。进入 Lesson 09。"));
}

const RENDERERS = Object.freeze([renderBridge, renderEquationFunction, renderFirstBracket, renderZoom, renderShrink, renderInequality, renderLevelLine, renderComparison, renderPractice, renderSummary]);

export function renderLesson08(stage, { step = 1, onStepChange = () => {}, random = Math.random } = {}) {
  const safeStep = Math.min(10, Math.max(1, Number(step) || 1));
  const cleanup = [];
  const root = createRoot(safeStep);
  RENDERERS[safeStep - 1](root, cleanup, random);
  appendNavigation(root, safeStep, onStepChange);
  stage.replaceChildren(root);
  return { destroy() { cleanup.forEach((dispose) => dispose()); } };
}

