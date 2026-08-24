import { renderFormula } from "../formula.js";
import { createParabolaGraph } from "../graph/parabola-svg.js";
import { applyClassroomSplit } from "../classroom-layout.js";
import "./lesson05.css";

const COLORS = Object.freeze({ a: "#cf684e", h: "#197b9b", k: "#c88818", curve: "#19735d", ghost: "#a8bbb4" });
const VIEWPORT = Object.freeze({ xMin: -6, xMax: 6, yMin: -8, yMax: 10, yTickStep: 2 });
const INITIAL = Object.freeze({ a: 1, h: 0, k: 0 });

export const LESSON05_STEP_TITLES = Object.freeze([
  "Bridge In：三个参数，一条抛物线",
  "Parabola Control Lab",
  "性质整合",
  "Shift It：随机平移挑战",
  "Read the Parabola：随机性质挑战",
  "Summary + Bridge Out",
]);

function element(tag, className = "", text = "") {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function button(text, className = "lesson05-action") {
  const node = element("button", className, text);
  node.type = "button";
  return node;
}

function number(value) { return Number.isInteger(value) ? String(value) : String(value); }

function vertexFormText({ a, h, k }) {
  if (a === 0) return "y=" + number(k);
  const coefficient = a === 1 ? "" : a === -1 ? "-" : number(a);
  const bracket = h === 0 ? "x" : "x" + (h > 0 ? "-" : "+") + number(Math.abs(h));
  return "y=" + coefficient + "(" + bracket + ")²" + (k === 0 ? "" : k > 0 ? "+" + number(k) : number(k));
}

function vertexFormLatex(parameters) { return vertexFormText(parameters).replace("²", "^2"); }

function formulaLatex(latex, ariaLabel, className = "lesson05-formula", dataset = "") {
  const node = element("div", className);
  if (dataset) node.dataset[dataset] = "";
  renderFormula(node, latex, { ariaLabel, displayMode: true });
  return node;
}

function formula(parameters, className = "lesson05-formula", dataset = "") { return formulaLatex(vertexFormLatex(parameters), vertexFormText(parameters), className, dataset); }

function createRoot(step) {
  const root = element("section", "lesson05-step");
  const header = element("header", "lesson05-heading");
  header.append(
    element("p", "lesson05-kicker", "LESSON 05 · " + String(step).padStart(2, "0") + " / 06"),
    element("h2", "lesson05-title", LESSON05_STEP_TITLES[step - 1]),
  );
  root.append(header);
  return root;
}

function appendNavigation(root, step, onStepChange) {
  const navigation = element("nav", "lesson05-step-controls");
  navigation.setAttribute("aria-label", "Lesson 5 步骤导航");
  const previous = button("上一步", "lesson05-action lesson05-secondary");
  previous.disabled = step === 1;
  previous.addEventListener("click", () => onStepChange(Math.max(1, step - 1)));
  const next = button(step === 6 ? "回到本课开始" : "下一步");
  next.addEventListener("click", () => onStepChange(step === 6 ? 1 : step + 1));
  navigation.append(previous, element("span", "lesson05-step-count", step + " / 6"), next);
  root.append(navigation);
}

function createGraph(host, parameters, cleanup, { visible = true, ghost = null } = {}) {
  const graph = createParabolaGraph(host, {
    viewport: VIEWPORT,
    curves: visible && parameters.a !== 0 ? [{ ...parameters, color: COLORS.curve }, ...(ghost ? [{ ...ghost, color: COLORS.ghost }] : [])] : [],
    points: visible && parameters.a !== 0 ? [{ x: parameters.h, y: parameters.k, color: COLORS.k, radius: 5 }] : [],
    guides: visible && parameters.a !== 0 ? [{ x: parameters.h, color: COLORS.k }] : [],
    labels: visible && parameters.a !== 0 ? [{ x: Math.min(5, parameters.h + 0.3), y: Math.min(9, parameters.k + 0.8), text: "V(" + number(parameters.h) + ", " + number(parameters.k) + ")" }] : [],
    ariaLabel: "顶点式二次函数图象",
  });
  cleanup.push(() => graph.destroy());
  return graph;
}

function updateGraph(graph, parameters, options = {}) {
  const visible = options.visible ?? true;
  const ghost = options.ghost ?? null;
  const motionPoint = options.motionPoint ?? null;
  const valid = visible && parameters.a !== 0;
  graph.update({
    curves: valid ? [...(ghost ? [{ ...ghost, color: COLORS.ghost }] : []), { ...parameters, color: parameters.a < 0 ? COLORS.a : COLORS.curve }] : [],
    points: valid ? [
      { x: parameters.h, y: parameters.k, color: COLORS.k, radius: 5 },
      ...(motionPoint ? [{ x: motionPoint.x, y: motionPoint.y, color: COLORS.a, radius: 7 }] : []),
    ] : [],
    guides: valid ? [{ x: parameters.h, color: COLORS.k }] : [],
    labels: valid ? [{ x: Math.min(5, parameters.h + 0.3), y: Math.min(9, parameters.k + 0.8), text: "V(" + number(parameters.h) + ", " + number(parameters.k) + ")" }] : [],
    ariaLabel: valid ? "函数 " + vertexFormText(parameters) + " 的图象" : "a 等于零时的水平直线提示",
  });
}

function renderBridge(root) {
  const comparison = element("div", "lesson05-formula-comparison");
  const base = formula(INITIAL, "lesson05-formula lesson05-hero lesson05-bridge-formula"); base.dataset.lesson05BridgeFormula = "base";
  const vertex = formulaLatex("y=a(x-h)^2+k", "y=a(x-h)²+k", "lesson05-formula lesson05-hero lesson05-bridge-formula"); vertex.dataset.lesson05BridgeFormula = "vertex";
  comparison.append(base, vertex);
  const answers = element("div", "lesson05-bridge-answers");
  const selections = {};
  [["a", "a 控制什么？", [["形状、开口和宽窄", "shape"], ["左右平移", "horizontal"], ["上下平移", "vertical"]]], ["h", "h 控制什么？", [["形状、开口和宽窄", "shape"], ["左右平移", "horizontal"], ["上下平移", "vertical"]]], ["k", "k 控制什么？", [["形状、开口和宽窄", "shape"], ["左右平移", "horizontal"], ["上下平移", "vertical"]]]].forEach(([key, label, options]) => {
    const row = element("label", "lesson05-answer-field lesson05-bridge-field");
    const select = document.createElement("select"); select.dataset.lesson05BridgeAnswer = key; select.setAttribute("aria-label", label);
    select.append(new Option("请选择", ""), ...options.map(([text, value]) => new Option(text, value)));
    row.append(element("span", "", label), select); answers.append(row); selections[key] = select;
  });
  const reveal = element("p", "lesson05-bridge-reveal"); reveal.dataset.lesson05BridgeReveal = ""; reveal.hidden = true;
  const show = button("显示答案"); show.dataset.lesson05RevealBridge = "";
  show.addEventListener("click", () => {
    const correct = selections.a.value === "shape" && selections.h.value === "horizontal" && selections.k.value === "vertical";
    reveal.textContent = (correct ? "全部正确。" : "答案：") + " a 控制形状、开口和宽窄；h 控制左右平移；k 控制上下平移。";
    reveal.hidden = false;
  });
  root.append(element("p", "lesson05-prompt", "比较两行函数：先选择 a、h、k 各自控制的变化，再显示答案。"), comparison, answers, show, reveal);
}

function renderLab(root, _onStepChange, cleanup) {
  let state = { ...INITIAL };
  const layout = element("div", "lesson05-lab-layout");
  const workbench = element("aside", "lesson05-workbench");
  const graphPanel = element("div", "lesson05-graph-panel");
  const graphHost = element("div", "lesson05-graph-host");
  graphPanel.append(graphHost);
  const graph = createGraph(graphHost, state, cleanup);
  const modes = element("div", "lesson05-mode-controls");
  const current = formula(state, "lesson05-formula lesson05-current", "lesson05Function");
  const readouts = element("div", "lesson05-readouts");
  const vertex = element("p", ""); vertex.dataset.lesson05Vertex = "";
  const axis = element("p", ""); axis.dataset.lesson05Axis = "";
  const opening = element("p", ""); opening.dataset.lesson05Opening = "";
  const warning = element("p", "lesson05-warning", "a=0：这时不是二次函数；可暂时看作 y=k。 "); warning.dataset.lesson05Warning = "";
  readouts.append(vertex, axis, opening, warning);
  const inputs = {};
  const values = {};
  const controls = element("div", "lesson05-parameter-controls");

  function render() {
    current.replaceChildren();
    renderFormula(current, vertexFormLatex(state), { ariaLabel: vertexFormText(state), displayMode: true });
    Object.keys(values).forEach((key) => { values[key].textContent = number(state[key]); });
    vertex.textContent = "顶点 (vertex)：(" + number(state.h) + ", " + number(state.k) + ")";
    axis.textContent = "对称轴 (axis of symmetry)：x=" + number(state.h);
    warning.hidden = state.a !== 0;
    opening.textContent = state.a === 0 ? "图象暂为 y=" + number(state.k) : "开口 (opening)：" + (state.a > 0 ? "向上；最小值" : "向下；最大值") + "为 " + number(state.k) + "；|a| 越大越窄。";
    updateGraph(graph, state);
  }

  [["a", -3, 3, 0.5], ["h", -5, 5, 1], ["k", -5, 5, 1]].forEach(([key, min, max, step]) => {
    const row = element("label", "lesson05-parameter lesson05-parameter-" + key);
    row.dataset.lesson05Parameter = key;
    row.append(element("span", "", "参数 " + key));
    const input = document.createElement("input");
    input.type = "range"; input.min = String(min); input.max = String(max); input.step = String(step); input.value = String(state[key]); input.setAttribute("aria-label", "参数 " + key);
    const value = element("output", "lesson05-value", number(state[key])); value.dataset.lesson05Value = key;
    inputs[key] = input; values[key] = value;
    input.addEventListener("input", () => { state = { ...state, [key]: Number(input.value) }; render(); });
    row.append(input, value); controls.append(row);
  });
  const modeButtons = {};
  function setMode(mode) {
    ["a", "h", "k"].forEach((key) => { inputs[key].disabled = mode !== "free" && key !== mode; });
    Object.entries(modeButtons).forEach(([key, control]) => control.setAttribute("aria-pressed", String(key === mode)));
  }
  [["a", "Study a"], ["h", "Study h"], ["k", "Study k"], ["free", "Free Mode"]].forEach(([key, text]) => {
    const control = button(text, "lesson05-action lesson05-secondary"); control.dataset.lesson05Mode = key;
    control.addEventListener("click", () => setMode(key)); modeButtons[key] = control; modes.append(control);
  });
  const reset = button("Reset", "lesson05-action lesson05-secondary"); reset.dataset.lesson05Reset = "";
  reset.addEventListener("click", () => { state = { ...INITIAL }; Object.entries(inputs).forEach(([key, input]) => { input.value = String(state[key]); }); setMode("free"); render(); });
  workbench.append(element("p", "lesson05-prompt", "拖动参数后，数值、函数、顶点、对称轴和图象会同时更新。"), modes, current, readouts, controls, reset);
  layout.append(workbench, graphPanel); applyClassroomSplit(layout, workbench, graphPanel); root.append(layout); setMode("free"); render();
}

function renderProperties(root, _onStepChange, cleanup) {
  let state = { ...INITIAL };
  let animationTimer = null;
  let motionPoint = null;
  const layout = element("div", "lesson05-property-layout lesson05-property-study-layout");
  const workbench = element("aside", "lesson05-workbench lesson05-property-workbench");
  const graphPanel = element("div", "lesson05-graph-panel lesson05-property-graph-panel");
  graphPanel.dataset.lesson05PropertyGraph = "";
  const graphHost = element("div", "lesson05-graph-host lesson05-property-graph-host");
  graphPanel.append(graphHost);
  const graph = createGraph(graphHost, state, cleanup);
  const status = element("p", "lesson05-motion-status", "选择开口方向，再让橙色动点从左向右沿曲线移动。");
  status.dataset.lesson05PropertyMotionStatus = "";
  const modes = element("div", "lesson05-mode-controls");
  const modeButtons = {};
  const rows = [
    "顶点 (vertex)：(h, k)；对称轴 (axis of symmetry)：x=h。",
    "a>0：开口向上，左减右增，最小值为 k。",
    "a<0：开口向下，左增右减，最大值为 k。",
    "记忆：a 管形状，h 管左右，k 管上下。",
  ].map((copy) => { const row = element("p", "lesson05-property", copy); row.dataset.lesson05PropertyRow = ""; row.hidden = true; return row; });
  const reveal = button("逐条 Reveal"); let count = 0;
  reveal.dataset.lesson05RevealProperties = "";
  reveal.addEventListener("click", () => { if (rows[count]) rows[count++].hidden = false; if (count === rows.length) reveal.disabled = true; });
  function renderGraph() { updateGraph(graph, state, { motionPoint }); }
  function setMode(a) {
    state = { ...INITIAL, a }; motionPoint = null;
    Object.entries(modeButtons).forEach(([key, control]) => control.setAttribute("aria-pressed", String(Number(key) === a)));
    status.textContent = a > 0 ? "观察开口向上：左侧从左向右会下降，右侧会回升。" : "观察开口向下：左侧从左向右会上升，右侧会下降。";
    renderGraph();
  }
  [[1, "开口向上"], [-1, "开口向下"]].forEach(([a, text]) => {
    const control = button(text, "lesson05-action lesson05-secondary");
    control.addEventListener("click", () => setMode(a)); modeButtons[String(a)] = control; modes.append(control);
  });
  const move = button("让动点从左向右移动", "lesson05-action lesson05-secondary"); move.dataset.lesson05PropertyMotion = "";
  move.addEventListener("click", () => {
    if (animationTimer !== null) window.clearTimeout(animationTimer);
    let x = -2.5;
    const tick = () => {
      motionPoint = { x, y: state.a * x * x };
      status.textContent = x < 0
        ? (state.a > 0 ? "左侧：x 增加时，动点下降，y 减小。" : "左侧：x 增加时，动点上升，y 增大。")
        : (state.a > 0 ? "右侧：x 增加时，动点上升，y 增大。" : "右侧：x 增加时，动点下降，y 减小。");
      renderGraph(); x += .1;
      if (x <= 2.5) animationTimer = window.setTimeout(tick, 24); else animationTimer = null;
    };
    tick();
  });
  cleanup.push(() => { if (animationTimer !== null) window.clearTimeout(animationTimer); });
  workbench.append(element("p", "lesson05-prompt", "先观察图像，再让动点沿抛物线从左向右移动；最后逐项揭示性质。"), modes, status, move, reveal, ...rows);
  layout.append(workbench, graphPanel); root.append(layout); setMode(1);
}

function choose(values, random) { return values[Math.min(values.length - 1, Math.floor(Math.max(0, Math.min(.999999, Number(random()) || 0)) * values.length))]; }

function createChallenge(random) { return { a: choose([-2, -1, 1, 2], random), h: choose([-3, -2, -1, 1, 2, 3], random), k: choose([-3, -2, -1, 1, 2, 3], random) }; }

function createPropertyChallenge(random) { return { a: 2, h: choose([-3, -2, -1, 1, 2, 3], random), k: choose([-3, -2, -1, 1, 2, 3], random) }; }

function renderShiftChallenge(root, _onStepChange, cleanup, random) {
  const layout = element("div", "lesson05-challenge-layout lesson05-shift-layout");
  const workbench = element("aside", "lesson05-workbench lesson05-challenge-workbench");
  const prompt = element("p", "lesson05-question lesson05-shift-question");
  const answer = element("div", "lesson05-answer"); answer.dataset.lesson05ShiftAnswer = "";
  const graphPanel = element("div", "lesson05-graph-panel lesson05-challenge-graph"); graphPanel.hidden = true;
  const graphHost = element("div", "lesson05-graph-host lesson05-challenge-graph-host"); graphPanel.append(graphHost);
  const graph = createGraph(graphHost, INITIAL, cleanup, { visible: false });
  const reveal = button("Reveal Answer"); reveal.dataset.lesson05RevealShift = "";
  const movement = button("Show Movement", "lesson05-action lesson05-secondary");
  const next = button("New Challenge", "lesson05-action lesson05-secondary");
  let challenge;
  function update() {
    challenge = createChallenge(random);
    prompt.textContent = "基础 y=" + number(challenge.a) + "x²；先向" + (challenge.h > 0 ? "右" : "左") + "平移 " + Math.abs(challenge.h) + "，再向" + (challenge.k > 0 ? "上" : "下") + "平移 " + Math.abs(challenge.k) + "。请口答新的顶点式。";
    answer.replaceChildren(formula(challenge)); answer.hidden = true; graphPanel.hidden = true;
  }
  reveal.addEventListener("click", () => { answer.hidden = false; });
  movement.addEventListener("click", () => { graphPanel.hidden = false; updateGraph(graph, challenge, { ghost: { a: challenge.a, h: 0, k: 0 } }); });
  const actions = element("div", "lesson05-actions"); actions.append(reveal, movement, next);
  next.addEventListener("click", update); workbench.append(prompt, answer, actions); layout.append(workbench, graphPanel); root.append(layout); update();
}

function renderPropertyChallenge(root, _onStepChange, cleanup, random) {
  const question = element("div", "lesson05-question");
  const form = element("div", "lesson05-property-form");
  const layout = element("div", "lesson05-property-layout");
  const workbench = element("aside", "lesson05-workbench lesson05-challenge-workbench");
  const answer = element("p", "lesson05-answer", ""); answer.dataset.lesson05PropertyFeedback = ""; answer.hidden = true;
  const graphPanel = element("div", "lesson05-graph-panel lesson05-challenge-graph"); graphPanel.dataset.lesson05PropertyGraph = ""; graphPanel.hidden = true;
  const graphHost = element("div", "lesson05-graph-host lesson05-challenge-graph-host"); graphPanel.append(graphHost);
  const graph = createGraph(graphHost, INITIAL, cleanup, { visible: false });
  const inputs = {};
  const select = (key, label, options) => {
    const row = element("label", "lesson05-answer-field");
    const input = document.createElement("select"); input.dataset.lesson05PropertyAnswer = key; input.setAttribute("aria-label", label);
    input.append(new Option("请选择", ""), ...options.map(([text, value]) => new Option(text, value)));
    row.append(element("span", "", label), input); form.append(row); inputs[key] = input;
  };
  const numeric = (key, label) => {
    const row = element("label", "lesson05-answer-field");
    const input = document.createElement("input"); input.type = "number"; input.step = "1"; input.dataset.lesson05PropertyAnswer = key; input.setAttribute("aria-label", label);
    row.append(element("span", "", label), input); form.append(row); inputs[key] = input;
  };
  select("opening", "开口方向", [["向上", "up"], ["向下", "down"]]);
  numeric("axis", "对称轴 x=");
  numeric("vertex-x", "顶点横坐标");
  numeric("vertex-y", "顶点纵坐标");
  select("horizontal-direction", "左右平移方向", [["向左", "left"], ["向右", "right"]]);
  numeric("horizontal-distance", "左右平移单位");
  select("vertical-direction", "上下平移方向", [["向上", "up"], ["向下", "down"]]);
  numeric("vertical-distance", "上下平移单位");
  const check = button("检查作答并显示图像"); check.dataset.lesson05CheckProperty = "";
  const next = button("New Challenge", "lesson05-action lesson05-secondary");
  let challenge;
  function update() {
    challenge = createPropertyChallenge(random);
    question.replaceChildren(element("p", "", "从基准函数 y=2x² 出发，在左侧工作台作答，再看右侧图象验证。"), formula(challenge));
    Object.values(inputs).forEach((input) => { input.value = ""; });
    answer.hidden = true; graphPanel.hidden = true;
  }
  check.addEventListener("click", () => {
    const values = Object.fromEntries(Object.entries(inputs).map(([key, input]) => [key, input.value]));
    const horizontalDirection = challenge.h > 0 ? "right" : "left";
    const verticalDirection = challenge.k > 0 ? "up" : "down";
    const correct = values.opening === "up" && Number(values.axis) === challenge.h && Number(values["vertex-x"]) === challenge.h && Number(values["vertex-y"]) === challenge.k && values["horizontal-direction"] === horizontalDirection && Number(values["horizontal-distance"]) === Math.abs(challenge.h) && values["vertical-direction"] === verticalDirection && Number(values["vertical-distance"]) === Math.abs(challenge.k);
    answer.textContent = (correct ? "全部正确。" : "已提交，核对正确答案：") + " 开口向上；对称轴 x=" + number(challenge.h) + "；顶点 (" + number(challenge.h) + ", " + number(challenge.k) + ")。从 y=2x² 向" + (horizontalDirection === "right" ? "右" : "左") + "平移 " + Math.abs(challenge.h) + " 单位，再向" + (verticalDirection === "up" ? "上" : "下") + "平移 " + Math.abs(challenge.k) + " 单位。";
    answer.hidden = false; graphPanel.hidden = false; updateGraph(graph, challenge);
  });
  const actions = element("div", "lesson05-actions"); actions.append(check, next);
  next.addEventListener("click", update); workbench.append(question, form, answer, actions); layout.append(workbench, graphPanel); root.append(element("p", "lesson05-prompt", "先读解析式，回答开口、对称轴、顶点以及相对 y=2x² 的平移；无需填完也可显示答案和图象。"), layout); update();
}

function renderSummary(root) {
  const cards = element("div", "lesson05-role-grid");
  [["a", "形状、开口与宽窄"], ["h", "左右平移，顶点横坐标"], ["k", "上下平移，顶点纵坐标"]].forEach(([name, copy]) => { const card = element("article", "lesson05-role lesson05-role-" + name); card.append(element("h3", "", name), element("p", "", copy)); cards.append(card); });
  root.append(formula(INITIAL, "lesson05-formula lesson05-hero"), cards, element("p", "lesson05-bridge-out", "下一课：y=2x²-8x+3 不是顶点式，怎样得到顶点信息？"));
}

const RENDERERS = Object.freeze([renderBridge, renderLab, renderProperties, renderShiftChallenge, renderPropertyChallenge, renderSummary]);

export function renderLesson05(stage, { step = 1, onStepChange = () => {}, random = Math.random }) {
  const safeStep = Math.min(6, Math.max(1, Number(step) || 1));
  const cleanup = [];
  const root = createRoot(safeStep);
  RENDERERS[safeStep - 1](root, onStepChange, cleanup, random);
  appendNavigation(root, safeStep, onStepChange);
  stage.replaceChildren(root);
  return { destroy() { cleanup.forEach((dispose) => dispose()); } };
}


