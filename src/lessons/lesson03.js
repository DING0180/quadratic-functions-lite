import { renderFormula } from "../formula.js";
import { createParabolaGraph } from "../graph/parabola-svg.js";
import "./lesson03.css";
import {
  LESSON03_POINT_X_VALUES,
  createLesson03PointState,
  describeLesson03Function,
} from "./lesson03-state.js";

const COLORS = Object.freeze({ base: "#a8bbb4", curve: "#19735d", accent: "#d98935", negative: "#cf684e" });

export const LESSON03_STEP_TITLES = Object.freeze([
  "从 y=ax² 到 y=x²+1",
  "同 x 描点：每个 y 都 +1",
  "从九个点到整体上移",
  "推广：k 控制上下平移",
  "变化与不变",
  "顶点、增减性与最值",
  "典型例题与变式",
  "a-k Double Parameter Lab",
  "核心结论",
  "向左右平移的追问",
]);

function element(tag, className = "", text = "") {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function button(text, className = "lesson03-action") {
  const node = element("button", className, text);
  node.type = "button";
  return node;
}

function formula(latex, label = latex, className = "lesson03-formula") {
  const node = element("div", className);
  renderFormula(node, latex, { ariaLabel: label, displayMode: true });
  return node;
}

function formatAkFunction(a, k) {
  const coefficient = a === 1 ? "" : a === -1 ? "-" : String(a);
  return "y=" + coefficient + "x²" + (k === 0 ? "" : k > 0 ? "+" + k : k);
}

function createRoot(step) {
  const root = element("section", "lesson03-step");
  const header = element("header", "lesson03-heading");
  header.append(
    element("p", "lesson03-kicker", "LESSON 03 · " + String(step).padStart(2, "0") + " / 10"),
    element("h2", "lesson03-title", LESSON03_STEP_TITLES[step - 1]),
  );
  root.append(header);
  return root;
}

function appendNavigation(root, step, onStepChange) {
  const controls = element("nav", "lesson03-step-controls");
  controls.setAttribute("aria-label", "Lesson 3 步骤导航");
  const previous = button("上一步", "lesson03-action lesson03-secondary");
  previous.disabled = step === 1;
  previous.addEventListener("click", () => onStepChange(Math.max(1, step - 1)));
  const next = button(step === 10 ? "回到本课开始" : "下一步");
  next.addEventListener("click", () => onStepChange(step === 10 ? 1 : step + 1));
  controls.append(previous, element("span", "lesson03-step-count", step + " / 10"), next);
  root.append(controls);
}

function addGraph(container, options, cleanup, panelClass = "") {
  const panel = element("div", ("lesson03-graph-panel " + panelClass).trim());
  const host = element("div", "lesson03-graph-host");
  panel.append(host);
  container.append(panel);
  const graph = createParabolaGraph(host, options);
  cleanup.push(() => graph.destroy());
  return graph;
}

function animate(callback, cleanup, duration = 700) {
  let frame = null;
  let active = true;
  const now = () => globalThis.performance?.now?.() ?? Date.now();
  const request = window.requestAnimationFrame ?? ((work) => window.setTimeout(() => work(now()), 16));
  const cancel = window.cancelAnimationFrame ?? window.clearTimeout;
  const start = now();
  function tick(now) {
    if (!active) return;
    const progress = Math.min(1, (now - start) / duration);
    callback(progress);
    if (progress < 1) frame = request(tick);
  }
  frame = request(tick);
  cleanup.push(() => { active = false; if (frame !== null) cancel(frame); });
}

function renderBridge(root) {
  const reveal = element("div", "lesson03-reveal");
  reveal.hidden = true;
  reveal.append(
    formula("a=1", "固定 a 等于一"),
    formula("\\boxed{y=x^2+1}", "函数 y 等于 x 平方加一"),
    element("p", "lesson03-question", "上节课已经会画 y=x²。现在每个函数值都多了 1，图象会怎样？"),
  );
  const start = button("固定 a = 1，提出新问题");
  start.addEventListener("click", () => { start.hidden = true; reveal.hidden = false; });
  root.append(
    element("p", "lesson03-prompt", "上一节研究 a 如何控制开口方向和宽窄。这一节固定 a，只研究位置。"),
    formula("y=ax^2"),
    start,
    reveal,
  );
}

function renderPointLab(root, onStepChange, cleanup) {
  const layout = element("div", "lesson03-two-column");
  const graphPane = element("div", "lesson03-graph-panel");
  const host = element("div", "lesson03-graph-host");
  graphPane.append(host);
  const graph = createParabolaGraph(host, {
    curves: [{ a: 1, k: 0, color: COLORS.base }], points: [],
    labels: [{ x: 2.35, y: 6, text: "y=x²" }], ariaLabel: "y 等于 x 平方和上移一单位的描点比较",
  });
  cleanup.push(() => graph.destroy());
  const workbench = element("aside", "lesson03-workbench");
  const state = createLesson03PointState(1);
  const choices = element("div", "lesson03-choice-grid");
  const table = document.createElement("table");
  table.className = "lesson03-data-table";
  table.innerHTML = "<thead><tr><th>x</th><th>y=x²</th><th>原点</th><th>y=x²+1</th><th>新点</th><th>变化</th></tr></thead>";
  const body = document.createElement("tbody");
  table.append(body);
  const status = element("p", "lesson03-status", "Points plotted: 0 / 9");
  const connect = button("连接新的九个点", "lesson03-action lesson03-connect");
  connect.disabled = true;
  const observe = element("p", "lesson03-question", "横坐标没有变；每一个纵坐标都 +1。因此整条抛物线整体上移 1 个单位。 ");
  observe.hidden = true;

  function update() {
    body.replaceChildren(...state.rows.map(({ x, baseY, shiftedY, delta }) => {
      const row = document.createElement("tr");
      [String(x), String(baseY), "(" + x + ", " + baseY + ")", String(shiftedY), "(" + x + ", " + shiftedY + ")", "+" + delta]
        .forEach((value) => row.append(element("td", "", value)));
      return row;
    }));
    status.textContent = "Points plotted: " + state.count + " / 9";
    connect.disabled = !state.complete;
  }
  LESSON03_POINT_X_VALUES.forEach((x) => {
    const choice = button("x = " + x, "lesson03-point-choice");
    choice.dataset.lesson03Point = String(x);
    choice.addEventListener("click", () => {
      if (!state.plot(x)) return;
      choice.disabled = true;
      graph.update({ points: state.rows.map(({ x: pointX, baseY }) => ({ x: pointX, y: baseY, color: COLORS.base })) });
      update();
    });
    choices.append(choice);
  });
  connect.addEventListener("click", () => {
    if (!state.complete) return;
    graph.update({
      curves: [{ a: 1, k: 0, color: COLORS.base }, { a: 1, k: 1, color: COLORS.curve }],
      points: state.rows.map(({ x, shiftedY }) => ({ x, y: shiftedY, color: COLORS.curve })),
      labels: [{ x: 2.35, y: 6, text: "y=x²" }, { x: 2.25, y: 7, text: "y=x²+1" }],
    });
    observe.hidden = false;
  });
  workbench.append(
    formula("y=x^2\\quad\\text{and}\\quad y=x^2+1", "旧函数与新函数"),
    element("p", "lesson03-prompt", "每次选择同一个 x，比较两个函数的 y。"), choices, status, table, connect, observe,
  );
  layout.append(graphPane, workbench);
  root.append(layout);
  update();
}

function renderShift(root, _onStepChange, cleanup) {
  const graph = addGraph(root, {
    curves: [{ a: 1, k: 0, color: COLORS.base }, { a: 1, k: 0, color: COLORS.curve }],
    labels: [{ x: 2.15, y: 6.5, text: "重合" }], ariaLabel: "抛物线从 y 等于 x 平方上移到 y 等于 x 平方加一",
  }, cleanup, "lesson03-compact-graph");
  const vertex = element("p", "lesson03-vertex-path", "顶点：(0, 0) → (0, 1)");
  const replay = button("Replay Shift");
  replay.addEventListener("click", () => {
    replay.disabled = true;
    animate((progress) => {
      const k = Number(progress.toFixed(2));
      graph.update({ curves: [{ a: 1, k: 0, color: COLORS.base }, { a: 1, k, color: COLORS.curve }], labels: [{ x: 2.15, y: 6.5 + k, text: "整体上移" }] });
      if (progress === 1) replay.disabled = false;
    }, cleanup, 900);
  });
  root.append(element("p", "lesson03-prompt", "绿色图象保持原来的形状，平滑地搬到更高的位置。"), vertex, replay);
}

function renderKLab(root, _onStepChange, cleanup) {
  const graph = addGraph(root, { curves: [{ a: 1, k: 0, color: COLORS.curve }], ariaLabel: "拖动 k 观察二次函数上下平移" }, cleanup, "lesson03-compact-graph");
  const readout = element("p", "lesson03-status", "当前顶点：(0, 0)；k=0");
  const functionReadout = element("p", "lesson03-function-readout", "当前 a = 1；当前 k = 0；当前函数：y=x²");
  const slider = document.createElement("input");
  slider.type = "range"; slider.min = "-4"; slider.max = "4"; slider.step = "1"; slider.value = "0";
  slider.dataset.lesson03Slider = "k";
  const conclusion = element("p", "lesson03-rule", "k 改变位置，不改变形状。");
  conclusion.hidden = true;
  function update() {
    const k = Number(slider.value);
    graph.update({ curves: [{ a: 1, k, color: COLORS.curve }], labels: [{ x: 2.15, y: Math.min(14, 5 + k), text: "k=" + k }] });
    readout.textContent = "当前顶点：(0, " + k + ")；k=" + (k > 0 ? "+" : "") + k;
    functionReadout.textContent = "当前 a = 1；当前 k = " + k + "；当前函数：" + formatAkFunction(1, k);
  }
  slider.addEventListener("input", () => { update(); conclusion.hidden = false; });
  root.append(element("p", "lesson03-lock", "a = 1 🔒"), element("p", "lesson03-prompt", "固定 a=1，拖动 k，观察顶点和整条图象的位置。"), slider, functionReadout, readout, conclusion);
}

function renderInvariants(root) {
  const answers = [
    ["What Changed?", "整体上下位置、顶点、最大值或最小值会改变。"],
    ["What Stayed the Same?", "开口方向、开口宽窄、抛物线形状和对称轴 x=0 不变。"],
  ];
  const cards = element("div", "lesson03-card-grid");
  let count = 0;
  answers.forEach(([title, answer]) => {
    const card = element("article", "lesson03-card");
    const copy = element("p", "", answer); copy.hidden = true;
    card.append(element("h3", "", title), copy); cards.append(card);
  });
  const reveal = button("Reveal 下一条");
  reveal.addEventListener("click", () => {
    const copies = cards.querySelectorAll("p");
    if (copies[count]) copies[count++].hidden = false;
    if (count === copies.length) reveal.disabled = true;
  });
  root.append(element("p", "lesson03-prompt", "先根据刚才的 k 实验作答，再逐条揭示。"), cards, reveal);
}

function renderProperties(root) {
  const rows = [["开口方向", "向上", "向下"], ["顶点", "(0,k)", "(0,k)"], ["对称轴", "x=0", "x=0"], ["x<0", "y 随 x 增大而减小", "y 随 x 增大而增大"], ["x>0", "y 随 x 增大而增大", "y 随 x 增大而减小"], ["最值", "最小值 k", "最大值 k"]];
  const table = document.createElement("table"); table.className = "lesson03-property-table";
  table.innerHTML = "<thead><tr><th>性质</th><th>a&gt;0</th><th>a&lt;0</th></tr></thead>";
  const body = document.createElement("tbody");
  rows.forEach((row) => { const item = document.createElement("tr"); item.hidden = true; row.forEach((cell, index) => item.append(element(index ? "td" : "th", "", cell))); body.append(item); });
  table.append(body);
  let visible = 0;
  const reveal = button("逐行 Reveal");
  reveal.addEventListener("click", () => { if (body.children[visible]) body.children[visible++].hidden = false; if (visible === rows.length) reveal.disabled = true; });
  root.append(element("p", "lesson03-prompt", "固定 k 后，a 的符号仍决定开口方向、增减性和最值类型。"), table, reveal);
}

function renderExamples(root, _onStepChange, cleanup) {
  const graph = addGraph(root, { curves: [{ a: 1, k: 0, color: COLORS.curve }], ariaLabel: "例题的二次函数图象" }, cleanup, "lesson03-compact-graph");
  const question = element("p", "lesson03-question");
  const hint = element("p", "lesson03-prompt"); hint.hidden = true;
  const answer = element("p", "lesson03-rule"); answer.hidden = true;
  const next = button("随机生成题目"); const reveal = button("Reveal", "lesson03-action lesson03-secondary");
  let index = 0;
  const examples = [{ a: 1, k: -2 }, { a: -1, k: 3 }, { a: 2, k: 1 }, { a: -2, k: -1 }];
  function update() {
    const current = examples[index++ % examples.length];
    const info = describeLesson03Function(current);
    question.textContent = "Question：已知 y=" + (current.a === -1 ? "-" : current.a === 1 ? "" : current.a) + "x²" + (current.k >= 0 ? "+" : "") + current.k + "，写出顶点、对称轴和" + info.extremum + "。";
    hint.textContent = "Hint：先看 a 的符号，再读顶点 (0,k)。";
    answer.textContent = "Key Idea：顶点 " + info.vertex + "；对称轴 " + info.axis + "；开口" + info.opening + "，" + info.extremum + "。";
    hint.hidden = true; answer.hidden = true;
    graph.update({ curves: [{ a: current.a, k: current.k, color: current.a > 0 ? COLORS.curve : COLORS.negative }] });
  }
  next.addEventListener("click", update);
  reveal.addEventListener("click", () => { hint.hidden = false; answer.hidden = false; });
  root.append(question, element("p", "lesson03-prompt", "Think：先看 a 的符号，再读 (0,k)。"), hint, answer, next, reveal);
  update();
}

function renderParameterLab(root, _onStepChange, cleanup) {
  const graph = addGraph(root, { curves: [{ a: 1, k: 0, color: COLORS.curve }], ariaLabel: "a 和 k 双参数二次函数实验室" }, cleanup, "lesson03-compact-graph");
  const controls = element("div", "lesson03-controls");
  const aInput = document.createElement("input"); aInput.type = "range"; aInput.min = "-3"; aInput.max = "3"; aInput.step = "0.5"; aInput.value = "1"; aInput.dataset.lesson03Slider = "a";
  const kInput = document.createElement("input"); kInput.type = "range"; kInput.min = "-4"; kInput.max = "4"; kInput.step = "1"; kInput.value = "0"; kInput.dataset.lesson03Slider = "k";
  const readout = element("p", "lesson03-status"); const notice = element("p", "lesson03-warning", "a=0：此时不是二次函数，图象退化为 y=k。"); notice.hidden = true;
  const conclusion = element("p", "lesson03-rule", "a 控制形状；k 控制上下位置。"); conclusion.hidden = true;
  const state = { a: 1, k: 0, mode: "free", keepPrevious: false, previous: null };
  function update({ preserve = false } = {}) {
    const a = Number(aInput.value); const k = Number(kInput.value);
    if (preserve && state.keepPrevious) state.previous = { a: state.a, k: state.k };
    state.a = a; state.k = k;
    const info = describeLesson03Function({ a: a || 1, k });
    const curves = [];
    if (state.previous) curves.push({ ...state.previous, color: COLORS.base });
    curves.push({ a, k, color: a < 0 ? COLORS.negative : COLORS.curve });
    graph.update({ curves, labels: [{ x: 2.1, y: Math.min(14, 5 + k), text: "a=" + a + ", k=" + k }] });
    readout.textContent = "当前 a = " + a + "；当前 k = " + k + "；当前函数：" + formatAkFunction(a, k) + "；顶点 " + (a === 0 ? "—" : info.vertex) + "；" + (a === 0 ? "" : "开口" + info.opening);
    notice.hidden = a !== 0;
  }
  aInput.addEventListener("input", () => update({ preserve: true })); kInput.addEventListener("input", () => update({ preserve: true }));
  const modes = [["study-a", "Study a"], ["study-k", "Study k"], ["free", "Free Mode"]].map(([mode, title]) => {
    const control = button(title, "lesson03-action lesson03-secondary"); control.dataset.lesson03Mode = mode;
    control.addEventListener("click", () => {
      state.mode = mode;
      aInput.disabled = mode === "study-k";
      kInput.disabled = mode === "study-a";
      modes.forEach((item) => item.setAttribute("aria-pressed", String(item === control)));
    });
    return control;
  });
  const keep = button("Keep Previous Graph", "lesson03-action lesson03-secondary"); keep.dataset.lesson03Keep = "";
  keep.setAttribute("aria-pressed", "false");
  keep.addEventListener("click", () => { state.keepPrevious = !state.keepPrevious; keep.setAttribute("aria-pressed", String(state.keepPrevious)); if (!state.keepPrevious) { state.previous = null; update(); } });
  const reveal = button("Reveal Conclusion", "lesson03-action lesson03-secondary"); reveal.addEventListener("click", () => { conclusion.hidden = false; });
  modes.find((control) => control.dataset.lesson03Mode === "free").setAttribute("aria-pressed", "true");
  controls.append(...modes, keep, element("label", "", "a（形状）"), aInput, element("label", "", "k（上下位置）"), kInput);
  root.append(element("p", "lesson03-prompt", "使用 Study a、Study k 和 Free Mode 分开观察两个参数的职责。"), controls, readout, notice, element("p", "lesson03-question", "哪个参数控制形状？哪个参数控制上下位置？"), reveal, conclusion);
  update();
}

function renderSummary(root) {
  const cards = element("div", "lesson03-card-grid");
  [["a", "控制开口方向与开口宽窄。"], ["k", "控制上下位置与顶点纵坐标。"], ["Fixed", "对称轴仍为 x=0，顶点为 (0,k)。"]].forEach(([title, copy]) => {
    const card = element("article", "lesson03-card"); card.append(element("h3", "", title), element("p", "", copy)); cards.append(card);
  });
  root.append(formula("\\boxed{y=ax^2+k}"), cards);
}

function renderBridgeOut(root, _onStepChange, cleanup) {
  const graph = addGraph(root, { curves: [{ a: 1, k: 0, color: COLORS.base }, { a: 1, k: 0, h: 0, color: COLORS.curve }], ariaLabel: "为下一课准备的左右平移问题" }, cleanup);
  const prompt = element("p", "lesson03-question", "如果想保持图象形状不变，让顶点向左或向右移动，该怎么办？"); prompt.hidden = true;
  const next = formula("y=a(x-h)^2", "下一课的函数形式"); next.hidden = true;
  const play = button("播放左右移动预告");
  play.addEventListener("click", () => {
    play.disabled = true;
    prompt.hidden = false; next.hidden = false;
    animate((progress) => {
      const h = Number((progress * 2).toFixed(2));
      graph.update({
        curves: [{ a: 1, k: 0, color: COLORS.base }, { a: 1, k: 0, h, color: COLORS.curve }],
        labels: [{ x: Math.min(3.2, h + 0.45), y: 1.5, text: "顶点向右移动" }],
      });
      if (progress === 1) play.disabled = false;
    }, cleanup, 900);
  });
  root.append(element("p", "lesson03-prompt", "本课只解决上下平移；下一课再揭示左右平移的公式。"), play, prompt, next);
}

const RENDERERS = Object.freeze([renderBridge, renderPointLab, renderShift, renderKLab, renderInvariants, renderProperties, renderExamples, renderParameterLab, renderSummary, renderBridgeOut]);

export function renderLesson03(stage, { step = 1, onStepChange }) {
  const safeStep = Math.min(RENDERERS.length, Math.max(1, Number(step) || 1));
  const cleanup = [];
  const root = createRoot(safeStep);
  RENDERERS[safeStep - 1](root, onStepChange, cleanup);
  appendNavigation(root, safeStep, onStepChange);
  stage.replaceChildren(root);
  return { destroy() { cleanup.forEach((dispose) => dispose()); } };
}
