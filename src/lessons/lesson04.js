import { renderFormula } from "../formula.js";
import { createParabolaGraph } from "../graph/parabola-svg.js";
import { applyClassroomSplit } from "../classroom-layout.js";
import {
  BASE_POINTS,
  SHIFTED_POINTS,
  TRANSLATION_ARROWS,
  formatLesson04Formula,
  getLesson04Properties,
} from "./lesson04-state.js";

const COLORS = Object.freeze({ base: "#2563eb", shifted: "#dc4055", arrow: "#b45f06" });
const VIEWPORT = Object.freeze({ xMin: -4, xMax: 4, yMin: -4, yMax: 28 });
const PLAYBACK_DELAY = 650;

export const LESSON04_STEP_TITLES = Object.freeze([
  "同 x 描点：两组点",
  "连接两条抛物线",
  "观察：向右平移 1 个单位",
  "对应点验证",
  "探索：y=(x-k)²",
]);

function element(tag, className = "", text = "") {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function button(text, className = "lesson04-action") {
  const node = element("button", className, text);
  node.type = "button";
  return node;
}

function formula(latex, label = latex) {
  const node = element("div", "lesson04-formula");
  renderFormula(node, latex, { ariaLabel: label, displayMode: true });
  return node;
}

function createRoot(step) {
  const root = element("section", "lesson04-step");
  const header = element("header", "lesson04-heading");
  header.append(
    element("p", "lesson04-kicker", "LESSON 04 · " + String(step).padStart(2, "0") + " / 05"),
    element("h2", "lesson04-title", LESSON04_STEP_TITLES[step - 1]),
  );
  root.append(header);
  return root;
}

function appendNavigation(root, step, onStepChange) {
  const controls = element("nav", "lesson04-step-controls");
  controls.setAttribute("aria-label", "Lesson 4 步骤导航");
  const previous = button("上一步", "lesson04-action lesson04-secondary");
  previous.disabled = step === 1;
  previous.addEventListener("click", () => onStepChange(Math.max(1, step - 1)));
  const next = button(step === LESSON04_STEP_TITLES.length ? "回到本课开始" : "下一步");
  next.addEventListener("click", () => onStepChange(step === LESSON04_STEP_TITLES.length ? 1 : step + 1));
  controls.append(previous, element("span", "lesson04-step-count", step + " / " + LESSON04_STEP_TITLES.length), next);
  root.append(controls);
}

function createLayout(root, options, cleanup) {
  const layout = element("div", "lesson04-layout");
  const graphPane = element("div", "lesson04-graph-panel");
  const graphHost = element("div", "lesson04-graph-host");
  const workbench = element("aside", "lesson04-workbench");
  graphPane.append(graphHost);
  layout.append(graphPane, workbench);
  applyClassroomSplit(layout, workbench, graphPane);
  root.append(layout);
  const graph = createParabolaGraph(graphHost, { viewport: VIEWPORT, ...options });
  cleanup.push(() => graph.destroy());
  return { graph, workbench };
}

function addConclusion(workbench, text) {
  const conclusion = element("p", "lesson04-conclusion", text);
  conclusion.dataset.lesson04Conclusion = "";
  conclusion.hidden = true;
  workbench.append(conclusion);
  return conclusion;
}

function addReveal(workbench, reveal) {
  const control = button("揭示结论", "lesson04-action lesson04-secondary");
  control.dataset.lesson04Reveal = "";
  control.addEventListener("click", reveal);
  workbench.append(control);
}

function baseCurve() {
  return { a: 1, color: COLORS.base };
}

function shiftedCurve(k = 1) {
  return { a: 1, h: k, color: COLORS.shifted };
}

function colouredPoints(points, color) {
  return points.map((point) => ({ ...point, color, radius: 5 }));
}

function allPoints() {
  return [...colouredPoints(BASE_POINTS, COLORS.base), ...colouredPoints(SHIFTED_POINTS, COLORS.shifted)];
}

function addLegend(workbench) {
  const legend = element("div", "lesson04-legend");
  [[COLORS.base, "蓝色：y=x²"], [COLORS.shifted, "红色：y=(x-1)²"]].forEach(([color, text]) => {
    const item = element("span", "lesson04-legend-item");
    const swatch = element("i", "lesson04-swatch");
    swatch.style.background = color;
    item.append(swatch, document.createTextNode(text));
    legend.append(item);
  });
  workbench.append(legend);
}

function createPointTable() {
  const table = document.createElement("table");
  table.className = "lesson04-point-table";
  table.dataset.lesson04PointTable = "";
  table.innerHTML = "<thead><tr><th>x</th><th>y=x²</th><th>蓝点</th><th>y=(x-1)²</th><th>红点</th></tr></thead>";
  const body = document.createElement("tbody");
  table.append(body);
  return { table, body };
}

function fillPointRows(body, count) {
  body.replaceChildren(...BASE_POINTS.slice(0, count).map((base, index) => {
    const shifted = SHIFTED_POINTS[index];
    const row = document.createElement("tr");
    [String(base.x), String(base.y), "(" + base.x + ", " + base.y + ")", String(shifted.y), "(" + shifted.x + ", " + shifted.y + ")"]
      .forEach((value) => row.append(element("td", "", value)));
    return row;
  }));
}

function renderPairedPlot(root, _onStepChange, cleanup) {
  const { graph, workbench } = createLayout(root, { points: [], curves: [], ariaLabel: "同一组 x 值下 y 等于 x 平方与 y 等于 x 减一平方的描点比较" }, cleanup);
  let visibleCount = 0;
  let connected = false;
  const { table, body } = createPointTable();
  const status = element("p", "lesson04-status");
  status.setAttribute("aria-live", "polite");
  const generate = button("生成下一组蓝红点");
  const connect = button("连接两条曲线", "lesson04-action lesson04-secondary");
  generate.dataset.lesson04GeneratePair = "";
  connect.dataset.lesson04ConnectPairs = "";
  const conclusion = addConclusion(workbench, "九组相同的 x 值已经分别产生蓝点和红点；接下来连接两组点。 ");

  function update() {
    generate.disabled = visibleCount >= BASE_POINTS.length;
    connect.disabled = visibleCount < BASE_POINTS.length;
    status.textContent = connected
      ? "两条曲线已连接：蓝色和红色各有 9 个点。"
      : "已生成 " + visibleCount + "/" + BASE_POINTS.length + " 组同 x 的蓝红点。";
    fillPointRows(body, visibleCount);
    graph.update({
      points: [...colouredPoints(BASE_POINTS.slice(0, visibleCount), COLORS.base), ...colouredPoints(SHIFTED_POINTS.slice(0, visibleCount), COLORS.shifted)],
      curves: connected ? [baseCurve(), shiftedCurve()] : [],
    });
    conclusion.hidden = !connected;
  }

  generate.addEventListener("click", () => { visibleCount = Math.min(BASE_POINTS.length, visibleCount + 1); update(); });
  connect.addEventListener("click", () => { if (visibleCount === BASE_POINTS.length) { connected = true; update(); } });
  workbench.append(
    formula("y=x^2", "蓝色函数 y 等于 x 平方"),
    formula("y=(x-1)^2", "红色函数 y 等于 x 减一的平方"),
    element("p", "lesson04-prompt", "每次固定同一个 x，同时计算两个函数值。例如 x=1 时，蓝点是 (1,1)，红点是 (1,0)。"),
    table,
    generate,
    connect,
    status,
  );
  addLegend(workbench);
  addReveal(workbench, () => { visibleCount = BASE_POINTS.length; connected = true; update(); });
  update();
}

function renderConnection(root, _onStepChange, cleanup) {
  const { workbench } = createLayout(root, {
    curves: [baseCurve(), shiftedCurve()],
    points: allPoints(),
    ariaLabel: "九个蓝色点和九个红色点连接成的两条抛物线",
  }, cleanup);
  const conclusion = addConclusion(workbench, "蓝色 y=x² 与红色 y=(x-1)² 的形状、开口方向完全相同。 ");
  workbench.append(
    formula("y=x^2", "蓝色函数"),
    formula("y=(x-1)^2", "红色函数"),
    element("p", "lesson04-prompt", "九个蓝点和九个红点都在同一个坐标系中。分别连接后，观察它们的形状和位置。"),
  );
  addLegend(workbench);
  addReveal(workbench, () => { conclusion.hidden = false; });
}

function renderComparison(root, _onStepChange, cleanup) {
  const { workbench } = createLayout(root, {
    curves: [baseCurve(), shiftedCurve()],
    points: allPoints(),
    ariaLabel: "蓝色基准抛物线和红色右移一单位抛物线的比较",
  }, cleanup);
  const conclusion = addConclusion(workbench, "红色图象由蓝色图象向右平移 1 个单位得到：形状不变，顶点从 (0,0) 移到 (1,0)。");
  workbench.append(
    formula("y=x^2", "蓝色基准函数"),
    formula("y=(x-1)^2", "红色新函数"),
    element("p", "lesson04-prompt", "两条图象的开口与宽窄不变。红色顶点在哪里？它相对蓝色顶点怎样移动？"),
  );
  addLegend(workbench);
  addReveal(workbench, () => { conclusion.hidden = false; });
}

function renderCorrespondence(root, _onStepChange, cleanup) {
  const { graph, workbench } = createLayout(root, {
    curves: [baseCurve(), shiftedCurve()], points: allPoints(), arrows: [],
    ariaLabel: "选择八对可见对应点验证向右平移一单位",
  }, cleanup);
  let arrowCount = 0;
  let playbackTimer = null;
  const status = element("p", "lesson04-status");
  status.setAttribute("aria-live", "polite");
  const conclusion = addConclusion(workbench, "对应点的横坐标都 +1，纵坐标不变；因此图象整体向右平移 1 个单位。 ");
  const showAll = button("显示对应点箭头");
  const play = button("逐对播放", "lesson04-action lesson04-secondary");
  showAll.dataset.lesson04ShowArrows = "";
  play.dataset.lesson04PlayArrows = "";

  function cancelPlayback() {
    if (playbackTimer !== null) window.clearTimeout(playbackTimer);
    playbackTimer = null;
  }
  function update() {
    status.textContent = "已显示 " + arrowCount + "/" + TRANSLATION_ARROWS.length + " 对可见对应点。";
    conclusion.hidden = arrowCount < TRANSLATION_ARROWS.length;
    graph.update({ arrows: TRANSLATION_ARROWS.slice(0, arrowCount).map((arrow) => ({ ...arrow, color: COLORS.arrow })) });
  }
  function schedule() {
    cancelPlayback();
    if (arrowCount >= TRANSLATION_ARROWS.length) return;
    playbackTimer = window.setTimeout(() => {
      playbackTimer = null;
      arrowCount = Math.min(TRANSLATION_ARROWS.length, arrowCount + 1);
      update();
      schedule();
    }, PLAYBACK_DELAY);
  }
  showAll.addEventListener("click", () => { cancelPlayback(); arrowCount = TRANSLATION_ARROWS.length; update(); });
  play.addEventListener("click", () => { if (arrowCount >= TRANSLATION_ARROWS.length) arrowCount = 0; arrowCount += 1; update(); schedule(); });
  cleanup.push(cancelPlayback);
  workbench.append(
    formula("(x,y)\\longrightarrow(x+1,y)", "对应点向右移动一个单位"),
    element("p", "lesson04-prompt", "从图中选取可同时看见的对应点：点的横坐标加 1，纵坐标不变。"),
    showAll,
    play,
    status,
  );
  addReveal(workbench, () => { cancelPlayback(); arrowCount = TRANSLATION_ARROWS.length; update(); });
  update();
}

function renderKLab(root, _onStepChange, cleanup) {
  const { graph, workbench } = createLayout(root, {
    curves: [baseCurve(), shiftedCurve(0)],
    ariaLabel: "通过改变 k 观察 y 等于 x 减 k 平方的左右平移",
  }, cleanup);
  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = "-4";
  slider.max = "4";
  slider.step = "1";
  slider.value = "0";
  slider.dataset.lesson04Slider = "k";
  const formulaHost = element("div", "lesson04-formula");
  const readout = element("p", "lesson04-status");
  readout.dataset.lesson04ShiftReadout = "";
  const conclusion = addConclusion(workbench, "在 y=(x-k)² 中，k>0 时向右平移 k 个单位；k<0 时向左平移 |k| 个单位。 ");

  function update() {
    const k = Number(slider.value);
    const currentFormula = formatLesson04Formula({ a: 1, h: k });
    const properties = getLesson04Properties({ a: 1, h: k });
    formulaHost.replaceChildren();
    renderFormula(formulaHost, currentFormula, { ariaLabel: "当前函数 " + currentFormula, displayMode: true });
    readout.textContent = "当前 k=" + k + "；" + properties.shift + "；顶点是 (" + k + ", 0)。";
    graph.update({ curves: [baseCurve(), shiftedCurve(k)] });
  }

  slider.addEventListener("input", update);
  workbench.append(
    formula("y=x^2", "蓝色基准函数"),
    formulaHost,
    element("label", "lesson04-slider-label", "改变 k，观察红色图象的左右移动"),
    slider,
    readout,
    element("p", "lesson04-prompt", "蓝色 y=x² 保持不动。拖动滑块，比较红色 y=(x-k)² 与蓝色图象的位置。"),
  );
  addLegend(workbench);
  addReveal(workbench, () => { conclusion.hidden = false; });
  update();
}

const RENDERERS = Object.freeze([renderPairedPlot, renderConnection, renderComparison, renderCorrespondence, renderKLab]);

export function renderLesson04(stage, { step = 1, onStepChange = () => {} }) {
  const safeStep = Math.min(RENDERERS.length, Math.max(1, Number(step) || 1));
  const cleanup = [];
  const root = createRoot(safeStep);
  RENDERERS[safeStep - 1](root, onStepChange, cleanup);
  appendNavigation(root, safeStep, onStepChange);
  stage.replaceChildren(root);
  return { destroy() { cleanup.forEach((dispose) => dispose()); } };
}

