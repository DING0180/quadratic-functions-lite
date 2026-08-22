import { renderFormula } from "../formula.js";
import { createParabolaGraph } from "../graph/parabola-svg.js";
import "./lesson09.css";

const COLORS = Object.freeze({ curve: "#1d765e", segment: "#d98935", vertex: "#7653af", outside: "#bd4a40", muted: "#b4c7c0" });
const CORE = Object.freeze({ a: 1, h: 4, k: -3 });

export const LESSON09_STEP_TITLES = Object.freeze([
  "Bridge In：完整抛物线的最值",
  "截取图象：只研究一段曲线",
  "顶点在不在范围内？",
  "方法总结：先范围，再顶点",
  "Quick Random Practice：区间判断",
  "应用题 1：围栏面积最大",
  "应用题格式：图 + 步骤",
  "应用题 2：价格与收入",
  "Lesson Summary：区间最值",
  "Bridge Out：进入利润问题",
]);

function clean(value) { return Math.abs(value) < 1e-9 ? 0 : Number(Number(value).toFixed(6)); }
function valueAt(parameters, x) { return clean(parameters.a * (x - parameters.h) ** 2 + parameters.k); }
function number(value) { const result = clean(value); return Number.isInteger(result) ? String(result) : String(result); }
function element(tag, className = "", text = "") { const node = document.createElement(tag); if (className) node.className = className; if (text) node.textContent = text; return node; }
function button(text, className = "lesson09-action") { const node = element("button", className, text); node.type = "button"; return node; }

function latexFor({ a, h, k }, variable = "x") {
  const coefficient = a === 1 ? "" : a === -1 ? "-" : String(a);
  const shift = h === 0 ? variable + "^2" : "(" + variable + (h > 0 ? "-" + h : "+" + Math.abs(h)) + ")^2";
  const tail = k === 0 ? "" : k > 0 ? "+" + k : String(k);
  return "y=" + coefficient + shift + tail;
}

function formula(latex, label, className = "lesson09-formula", dataset = "") {
  const node = element("div", className);
  if (dataset) node.dataset[dataset] = "";
  renderFormula(node, latex, { ariaLabel: label, displayMode: true });
  return node;
}

export function analyzeRestrictedQuadratic(parameters, domain) {
  const [first, second] = domain.map(Number);
  const left = Math.min(first, second); const right = Math.max(first, second);
  if (![parameters.a, parameters.h, parameters.k, left, right].every(Number.isFinite) || parameters.a === 0 || left === right) throw new TypeError("A non-zero quadratic and an increasing domain are required");
  const vertex = { x: clean(parameters.h), y: valueAt(parameters, parameters.h) };
  const endpoints = [{ x: clean(left), y: valueAt(parameters, left), type: "left" }, { x: clean(right), y: valueAt(parameters, right), type: "right" }];
  const vertexInDomain = vertex.x >= left && vertex.x <= right;
  const candidates = vertexInDomain ? [...endpoints, { ...vertex, type: "vertex" }] : endpoints;
  const minimum = candidates.reduce((best, point) => point.y < best.y ? point : best);
  const maximum = candidates.reduce((best, point) => point.y > best.y ? point : best);
  return { domain: [left, right], vertex, vertexInDomain, endpoints, candidates, minimum, maximum };
}

function createRoot(step) {
  const root = element("section", "lesson09-step");
  const heading = element("header", "lesson09-heading");
  heading.append(element("p", "lesson09-kicker", "LESSON 09 · " + String(step).padStart(2, "0") + " / 10"), element("h2", "lesson09-title", LESSON09_STEP_TITLES[step - 1]));
  root.append(heading); return root;
}

function appendNavigation(root, step, onStepChange) {
  const nav = element("nav", "lesson09-step-controls"); nav.setAttribute("aria-label", "Lesson 9 步骤导航");
  const previous = button("上一步", "lesson09-action lesson09-secondary"); previous.disabled = step === 1; previous.addEventListener("click", () => onStepChange(Math.max(1, step - 1)));
  const next = button(step === 10 ? "回到本课开始" : "下一步"); next.addEventListener("click", () => onStepChange(step === 10 ? 1 : step + 1));
  nav.append(previous, element("span", "lesson09-step-count", step + " / 10"), next); root.append(nav);
}

