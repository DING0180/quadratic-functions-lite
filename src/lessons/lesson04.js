import { renderFormula } from "../formula.js";
import { createParabolaGraph } from "../graph/parabola-svg.js";
import { applyClassroomSplit } from "../classroom-layout.js";
import {
  BASE_POINTS,
  SHIFTED_POINTS,
  TRANSLATION_ARROWS,
  createLesson04QuickCheck,
  formatLesson04Formula,
  getLesson04Properties,
} from "./lesson04-state.js";

const COLORS = Object.freeze({ base: "#2563eb", shifted: "#dc4055", arrow: "#b45f06" });
const VIEWPORT = Object.freeze({ xMin: -4, xMax: 4, yMin: -4, yMax: 28 });
const K_LAB_VIEWPORT = Object.freeze({ xMin: -4, xMax: 4, yMin: -4, yTickStep: 4 });
const PLAYBACK_DELAY = 650;

export const LESSON04_STEP_TITLES = Object.freeze([
  "描点、连线与观察",
  "探索：y=(x-k)²",
  "性质复习：y=(x-1)²",
  "Quick Check",
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
    element("p", "lesson04-kicker", "LESSON 04 · " + String(step).padStart(2, "0") + " / " + String(LESSON04_STEP_TITLES.length).padStart(2, "0")),
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
  workbench.tabIndex = 0;
  workbench.setAttribute("aria-label", "Lesson 4 工作台，可独立滚动");
  graphPane.append(graphHost);
  layout.append(graphPane, workbench);
  applyClassroomSplit(layout, workbench, graphPane);
  root.append(layout);
  const graph = createParabolaGraph(graphHost, { viewport: VIEWPORT, ...options });
  cleanup.push(() => graph.destroy());
  return { graph, workbench };
}

function addConclusion(container, text) {
  const conclusion = element("p", "lesson04-conclusion", text);
  conclusion.dataset.lesson04Conclusion = "";
  conclusion.hidden = true;
  container.append(conclusion);
  return conclusion;
}

function baseCurve() {
  return { a: 1, color: COLORS.base };
}

function shiftedCurve(h = 1, a = 1) {
  return { a, h, color: COLORS.shifted };
}

function getKLabViewport(k) {
  const farthestVisibleY = (4 + Math.abs(k)) ** 2 + 4;
  return { ...K_LAB_VIEWPORT, yMax: Math.max(28, Math.ceil(farthestVisibleY / 4) * 4) };
}

function colouredPoints(points, color) {
  return points.map((point) => ({ ...point, color, radius: 5 }));
}

function addLegend(container) {
  const legend = element("div", "lesson04-legend");
  [[COLORS.base, "蓝色：y=x²"], [COLORS.shifted, "红色：y=(x-1)²"]].forEach(([color, text]) => {
    const item = element("span", "lesson04-legend-item");
    const swatch = element("i", "lesson04-swatch");
    swatch.style.background = color;
    item.append(swatch, document.createTextNode(text));
    legend.append(item);
  });
  container.append(legend);
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

function renderDiscovery(root, _onStepChange, cleanup) {
  const { graph, workbench } = createLayout(root, {
    points: [], curves: [], arrows: [],
    ariaLabel: "同一组 x 值下 y 等于 x 平方与 y 等于 x 减一平方的描点、连线与平移观察",
  }, cleanup);
  let visibleCount = 0;
  let connected = false;
  let arrowCount = 0;
  let playbackTimer = null;
  const pointWork = element("div", "lesson04-point-work");
  pointWork.dataset.lesson04PointWork = "";
  const observation = element("div", "lesson04-observation");
  observation.dataset.lesson04Observation = "";
  observation.hidden = true;
  const { table, body } = createPointTable();
  const pointStatus = element("p", "lesson04-status");
  pointStatus.setAttribute("aria-live", "polite");
  const observationStatus = element("p", "lesson04-status");
  observationStatus.setAttribute("aria-live", "polite");
  const generate = button("生成下一组蓝红点");
  const connect = button("连接两条曲线", "lesson04-action lesson04-secondary");
  generate.dataset.lesson04GeneratePair = "";
  connect.dataset.lesson04ConnectPairs = "";
  const showAll = button("显示对应点移动");
  const play = button("逐对播放", "lesson04-action lesson04-secondary");
  const conclusion = addConclusion(observation, "红色 y=(x-1)² 由蓝色 y=x² 向右平移 1 个单位得到：形状不变，顶点从 (0,0) 移到 (1,0)。");

  function cancelPlayback() {
    if (playbackTimer !== null) window.clearTimeout(playbackTimer);
    playbackTimer = null;
  }

  function update() {
    generate.disabled = visibleCount >= BASE_POINTS.length;
    connect.disabled = visibleCount < BASE_POINTS.length;
    fillPointRows(body, visibleCount);
    pointWork.hidden = connected;
    observation.hidden = !connected;
    pointStatus.textContent = "已生成 " + visibleCount + "/" + BASE_POINTS.length + " 组同 x 的蓝红点。";
    observationStatus.textContent = "已显示 " + arrowCount + "/" + TRANSLATION_ARROWS.length + " 对可见对应点。";
    conclusion.hidden = !connected || arrowCount < TRANSLATION_ARROWS.length;
    graph.update({
      points: [...colouredPoints(BASE_POINTS.slice(0, visibleCount), COLORS.base), ...colouredPoints(SHIFTED_POINTS.slice(0, visibleCount), COLORS.shifted)],
      curves: connected ? [baseCurve(), shiftedCurve()] : [],
      arrows: connected ? TRANSLATION_ARROWS.slice(0, arrowCount).map((arrow) => ({ ...arrow, color: COLORS.arrow })) : [],
    });
  }

  function playNext() {
    cancelPlayback();
    if (arrowCount >= TRANSLATION_ARROWS.length) arrowCount = 0;
    arrowCount += 1;
    update();
    if (arrowCount < TRANSLATION_ARROWS.length) playbackTimer = window.setTimeout(playNext, PLAYBACK_DELAY);
  }

  generate.addEventListener("click", () => {
    visibleCount = Math.min(BASE_POINTS.length, visibleCount + 1);
    update();
  });
  connect.addEventListener("click", () => {
    if (visibleCount === BASE_POINTS.length) {
      connected = true;
      update();
    }
  });
  showAll.addEventListener("click", () => {
    cancelPlayback();
    arrowCount = TRANSLATION_ARROWS.length;
    update();
  });
  play.addEventListener("click", playNext);
  cleanup.push(cancelPlayback);

  pointWork.append(
    formula("y=x^2", "蓝色函数 y 等于 x 平方"),
    formula("y=(x-1)^2", "红色函数 y 等于 x 减一的平方"),
    element("p", "lesson04-prompt", "每次固定同一个 x，同时计算两个函数值。例如 x=1 时，蓝点是 (1,1)，红点是 (1,0)。"),
    table, generate, connect, pointStatus,
  );
  observation.append(
    formula("(x,y)\\longrightarrow(x+1,y)", "对应点向右移动一个单位"),
    element("p", "lesson04-prompt", "两条曲线已在同一个坐标系中。观察红色点如何对应蓝色点：横坐标怎样变化，纵坐标是否变化？"),
    showAll, play, observationStatus,
  );
  workbench.append(pointWork, observation);
  addLegend(workbench);
  update();
}

function renderKLab(root, _onStepChange, cleanup) {
  const { graph, workbench } = createLayout(root, {
    viewport: getKLabViewport(0),
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
  const conclusion = addConclusion(workbench, "在 y=(x-k)² 中，k>0 时向右平移 k 个单位；k<0 时向左平移 |k| 个单位。");
  const reveal = button("揭示结论", "lesson04-action lesson04-secondary");

  function update() {
    const k = Number(slider.value);
    const currentFormula = formatLesson04Formula({ a: 1, h: k });
    const properties = getLesson04Properties({ a: 1, h: k });
    formulaHost.replaceChildren();
    renderFormula(formulaHost, currentFormula, { ariaLabel: "当前函数 " + currentFormula, displayMode: true });
    readout.textContent = "当前 k=" + k + "；" + properties.shift + "；顶点是 (" + k + ", 0)。";
    graph.update({ viewport: getKLabViewport(k), curves: [baseCurve(), shiftedCurve(k)] });
  }

  slider.addEventListener("input", update);
  reveal.addEventListener("click", () => { conclusion.hidden = false; });
  workbench.append(
    formula("y=x^2", "蓝色基准函数"), formulaHost,
    element("label", "lesson04-slider-label", "改变 k，观察红色图象的左右移动"), slider, readout,
    element("p", "lesson04-prompt", "蓝色 y=x² 保持不动。拖动滑块，比较红色 y=(x-k)² 与蓝色图象的位置。"), reveal,
  );
  addLegend(workbench);
  update();
}

function renderProperties(root, _onStepChange, cleanup) {
  const { graph, workbench } = createLayout(root, {
    curves: [baseCurve(), shiftedCurve()],
    points: [{ x: 1, y: 0, color: COLORS.shifted, radius: 8 }],
    guides: [{ x: 1, color: COLORS.shifted }],
    ariaLabel: "y 等于 x 减一平方的顶点、对称轴和增减性复习",
  }, cleanup);
  const table = document.createElement("table");
  table.className = "lesson04-property-table";
  table.dataset.lesson04PropertiesTable = "";
  table.innerHTML = "<thead><tr><th>性质</th><th>y=(x-1)²</th></tr></thead>";
  const body = document.createElement("tbody");
  const properties = [
    ["顶点", "(1, 0)"],
    ["对称轴", "x=1"],
    ["增减性", "x<1 时递减；x>1 时递增"],
    ["最小值", "0"],
  ];
  const rows = properties.map(([name, value]) => {
    const row = document.createElement("tr");
    row.append(element("th", "", name), element("td", "", value));
    body.append(row);
    return row;
  });
  table.append(body);
  const status = element("p", "lesson04-status", "先从顶点 (1, 0) 开始观察。");
  const nextProperty = button("逐条观察性质", "lesson04-action lesson04-secondary");
  let activeIndex = 0;

  function update() {
    rows.forEach((row, index) => row.classList.toggle("is-active", index === activeIndex));
    const messages = [
      "顶点从 (0,0) 向右移动到 (1,0)。",
      "经过顶点的竖直直线 x=1 是对称轴。",
      "顶点左侧 x<1 时递减；右侧 x>1 时递增。",
      "开口向上，所以最小值是 0。",
    ];
    status.textContent = messages[activeIndex];
    graph.update({
      highlightedCurves: activeIndex === 2
        ? [{ a: 1, h: 1, xMin: -4, xMax: 4, color: "#b45f06" }]
        : [],
    });
  }

  nextProperty.addEventListener("click", () => {
    activeIndex = (activeIndex + 1) % properties.length;
    update();
  });
  workbench.append(
    formula("y=(x-1)^2", "复习函数 y 等于 x 减一的平方"),
    element("p", "lesson04-prompt", "图象相对 y=x² 向右平移 1 个单位。用表格依次读出它的顶点、对称轴和增减性。"),
    table, nextProperty, status,
  );
  addLegend(workbench);
  update();
}

function createChoiceGroup(field, legend, choices) {
  const group = document.createElement("fieldset");
  group.className = "lesson04-check-group";
  group.append(element("legend", "lesson04-check-label", legend));
  choices.forEach(({ value, label }) => {
    const choice = element("label", "lesson04-choice");
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "lesson04-" + field;
    input.value = value;
    input.dataset.lesson04Answer = field;
    choice.append(input, document.createTextNode(label));
    group.append(choice);
  });
  return group;
}

function createTextAnswer(field, label, placeholder) {
  const wrapper = element("label", "lesson04-text-answer");
  wrapper.append(element("span", "lesson04-check-label", label));
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = placeholder;
  input.dataset.lesson04Answer = field;
  wrapper.append(input);
  return wrapper;
}

function normaliseAnswer(value) {
  return String(value ?? "").replaceAll(" ", "").replaceAll("（", "(").replaceAll("）", ")");
}

function renderQuickCheck(root, _onStepChange, cleanup, random) {
  const { graph, workbench } = createLayout(root, {
    viewport: { xMin: -7, xMax: 7, yMin: -36, yMax: 36, yTickStep: 4 },
    curves: [], ariaLabel: "随机 y 等于 a 乘 x 减 h 平方的性质检测图象",
  }, cleanup);
  const questionNumber = element("p", "lesson04-check-number");
  const formulaHost = element("div", "lesson04-formula");
  const direction = createChoiceGroup("direction", "相对 y=ax²，图象如何左右平移？", [
    { value: "向左", label: "向左" }, { value: "向右", label: "向右" },
  ]);
  const units = createTextAnswer("units", "平移多少个单位？", "例如：3");
  const axis = createTextAnswer("axis", "对称轴是什么？", "例如：x=2");
  const vertex = createTextAnswer("vertex", "顶点坐标是什么？", "例如：(2, 0)");
  const monotonicity = createChoiceGroup("monotonicity", "增减性是哪一种？", [
    { value: "upward", label: "左减右增（开口向上）" }, { value: "downward", label: "左增右减（开口向下）" },
  ]);
  const check = button("检查答案");
  check.dataset.lesson04Check = "";
  const next = button("下一题（随机）", "lesson04-action lesson04-secondary");
  const feedback = element("p", "lesson04-feedback");
  feedback.dataset.lesson04Feedback = "";
  feedback.setAttribute("aria-live", "polite");
  let questionIndex = 0;
  let challenge;

  function chosen(field) {
    return workbench.querySelector('[data-lesson04-answer="' + field + '"]:checked')?.value ?? "";
  }

  function updateChallenge() {
    challenge = createLesson04QuickCheck(random);
    questionIndex += 1;
    questionNumber.textContent = "QUICK CHECK · " + String(questionIndex).padStart(2, "0");
    formulaHost.replaceChildren();
    renderFormula(formulaHost, challenge.formula, { ariaLabel: "题目函数 " + challenge.formula, displayMode: true });
    graph.update({ curves: [{ a: challenge.a, h: challenge.h, color: COLORS.shifted }] });
    workbench.querySelectorAll("[data-lesson04-answer]").forEach((input) => {
      if (input.type === "radio") input.checked = false;
      else input.value = "";
    });
    feedback.textContent = "先由 h 判断左右平移，再读出对称轴、顶点和增减性。";
  }

  check.addEventListener("click", () => {
    const checks = [
      ["平移方向", chosen("direction") === challenge.direction],
      ["平移单位", Number(workbench.querySelector('[data-lesson04-answer="units"]').value) === challenge.units],
      ["对称轴", normaliseAnswer(workbench.querySelector('[data-lesson04-answer="axis"]').value) === normaliseAnswer(challenge.axis)],
      ["顶点", normaliseAnswer(workbench.querySelector('[data-lesson04-answer="vertex"]').value) === normaliseAnswer("(" + challenge.vertex.x + ",0)")],
      ["增减性", chosen("monotonicity") === challenge.monotonicityChoice],
    ];
    const correct = checks.filter(([, result]) => result).length;
    feedback.textContent = correct + " / 5 项正确。" + checks.map(([label, result]) => label + "：" + (result ? "正确" : "再想一想")).join("；");
  });
  next.addEventListener("click", updateChallenge);
  workbench.append(
    questionNumber,
    element("p", "lesson04-prompt", "相对基准函数 y=ax²，独立判断这个函数的平移与图象性质。"),
    formulaHost, direction, units, axis, vertex, monotonicity, check, next, feedback,
  );
  updateChallenge();
}

const RENDERERS = Object.freeze([renderDiscovery, renderKLab, renderProperties, renderQuickCheck]);

export function renderLesson04(stage, { step = 1, onStepChange = () => {}, random = Math.random } = {}) {
  const safeStep = Math.min(RENDERERS.length, Math.max(1, Number(step) || 1));
  const cleanup = [];
  const root = createRoot(safeStep);
  RENDERERS[safeStep - 1](root, onStepChange, cleanup, random);
  appendNavigation(root, safeStep, onStepChange);
  stage.replaceChildren(root);
  return { destroy() { cleanup.forEach((dispose) => dispose()); } };
}
