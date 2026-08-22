import { renderFormula } from "../formula.js";
import { createParabolaGraph } from "../graph/parabola-svg.js";
import { BASE_POINTS, SHIFTED_POINTS, TRANSLATION_ARROWS } from "./lesson04-state.js";

const COLORS = Object.freeze({ base: "#5c7385", shifted: "#1f8a70", arrow: "#b45f06" });
const VIEWPORT = Object.freeze({ xMin: -4, xMax: 5, yMin: -4, yMax: 28 });
const PLAYBACK_DELAY = 650;

export const LESSON04_STEP_TITLES = Object.freeze([
  "猜一猜：图象向哪边移？",
  "描点：生成 y=x²",
  "描点：生成 y=(x-1)²",
  "比较两个图象",
  "对应点的水平平移",
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
  controls.append(previous, element("span", "lesson04-step-count", step + " / 5"), next);
  root.append(controls);
}

function createLayout(root, options, cleanup) {
  const layout = element("div", "lesson04-layout");
  const graphPane = element("div", "lesson04-graph-panel");
  const graphHost = element("div", "lesson04-graph-host");
  const workbench = element("aside", "lesson04-workbench");
  graphPane.append(graphHost);
  layout.append(graphPane, workbench);
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
  return control;
}

function baseCurve() {
  return { a: 1, color: COLORS.base };
}

function shiftedCurve() {
  return { a: 1, h: 1, color: COLORS.shifted };
}

function colouredPoints(points, color) {
  return points.map((point) => ({ ...point, color, radius: 5 }));
}

function renderGuess(root, _onStepChange, cleanup) {
  const { workbench } = createLayout(root, { ariaLabel: "水平平移猜想" }, cleanup);
  const controls = element("div", "lesson04-controls");
  const status = element("p", "lesson04-status", "选择后先保留猜测。");
  status.setAttribute("aria-live", "polite");
  const conclusion = addConclusion(workbench, "新函数的图象由基准图象向右平移 1 个单位得到。");
  const left = button("向左移 1");
  const right = button("向右移 1");
  left.dataset.lesson04Guess = "left";
  right.dataset.lesson04Guess = "right";
  [left, right].forEach((choice) => choice.setAttribute("aria-pressed", "false"));
  function choose(choice) {
    [left, right].forEach((item) => item.setAttribute("aria-pressed", String(item === choice)));
    status.textContent = "已记录你的猜测，答案将在揭示时公布。";
  }
  left.addEventListener("click", () => choose(left));
  right.addEventListener("click", () => choose(right));
  controls.append(left, right);
  workbench.append(
    formula("y=x^2", "基准函数 y 等于 x 平方"),
    formula("y=(x-1)^2", "新函数 y 等于 x 减一的平方"),
    element("p", "lesson04-prompt", "与基准图象相比，新图象会向左移 1 个单位，还是向右移 1 个单位？先猜一猜。"),
    controls,
    status,
  );
  addReveal(workbench, () => { conclusion.hidden = false; });
}

function renderBasePlot(root, _onStepChange, cleanup) {
  const { graph, workbench } = createLayout(root, { points: [], curves: [], ariaLabel: "y 等于 x 平方的九点描图" }, cleanup);
  let visibleCount = 0;
  let connected = false;
  const status = element("p", "lesson04-status");
  status.setAttribute("aria-live", "polite");
  const conclusion = addConclusion(workbench, "9 个基准点已经描出并连成基准抛物线。");
  const generate = button("生成下一个基准点");
  generate.dataset.lesson04GenerateBase = "";
  function update() {
    connected = visibleCount === BASE_POINTS.length || connected;
    generate.disabled = visibleCount >= BASE_POINTS.length;
    status.textContent = "已生成 " + visibleCount + "/" + BASE_POINTS.length + " 个基准点。";
    graph.update({
      points: colouredPoints(BASE_POINTS.slice(0, visibleCount), COLORS.base),
      curves: connected ? [baseCurve()] : [],
    });
    conclusion.hidden = !connected;
  }
  generate.addEventListener("click", () => { visibleCount = Math.min(BASE_POINTS.length, visibleCount + 1); update(); });
  workbench.append(
    formula("y=x^2", "函数 y 等于 x 平方"),
    element("p", "lesson04-prompt", "按顺序生成每个输入值对应的点，逐点描出基准图象。"),
    generate,
    status,
  );
  addReveal(workbench, () => { visibleCount = BASE_POINTS.length; connected = true; update(); });
  update();
}

function renderShiftedPlot(root, _onStepChange, cleanup) {
  const { graph, workbench } = createLayout(root, { points: [], curves: [], ariaLabel: "y 等于 x 减一平方的十点描图" }, cleanup);
  let visibleCount = 0;
  let connected = false;
  const status = element("p", "lesson04-status");
  status.setAttribute("aria-live", "polite");
  const conclusion = addConclusion(workbench, "10 个新点已经连成新抛物线。 ");
  const generate = button("生成下一个新点");
  const connect = button("连接新曲线", "lesson04-action lesson04-secondary");
  generate.dataset.lesson04GenerateShifted = "";
  connect.dataset.lesson04ConnectShifted = "";
  function update() {
    generate.disabled = visibleCount >= SHIFTED_POINTS.length;
    connect.disabled = visibleCount < SHIFTED_POINTS.length;
    status.textContent = connected ? "新曲线已连接。" : "已生成 " + visibleCount + "/" + SHIFTED_POINTS.length + " 个新函数点。";
    graph.update({
      points: colouredPoints(SHIFTED_POINTS.slice(0, visibleCount), COLORS.shifted),
      curves: connected ? [shiftedCurve()] : [],
    });
    conclusion.hidden = !connected;
  }
  generate.addEventListener("click", () => { visibleCount = Math.min(SHIFTED_POINTS.length, visibleCount + 1); update(); });
  connect.addEventListener("click", () => { if (visibleCount === SHIFTED_POINTS.length) { connected = true; update(); } });
  workbench.append(
    formula("y=(x-1)^2", "函数 y 等于 x 减一的平方"),
    element("p", "lesson04-prompt", "按顺序生成每个输入值对应的点；十个点全部出现后再连接新曲线。"),
    generate,
    connect,
    status,
  );
  addReveal(workbench, () => { visibleCount = SHIFTED_POINTS.length; connected = true; update(); });
  update();
}

function renderCompare(root, _onStepChange, cleanup) {
  const { workbench } = createLayout(root, {
    curves: [baseCurve(), shiftedCurve()],
    points: [...colouredPoints(BASE_POINTS, COLORS.base), ...colouredPoints(SHIFTED_POINTS, COLORS.shifted)],
    ariaLabel: "基准抛物线与向右平移一单位后的抛物线对比",
  }, cleanup);
  const conclusion = addConclusion(workbench, "两条抛物线开口、形状相同；绿色图象整体位于蓝灰图象右侧。");
  workbench.append(
    formula("y=x^2", "基准函数"),
    formula("y=(x-1)^2", "新函数"),
    element("p", "lesson04-prompt", "比较两条抛物线的开口、形状和位置。"),
    element("p", "lesson04-status", "先观察，再揭示比较结论。"),
  );
  addReveal(workbench, () => { conclusion.hidden = false; });
}

function renderArrows(root, _onStepChange, cleanup) {
  const { graph, workbench } = createLayout(root, {
    curves: [baseCurve(), shiftedCurve()],
    points: [...colouredPoints(BASE_POINTS, COLORS.base), ...colouredPoints(SHIFTED_POINTS, COLORS.shifted)],
    arrows: [],
    ariaLabel: "九对对应点向右平移一单位",
  }, cleanup);
  let arrowCount = 0;
  let playbackTimer = null;
  const status = element("p", "lesson04-status");
  status.setAttribute("aria-live", "polite");
  const conclusion = addConclusion(workbench, "每个对应点都向右移动 1 个单位，所以整条图象向右平移 1 个单位。 ");
  const showAll = button("显示全部箭头");
  const play = button("逐对播放", "lesson04-action lesson04-secondary");
  showAll.dataset.lesson04ShowArrows = "";
  play.dataset.lesson04PlayArrows = "";
  [showAll, play].forEach((control) => control.setAttribute("aria-pressed", "false"));
  function cancelPlayback() {
    if (playbackTimer !== null) window.clearTimeout(playbackTimer);
    playbackTimer = null;
  }
  function update(mode) {
    showAll.setAttribute("aria-pressed", String(mode === "all"));
    play.setAttribute("aria-pressed", String(mode === "play"));
    status.textContent = "已显示 " + arrowCount + "/" + TRANSLATION_ARROWS.length + " 条右移箭头。";
    conclusion.hidden = arrowCount < TRANSLATION_ARROWS.length;
    graph.update({ arrows: TRANSLATION_ARROWS.slice(0, arrowCount).map((arrow) => ({ ...arrow, color: COLORS.arrow })) });
  }
  function schedule() {
    cancelPlayback();
    if (arrowCount >= TRANSLATION_ARROWS.length) return;
    playbackTimer = window.setTimeout(() => {
      playbackTimer = null;
      arrowCount = Math.min(TRANSLATION_ARROWS.length, arrowCount + 1);
      update("play");
      schedule();
    }, PLAYBACK_DELAY);
  }
  showAll.addEventListener("click", () => { cancelPlayback(); arrowCount = TRANSLATION_ARROWS.length; update("all"); });
  play.addEventListener("click", () => {
    if (arrowCount >= TRANSLATION_ARROWS.length) arrowCount = 0;
    arrowCount += 1;
    update("play");
    schedule();
  });
  cleanup.push(cancelPlayback);
  workbench.append(
    formula("(x,y)\\longrightarrow(x+1,y)", "点 x y 向右移动到 x 加一 y"),
    element("p", "lesson04-prompt", "观察九对对应点：横坐标怎样变，纵坐标怎样变？"),
    showAll,
    play,
    status,
  );
  addReveal(workbench, () => { cancelPlayback(); arrowCount = TRANSLATION_ARROWS.length; update("all"); });
  update("idle");
}

const RENDERERS = Object.freeze([renderGuess, renderBasePlot, renderShiftedPlot, renderCompare, renderArrows]);

export function renderLesson04(stage, { step = 1, onStepChange = () => {} }) {
  const safeStep = Math.min(RENDERERS.length, Math.max(1, Number(step) || 1));
  const cleanup = [];
  const root = createRoot(safeStep);
  RENDERERS[safeStep - 1](root, onStepChange, cleanup);
  appendNavigation(root, safeStep, onStepChange);
  stage.replaceChildren(root);
  return { destroy() { cleanup.forEach((dispose) => dispose()); } };
}