function graphOptions(parameters, analysis, { viewport = { xMin: 0, xMax: 8, yMin: -4, yMax: 14, yTickStep: 2 }, full = true, labels = [], ariaLabel = "二次函数图象" } = {}) {
  const [left, right] = analysis.domain;
  const points = analysis.endpoints.map((point) => ({ ...point, color: COLORS.segment, radius: 6 }));
  points.push({ ...analysis.vertex, color: analysis.vertexInDomain ? COLORS.vertex : COLORS.outside, radius: 6 });
  return {
    viewport, curves: full ? [{ ...parameters, color: COLORS.muted }] : [],
    highlightedCurves: [{ ...parameters, xMin: left, xMax: right, color: COLORS.segment }], points, labels,
    guides: [{ x: analysis.vertex.x, color: analysis.vertexInDomain ? COLORS.vertex : COLORS.outside }], ariaLabel,
  };
}

function createGraph(host, cleanup, options) { const graph = createParabolaGraph(host, options); cleanup.push(() => graph.destroy()); return graph; }
function layout(root, cleanup, options, workbench) {
  const shell = element("div", "lesson09-layout"); const panel = element("div", "lesson09-graph-panel"); const host = element("div", "lesson09-graph-host");
  panel.append(host); const graph = createGraph(host, cleanup, options); shell.append(panel, workbench); root.append(shell); return graph;
}
function pointText(point) { return "(" + number(point.x) + ", " + number(point.y) + ")"; }
function extremaText(analysis) { return "最小值 (minimum) " + number(analysis.minimum.y) + " 在 x=" + number(analysis.minimum.x) + "；最大值 (maximum) " + number(analysis.maximum.y) + " 在 x=" + number(analysis.maximum.x) + "。"; }

function renderBridge(root, cleanup) {
  let parameters = { a: 1, h: 0, k: 0 };
  const workbench = element("div", "lesson09-workbench"); const prompt = element("p", "lesson09-prompt"); const answer = element("p", "lesson09-reveal"); answer.hidden = true;
  const controls = element("div", "lesson09-actions"); const upward = button("开口向上", "lesson09-action lesson09-secondary"); const downward = button("开口向下", "lesson09-action lesson09-secondary"); const reveal = button("Reveal：最值在哪里");
  const analysis = () => analyzeRestrictedQuadratic(parameters, [-4, 4]);
  const graph = layout(root, cleanup, graphOptions(parameters, analysis(), { viewport: { xMin: -4, xMax: 4, yMin: -8, yMax: 8, yTickStep: 2 }, full: false, ariaLabel: "完整抛物线与顶点" }), workbench);
  function render() {
    const openingUp = parameters.a > 0; prompt.textContent = openingUp ? "复习：若研究完整抛物线，最小值在哪里取得？" : "复习：若研究完整抛物线，最大值在哪里取得？";
    answer.textContent = openingUp ? "开口向上：最小值 (minimum) 在顶点 (vertex) 取得。" : "开口向下：最大值 (maximum) 在顶点 (vertex) 取得。";
    answer.hidden = true; graph.update(graphOptions(parameters, analysis(), { viewport: { xMin: -4, xMax: 4, yMin: -8, yMax: 8, yTickStep: 2 }, full: false, ariaLabel: "完整抛物线，顶点在原点" }));
  }
  upward.addEventListener("click", () => { parameters = { a: 1, h: 0, k: 0 }; render(); }); downward.addEventListener("click", () => { parameters = { a: -1, h: 0, k: 0 }; render(); }); reveal.addEventListener("click", () => { answer.hidden = false; });
  controls.append(upward, downward, reveal); workbench.append(element("p", "lesson09-kicker", "Full Parabola · 完整抛物线"), prompt, formula("y=x^2", "y=x²", "lesson09-formula lesson09-current"), controls, answer, element("p", "lesson09-note", "真实问题里，x 往往只能取一段实际范围。接下来只保留曲线的一段。")); render();
}

function renderRestrictedSegment(root, cleanup) {
  const parameters = CORE; let left = 2; let right = 3;
  const workbench = element("div", "lesson09-workbench"); const domainReadout = element("p", "lesson09-status"); domainReadout.dataset.lesson09DomainReadout = "";
  const vertexReadout = element("p", "lesson09-vertex-status"); const leftInput = document.createElement("input"); leftInput.type = "range"; leftInput.min = "0"; leftInput.max = "7"; leftInput.step = "1"; leftInput.value = String(left); leftInput.dataset.lesson09LeftBound = ""; leftInput.setAttribute("aria-label", "left bound");
  const rightInput = document.createElement("input"); rightInput.type = "range"; rightInput.min = "1"; rightInput.max = "8"; rightInput.step = "1"; rightInput.value = String(right); rightInput.dataset.lesson09RightBound = ""; rightInput.setAttribute("aria-label", "right bound");
  const controls = element("div", "lesson09-range-controls"); controls.append(element("label", "", "left bound 左端点"), leftInput, element("label", "", "right bound 右端点"), rightInput);
  const graph = layout(root, cleanup, graphOptions(parameters, analyzeRestrictedQuadratic(parameters, [left, right]), { labels: [{ x: 4.15, y: -3.5, text: "vertex x=4" }], ariaLabel: "完整抛物线与被截取的区间曲线" }), workbench);
  function render() {
    if (left >= right) { if (document.activeElement === leftInput) right = Math.min(8, left + 1); else left = Math.max(0, right - 1); leftInput.value = String(left); rightInput.value = String(right); }
    const analysis = analyzeRestrictedQuadratic(parameters, [left, right]);
    domainReadout.textContent = "当前实际范围 (current domain)：x∈[" + number(left) + ", " + number(right) + "]";
    vertexReadout.textContent = "顶点 x=4：" + (analysis.vertexInDomain ? "在范围内 (inside the domain)" : "不在范围内 (outside the domain)");
    graph.update(graphOptions(parameters, analysis, { labels: [{ x: 4.12, y: -3.55, text: "vertex x=4" }], ariaLabel: domainReadout.textContent + "，" + vertexReadout.textContent }));
  }
  leftInput.addEventListener("input", () => { left = Number(leftInput.value); render(); }); rightInput.addEventListener("input", () => { right = Number(rightInput.value); render(); });
  workbench.append(element("p", "lesson09-prompt", "灰色是完整图象；橙色是实际研究的曲线段。拖动端点，图象、范围与判断同步变化。"), formula(latexFor(parameters), "y=(x-4)²-3", "lesson09-formula lesson09-current", "lesson09CurrentFunction"), domainReadout, controls, vertexReadout, element("p", "lesson09-note", "只研究橙色这一段：完整图象的顶点不一定还能作为实际最值。")); render();
}

const CASES = Object.freeze([
  { id: "A", domain: [2, 3], label: "顶点在范围左外侧", question: "顶点不在范围内，最大值和最小值会在哪里？" },
  { id: "B", domain: [2, 6], label: "范围包含顶点", question: "顶点进入范围后，哪一个最值回到顶点？" },
  { id: "C", domain: [4.5, 6], label: "靠近顶点但不包含", question: "离顶点很近，能把顶点当作最值点吗？" },
]);

function conclusionForCase(analysis) { return (analysis.vertexInDomain ? "顶点在给定范围内，因此它也是候选点；" : "顶点不在给定范围内，因此不能参与实际最值判断；") + "再比较有效端点。" + extremaText(analysis); }

function renderCases(root, cleanup) {
  let current = CASES[0]; const workbench = element("div", "lesson09-workbench"); const title = element("p", "lesson09-status"); const question = element("p", "lesson09-question"); const answer = element("p", "lesson09-reveal"); answer.dataset.lesson09CaseAnswer = ""; answer.hidden = true;
  const controls = element("div", "lesson09-actions"); const reveal = button("Reveal：候选点与最值"); reveal.dataset.lesson09RevealCase = "";
  reveal.addEventListener("click", () => { answer.hidden = false; });
  CASES.forEach((item) => { const control = button("Case " + item.id, "lesson09-action lesson09-secondary"); control.addEventListener("click", () => { current = item; render(); }); controls.append(control); }); controls.append(reveal);
  const graph = layout(root, cleanup, graphOptions(CORE, analyzeRestrictedQuadratic(CORE, current.domain), { ariaLabel: "区间最值案例" }), workbench);
  function render() { const analysis = analyzeRestrictedQuadratic(CORE, current.domain); title.textContent = "Case " + current.id + " · x∈[" + current.domain.join(", ") + "] · " + current.label; question.textContent = current.question; answer.textContent = conclusionForCase(analysis); answer.hidden = true; graph.update(graphOptions(CORE, analysis, { ariaLabel: title.textContent })); }
  workbench.append(element("p", "lesson09-prompt", "先问：顶点在不在给定范围内？再决定候选点。答案默认隐藏。"), title, question, controls, answer); render();
}

function renderMethod(root) {
  const cards = element("div", "lesson09-method-grid");
  [["1", "Restrict · 明确 x 的实际范围"], ["2", "Check Vertex · 顶点是否在范围内"], ["3", "Compare · 顶点（若有效）与端点比较"], ["4", "Conclude · 写出最值及对应 x"]].forEach(([numberText, copy]) => { const card = element("article", "lesson09-method-card"); card.append(element("strong", "", "Step " + numberText), element("p", "", copy)); cards.append(card); });
  root.append(element("p", "lesson09-prompt", "How to Find Max / Min on a Restricted Domain? 这是本课的核心判断流程。"), cards, element("p", "lesson09-rule", "先看范围，再看顶点，最后判断最值。"), element("p", "lesson09-note", "若顶点不在范围内：只比较有效端点；若顶点在范围内：顶点也是候选点。"));
}

const PRACTICE = Object.freeze([{ parameters: { a: 1, h: 3, k: -2 }, domain: [0, 2] }, { parameters: { a: -1, h: 2, k: 6 }, domain: [1, 4] }, { parameters: { a: 1, h: 1, k: -4 }, domain: [2, 5] }]);

function renderPractice(root, cleanup, random) {
  let index = Math.min(PRACTICE.length - 1, Math.floor(Math.max(0, Math.min(.99999, Number(random()) || 0)) * PRACTICE.length)); const workbench = element("div", "lesson09-workbench"); const prompt = element("p", "lesson09-question"); const answer = element("p", "lesson09-reveal"); answer.dataset.lesson09PracticeAnswer = ""; answer.hidden = true;
  const reveal = button("Reveal：检查判断"); reveal.dataset.lesson09RevealPractice = ""; const next = button("New Case", "lesson09-action lesson09-secondary"); const controls = element("div", "lesson09-actions"); controls.append(next, reveal);
  const graph = layout(root, cleanup, graphOptions(PRACTICE[index].parameters, analyzeRestrictedQuadratic(PRACTICE[index].parameters, PRACTICE[index].domain), { viewport: { xMin: -1, xMax: 6, yMin: -6, yMax: 10, yTickStep: 2 }, ariaLabel: "区间最值练习图象" }), workbench);
  function render() { const item = PRACTICE[index]; const analysis = analyzeRestrictedQuadratic(item.parameters, item.domain); prompt.textContent = latexFor(item.parameters) + "，x∈[" + item.domain.join(", ") + "]。顶点在范围内吗？最大值、最小值在哪里？"; answer.textContent = (analysis.vertexInDomain ? "顶点在范围内。" : "顶点不在范围内。") + extremaText(analysis); answer.hidden = true; graph.update(graphOptions(item.parameters, analysis, { viewport: { xMin: -1, xMax: 6, yMin: -6, yMax: 10, yTickStep: 2 }, ariaLabel: prompt.textContent })); }
  next.addEventListener("click", () => { index = (index + 1) % PRACTICE.length; render(); }); reveal.addEventListener("click", () => { answer.hidden = false; }); workbench.append(element("p", "lesson09-prompt", "快速口答：范围 → 顶点 → 候选点 → 最值。"), prompt, controls, answer); render();
}

function renderApplicationOne(root, cleanup) {
  const parameters = { a: -1, h: 5, k: 25 }; const analysis = analyzeRestrictedQuadratic(parameters, [0, 10]); const workbench = element("div", "lesson09-workbench"); const shown = element("div", "lesson09-model-steps"); const advance = button("下一步：建立模型"); const answer = element("p", "lesson09-reveal"); answer.hidden = true;
  const steps = [["Situation", "用 20 m 围成一个长方形。令一边为 x m，另一边为 10−x m。"], ["Build Function", "面积 A=x(10−x)=−(x−5)²+25。"], ["Domain", "实际范围：0≤x≤10。"], ["Analyze", "顶点 x=5 在范围内，且抛物线开口向下。"], ["Answer", "面积最大为 25 m²，在 x=5 m 时取得（正方形）。"]]; let count = 1;
  const graph = layout(root, cleanup, graphOptions(parameters, analysis, { viewport: { xMin: 0, xMax: 10, yMin: -4, yMax: 28, yTickStep: 5 }, ariaLabel: "围栏面积与边长的二次函数图象" }), workbench);
  function render() { shown.replaceChildren(...steps.slice(0, count).map(([heading, copy]) => { const item = element("article", "lesson09-model-step"); item.append(element("strong", "", heading), element("p", "", copy)); return item; })); advance.textContent = count < steps.length ? "下一步：建立模型" : "Reveal：回答实际问题"; }
  advance.addEventListener("click", () => { if (count < steps.length) { count += 1; render(); } else answer.hidden = false; }); answer.textContent = steps.at(-1)[1]; workbench.append(element("p", "lesson09-prompt", "应用题不需要花哨效果：用图象与步骤把实际范围带进二次函数。"), formula("A=- (x-5)^2+25", "A=-(x-5)²+25", "lesson09-formula lesson09-current"), shown, advance, answer); render();
}

function renderApplicationFormat(root) {
  const flow = element("div", "lesson09-format-flow");
  [["1", "Situation\n实际情境"], ["2", "Variable\n设未知数"], ["3", "Relation\n列数量关系"], ["4", "Function\n得到二次函数"], ["5", "Domain\n写实际范围"], ["6", "Analyze\n顶点 + 端点"], ["7", "Answer\n回到实际意义"]].forEach(([numberText, copy]) => { const card = element("article", "lesson09-format-card"); card.append(element("strong", "", numberText), element("span", "", copy)); flow.append(card); });
  root.append(element("p", "lesson09-prompt", "所有实际问题都沿用同一条清晰路径。最值不是只看顶点，而是把顶点放回实际范围中检验。"), flow, element("p", "lesson09-rule", "实际范围（domain）是模型的一部分，不是最后才补上的条件。"));
}

function renderApplicationTwo(root, cleanup) {
  const parameters = { a: -2, h: 8, k: 128 }; const analysis = analyzeRestrictedQuadratic(parameters, [5, 12]); const workbench = element("div", "lesson09-workbench"); const answer = element("p", "lesson09-reveal"); answer.hidden = true; const reveal = button("Reveal：最高收入");
  reveal.addEventListener("click", () => { answer.hidden = false; }); answer.textContent = "价格 p=8 元时，收入 R 最大，为 128 元。顶点 p=8 落在实际价格范围 [5, 12] 内。";
  layout(root, cleanup, graphOptions(parameters, analysis, { viewport: { xMin: 4, xMax: 13, yMin: 40, yMax: 140, yTickStep: 20 }, ariaLabel: "价格与收入的受限二次函数图象" }), workbench);
  workbench.append(element("p", "lesson09-prompt", "某商品售价为 p 元时，销量 q=32−2p。收入 R=pq。"), formula("R=p(32-2p)=-2(p-8)^2+128", "R=p(32-2p)=-2(p-8)²+128", "lesson09-formula lesson09-current"), element("p", "lesson09-status", "实际价格范围：5≤p≤12"), element("p", "lesson09-question", "顶点是否在实际范围内？最高收入是多少？"), reveal, answer);
}

function renderSummary(root) {
  const grid = element("div", "lesson09-summary-grid"); [["1. Restrict", "先看实际范围 (domain)"], ["2. Check Vertex", "顶点在不在范围内？"], ["3. Compare", "比较有效候选点，确定最值"]].forEach(([heading, copy]) => { const card = element("article", "lesson09-summary-card"); card.append(element("h3", "", heading), element("p", "", copy)); grid.append(card); });
  root.append(element("p", "lesson09-prompt", "实际问题的最值判断，不能盲目只看完整抛物线的顶点。"), grid, element("p", "lesson09-rule", "先看范围，再看顶点，最后判断最值。"));
}

function renderBridgeOut(root) { root.append(element("p", "lesson09-prompt", "如果价格提高，销量会下降；每件产品赚的钱也会改变。收入最大时，利润一定最大吗？"), element("div", "lesson09-bridge-out", "Next Lesson · Lesson 10：把“收入”继续带入“成本 / 利润”的真实情境。")); }

const RENDERERS = Object.freeze([renderBridge, renderRestrictedSegment, renderCases, renderMethod, renderPractice, renderApplicationOne, renderApplicationFormat, renderApplicationTwo, renderSummary, renderBridgeOut]);

export function renderLesson09(stage, { step = 1, onStepChange = () => {}, random = Math.random } = {}) {
  const safeStep = Math.min(10, Math.max(1, Number(step) || 1)); const cleanup = []; const root = createRoot(safeStep); RENDERERS[safeStep - 1](root, cleanup, random); appendNavigation(root, safeStep, onStepChange); stage.replaceChildren(root); return { destroy() { cleanup.forEach((dispose) => dispose()); } };
}

