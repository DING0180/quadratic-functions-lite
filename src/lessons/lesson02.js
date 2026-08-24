import { createParabolaGraph } from "../graph/parabola-svg.js";
import { renderFormula } from "../formula.js";
import "./lesson02.css";
import {
  LESSON02_X_VALUES,
  createPairChallenge,
  createCurveToggleState,
  createPlotterState,
  createQuickCheck,
  createSingleChallenge,
  formatFunctionLatex,
} from "./lesson02-state.js";

const COLORS = Object.freeze({
  positive: "#19735d",
  negative: "#cf684e",
  narrow: "#6652b8",
  wide: "#16718a",
  accent: "#d98935",
});

const COMPARISON_CURVES = Object.freeze([
  { id: "two", a: 2, latex: "y=2x^2", color: "#2563eb" },
  { id: "four", a: 4, latex: "y=4x^2", color: "#7c3aed" },
  { id: "one", a: 1, latex: "y=x^2", color: "#19735d" },
  { id: "negative-one", a: -1, latex: "y=-x^2", color: "#cf684e" },
  { id: "half", a: 0.5, latex: "y=\\frac{1}{2}x^2", color: "#16718a" },
  { id: "negative-half", a: -0.5, latex: "y=-\\frac{1}{2}x^2", color: "#d97706" },
]);

const STEP_TITLES = Object.freeze([
  "从一般式到 y=ax²",
  "描点并连线：生成 y=x²",
  "Your Turn：画 y=-x²",
  "对比 y=x² 与 y=-x²",
  "Your Turn：画 y=2x² 与 y=½x²",
  "三图比较：研究 |a|",
  "a 到底控制了什么？",
  "随机单函数判断",
  "随机双函数比较开口",
  "综合图象挑战",
  "小结与下一课桥接",
]);

function element(tag, className = "", text = "") {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function button(text, className = "lesson02-action") {
  const node = element("button", className, text);
  node.type = "button";
  return node;
}

function formula(latex, label = latex, className = "lesson02-formula") {
  const node = element("div", className);
  renderFormula(node, latex, { ariaLabel: label, displayMode: true });
  return node;
}

function formulaTerm(latex, label = latex, className = "") {
  const node = element("span", className);
  renderFormula(node, latex, { ariaLabel: label });
  return node;
}

function createRoot(step) {
  const root = element("section", "lesson02-step");
  const heading = element("header", "lesson02-heading");
  heading.append(
    element("p", "lesson02-kicker", "LESSON 02 · " + String(step).padStart(2, "0") + " / " + String(RENDERERS.length)),
    element("h2", "lesson02-title", STEP_TITLES[step - 1]),
  );
  root.append(heading);
  return root;
}

function appendNavigation(root, step, onStepChange) {
  const controls = element("nav", "lesson02-step-controls");
  controls.setAttribute("aria-label", "Lesson 2 步骤导航");

  const previous = button("上一步", "lesson02-action lesson02-action-secondary");
  previous.disabled = step === 1;
  previous.addEventListener("click", () => onStepChange(Math.max(1, step - 1)));

  const next = button(step === RENDERERS.length ? "回到本课开始" : "下一步");
  next.addEventListener("click", () => onStepChange(step === RENDERERS.length ? 1 : step + 1));

  controls.append(previous, element("span", "lesson02-step-count", String(step) + " / " + String(RENDERERS.length)), next);
  root.append(controls);
}

function addGraph(root, options, cleanup) {
  const panel = element("div", "lesson02-graph-panel");
  const host = element("div", "lesson02-graph-host");
  panel.append(host);
  root.append(panel);

  const graph = createParabolaGraph(host, options);
  cleanup.push(() => graph.destroy());
  return graph;
}

function animateProgress(graph, update, cleanup, duration = 1100) {
  let active = true;
  let frame = null;
  const request = window.requestAnimationFrame ?? ((callback) => window.setTimeout(callback, 16));
  const cancel = window.cancelAnimationFrame ?? window.clearTimeout;
  cleanup.push(() => {
    active = false;
    if (frame !== null) cancel(frame);
  });

  let startedAt = null;
  function advance(timestamp) {
    if (!active) return;
    const now = typeof timestamp === "number" ? timestamp : Date.now();
    if (startedAt === null) startedAt = now;
    const progress = Math.min(1, (now - startedAt) / duration);
    update(progress);
    if (progress < 1) frame = request(advance);
  }
  frame = request(advance);
}

function renderBridge(root, onStepChange, cleanup) {
  const transformation = element("div", "lesson02-equation-transform");
  transformation.append(
    formulaTerm("y=ax^2", "保留的主项 y 等于 a x 平方", "lesson02-equation-base"),
    formulaTerm("+bx", "消退的 b x 项", "lesson02-vanishing-term"),
    formulaTerm("+c", "消退的常数项 c", "lesson02-vanishing-term"),
  );
  const reveal = element("div", "lesson02-reveal");
  reveal.hidden = true;
  reveal.append(
    formula("b\\to0,\\quad c\\to0", "令 b 和 c 等于 0"),
    formula("\\boxed{y=ax^2}", "留下的二次函数 y 等于 a x 平方"),
    element("p", "lesson02-question", "今天的问题：y=ax² 的图象到底长什么样？"),
  );

  const start = button("开始化简动画");
  let timer = null;

  function play() {
    window.clearTimeout(timer);
    reveal.hidden = true;
    transformation.classList.remove("is-complete", "is-transforming");
    void transformation.offsetWidth;
    transformation.classList.add("is-transforming");
    start.disabled = true;
    timer = window.setTimeout(() => {
      transformation.classList.add("is-complete");
      reveal.hidden = false;
      start.disabled = false;
      start.textContent = "再看一次化简动画";
    }, 900);
  }

  start.addEventListener("click", play);
  cleanup.push(() => window.clearTimeout(timer));

  root.append(
    element("p", "lesson02-prompt", "上一节课，我们认识了二次函数的一般形式。现在开始研究它的图象。"),
    transformation,
    element("p", "lesson02-prompt", "一个一般二次函数有三个参数。我们应该从哪里开始？"),
    start,
    reveal,
  );
}

function renderPlotter(root, onStepChange, cleanup) {
  const state = createPlotterState();
  const layout = element("div", "lesson02-two-column");
  const graphPane = element("div", "lesson02-graph-panel");
  const graphHost = element("div", "lesson02-graph-host");
  graphPane.append(graphHost);
  const graph = createParabolaGraph(graphHost, {
    curves: [{ a: 1, color: COLORS.positive }],
    points: [],
    curveProgress: 0,
    ariaLabel: "y 等于 x 平方的描点坐标系",
  });
  cleanup.push(() => graph.destroy());

  const workbench = element("aside", "lesson02-workbench");
  const choices = element("div", "lesson02-choice-grid");
  const progress = element("p", "lesson02-progress");
  const calculation = element("div", "lesson02-calculation");
  const table = document.createElement("table");
  table.className = "lesson02-data-table";
  const head = document.createElement("thead");
  head.innerHTML = "<tr><th>x</th><th>y=x²</th><th>点</th></tr>";
  const body = document.createElement("tbody");
  table.append(head, body);
  const connect = button("用平滑曲线连接这些点");
  connect.hidden = true;
  const parabolaName = element("p", "lesson02-parabola-name", "Parabola · 抛物线");
  parabolaName.hidden = true;
  const connectionStatus = element("p", "lesson02-status", "先用描点法找到九个坐标。");

  function update() {
    graph.update({ points: state.points });
    progress.textContent = "Points plotted: " + state.count + " / 9";
    body.replaceChildren();
    state.points.forEach((point) => {
      const row = document.createElement("tr");
      [String(point.x), String(point.y), "(" + point.x + ", " + point.y + ")"].forEach((text) => {
        row.append(element("td", "", text));
      });
      body.append(row);
    });
    choices.querySelectorAll("button").forEach((choice) => {
      const used = state.points.some((point) => point.x === Number(choice.dataset.x));
      choice.disabled = used;
      choice.classList.toggle("is-plotted", used);
    });
    connect.hidden = state.count !== LESSON02_X_VALUES.length;
    connect.disabled = state.connected;
  }

  LESSON02_X_VALUES.forEach((x) => {
    const choice = button(String(x), "lesson02-point-choice");
    choice.dataset.x = String(x);
    choice.addEventListener("click", () => {
      if (!state.plot(x)) return;
      calculation.replaceChildren(
        formula("y=(" + x + ")^2=" + (x * x), "x 等于 " + x + " 时的函数值", "lesson02-inline-formula"),
        formula("\\boxed{(" + x + "," + (x * x) + ")}", "描出的点", "lesson02-inline-formula"),
      );
      update();
    });
    choices.append(choice);
  });

  connect.addEventListener("click", () => {
    if (!state.connect()) return;
    connect.disabled = true;
    connect.textContent = "正在平滑连接…";
    connectionStatus.textContent = "观察：九个点被同一条平滑曲线依次穿过。";
    animateProgress(graph, (progress) => {
      graph.update({ points: state.points, curveProgress: progress });
      if (progress === 1) {
        connect.textContent = "已连接";
        parabolaName.hidden = false;
        connectionStatus.textContent = "这条平滑曲线叫作抛物线。它经过刚才描出的每一个点。";
      }
    }, cleanup, 1500);
  });

  workbench.append(
    formula("y=x^2", "函数 y 等于 x 平方"),
    element("p", "lesson02-prompt", "请选择一个 x，读出代入、函数值和坐标。"),
    choices,
    progress,
    calculation,
    table,
    connect,
    parabolaName,
    connectionStatus,
  );
  layout.append(graphPane, workbench);
  root.append(layout);
  update();
}

function renderPaper(root, variant, cleanup) {
  const data = variant === "width"
    ? {
      latex: "y=2x^2\\quad\\text{and}\\quad y=\\frac{1}{2}x^2",
      copy: "请在草稿纸上分别画出这两个函数的图象。",
    }
    : {
      latex: "y=-x^2",
      copy: "请在草稿纸上用描点法画出 y=-x² 的图象。",
    };
  const timer = element("p", "lesson02-timer", "90 s · 教师自行控制");
  const start = button("开始作图");
  let interval = null;

  start.addEventListener("click", () => {
    let seconds = 90;
    start.disabled = true;
    timer.textContent = seconds + " s · 请在草稿纸上作图";
    interval = window.setInterval(() => {
      seconds = Math.max(0, seconds - 1);
      timer.textContent = seconds + " s · 教师自行控制";
    }, 1000);
  });
  cleanup.push(() => {
    if (interval !== null) window.clearInterval(interval);
  });

  root.append(
    element("p", "lesson02-kicker", "YOUR TURN · DRAW ON PAPER"),
    formula(data.latex),
    element("p", "lesson02-prompt", data.copy),
    start,
    timer,
  );
}

function renderSignCompare(root, onStepChange, cleanup) {
  const layout = element("div", "lesson02-two-column");
  const graphPane = element("div", "lesson02-graph-panel");
  const host = element("div", "lesson02-graph-host");
  graphPane.append(host);
  const graph = createParabolaGraph(host, {
    curves: [
      { a: 1, color: COLORS.positive },
      { a: -1, color: COLORS.negative },
    ],
    points: [],
    ariaLabel: "y 等于 x 平方与 y 等于负 x 平方的对比图象",
  });
  cleanup.push(() => graph.destroy());

  const panel = element("aside", "lesson02-observe-panel");
  const rows = [
    ["开口方向", "向上", "向下"],
    ["顶点", "(0,0)", "(0,0)"],
    ["对称轴", "x=0", "x=0"],
    ["x<0 时", "随 x 增大而减小", "随 x 增大而增大"],
    ["x>0 时", "随 x 增大而增大", "随 x 增大而减小"],
    ["最值", "最小值 0", "最大值 0"],
  ];
  const table = document.createElement("table");
  table.className = "lesson02-property-table";
  table.innerHTML = "<thead><tr><th>性质</th><th>y=x²</th><th>y=-x²</th></tr></thead>";
  const body = document.createElement("tbody");
  table.append(body);
  let revealed = 0;

  function updateTable() {
    body.replaceChildren();
    rows.forEach((row, index) => {
      const tr = document.createElement("tr");
      row.forEach((text, cellIndex) => tr.append(element(cellIndex === 0 ? "th" : "td", "", index < revealed || cellIndex === 0 ? text : "?")));
      body.append(tr);
    });
  }

  const reveal = button("逐项揭晓");
  reveal.addEventListener("click", () => {
    revealed = Math.min(rows.length, revealed + 1);
    updateTable();
  });
  const phases = [
    { a: 1, from: -4, to: 0, color: COLORS.positive, relation: "y 随 x 的增大而减小", text: "观察 y=x² 的左侧：x 增大，y 减小。" },
    { a: 1, from: 0, to: 4, color: COLORS.positive, relation: "y 随 x 的增大而增大", text: "观察 y=x² 的右侧：x 增大，y 增大。" },
    { a: -1, from: -4, to: 0, color: COLORS.negative, relation: "y 随 x 的增大而增大", text: "观察 y=−x² 的左侧：x 增大，y 增大。" },
    { a: -1, from: 0, to: 4, color: COLORS.negative, relation: "y 随 x 的增大而减小", text: "观察 y=−x² 的右侧：x 增大，y 减小。" },
  ];
  const motionStatus = element("p", "lesson02-motion-status", "点击后，用一个加粗观察点分段追踪 x 增大时 y 的变化。");
  motionStatus.setAttribute("aria-live", "polite");
  const motionReadout = element("div", "lesson02-motion-readout");
  motionReadout.setAttribute("aria-live", "polite");
  const motion = button("分段演示增减性", "lesson02-action lesson02-action-secondary");
  let animationActive = true;
  let frame = null;
  let pause = null;
  const request = window.requestAnimationFrame ?? ((callback) => window.setTimeout(callback, 16));
  const cancel = window.cancelAnimationFrame ?? window.clearTimeout;
  cleanup.push(() => {
    animationActive = false;
    if (frame !== null) cancel(frame);
    if (pause !== null) window.clearTimeout(pause);
  });

  function formatValue(value) {
    return String(Math.round(value * 10) / 10).replace("-", "−");
  }

  function updateMotionEvidence(phase, x) {
    const startY = phase.a * phase.from * phase.from;
    const y = phase.a * x * x;
    const endY = phase.a * phase.to * phase.to;
    const xDirection = phase.to > phase.from ? "增大" : "减小";
    const yDirection = endY > startY ? "增大" : "减小";
    motionReadout.replaceChildren(
      element("p", "", "x：" + formatValue(phase.from) + " → " + formatValue(phase.to) + "（" + xDirection + "）"),
      element("p", "", "y：" + formatValue(startY) + " → " + formatValue(endY) + "（" + yDirection + "）"),
      element("p", "lesson02-motion-current", "当前观察点：(" + formatValue(x) + "，" + formatValue(y) + ")"),
      element("p", "lesson02-motion-conclusion", phase.relation),
    );
    graph.update({
      points: [
        { x: phase.from, y: startY, radius: 6, color: phase.color },
        { x, y, radius: 9, color: phase.color },
      ],
      arrows: [
        { from: { x: phase.from, y: 0 }, to: { x, y: 0 }, color: phase.color, label: "x " + xDirection },
        { from: { x: 0, y: startY }, to: { x: 0, y }, color: phase.color, label: "y " + yDirection },
      ],
      labels: [
        { x: phase.from, y: startY, text: "(" + formatValue(phase.from) + "，" + formatValue(startY) + ")" },
        { x, y, text: "(" + formatValue(x) + "，" + formatValue(y) + ")" },
      ],
    });
  }

  updateMotionEvidence(phases[0], phases[0].from);

  motion.addEventListener("click", () => {
    if (!animationActive) return;
    motion.disabled = true;
    motion.textContent = "演示进行中…";
    let phaseIndex = 0;

    function runPhase() {
      if (!animationActive) return;
      const phase = phases[phaseIndex];
      motionStatus.textContent = phase.text + " 请同时看坐标轴上的两支箭头和下面的数值。";
      let startedAt = null;

      function advance(timestamp) {
        if (!animationActive) return;
        const now = typeof timestamp === "number" ? timestamp : Date.now();
        if (startedAt === null) startedAt = now;
        const progress = Math.min(1, (now - startedAt) / 4200);
        const x = phase.from + (phase.to - phase.from) * progress;
        updateMotionEvidence(phase, x);
        if (progress < 1) {
          frame = request(advance);
          return;
        }
        phaseIndex += 1;
        if (phaseIndex < phases.length) {
          pause = window.setTimeout(runPhase, 850);
          return;
        }
        motion.disabled = false;
        motion.textContent = "再演示一次";
        motionStatus.textContent = "演示完成：同一条曲线在顶点左、右两侧的增减性不同。";
      }

      frame = request(advance);
    }
    runPhase();
  });

  panel.append(
    element("h3", "", "先观察，再总结"),
    formula("y=x^2\\quad\\text{and}\\quad y=-x^2"),
    table,
    reveal,
    motion,
    motionStatus,
    motionReadout,
  );
  layout.append(graphPane, panel);
  root.append(layout);
  updateTable();
}

function renderMagnitude(root, onStepChange, cleanup) {
  const layout = element("div", "lesson02-two-column");
  const graphPane = element("div", "lesson02-graph-panel");
  const host = element("div", "lesson02-graph-host");
  graphPane.append(host);
  const graph = createParabolaGraph(host, {
    curves: [
      { a: 0.5, color: COLORS.wide },
      { a: 1, color: COLORS.positive },
      { a: 2, color: COLORS.narrow },
    ],
    ariaLabel: "半 x 平方、x 平方和二 x 平方的对比图象",
  });
  cleanup.push(() => graph.destroy());

  const panel = element("aside", "lesson02-observe-panel");
  const rule = element("div", "lesson02-rule");
  rule.hidden = true;
  rule.append(formula("\\boxed{|a|\\text{ 越大，开口越窄； }|a|\\text{ 越小，开口越宽}}"));

  const reveal = button("Reveal the Rule");
  reveal.addEventListener("click", () => {
    rule.hidden = false;
  });

  const sliderReadout = element("div", "lesson02-slider-readout");
  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = "-5";
  slider.max = "5";
  slider.step = "0.2";
  slider.value = "1";

  function updateSlider() {
    const a = Number(slider.value);
    sliderReadout.replaceChildren(
      element("p", "lesson02-slider-value", "当前 a = " + a),
      formula(formatFunctionLatex(a), "当前函数 y 等于 a x 平方", "lesson02-slider-formula"),
    );
    if (a === 0) {
      sliderReadout.append(element("p", "lesson02-slider-boundary", "边界：y=0，已不是二次函数。"));
    }
    graph.update({ curves: [{ a, color: a > 0 ? COLORS.positive : a < 0 ? COLORS.negative : "#7b8e87" }] });
  }
  slider.addEventListener("input", updateSlider);

  panel.append(
    element("h3", "", "三图比较：研究 |a|"),
    formula("y=\\frac12x^2,\\quad y=x^2,\\quad y=2x^2"),
    element("p", "lesson02-question", "三条图象的开口方向相同吗？顶点相同吗？哪一条最窄？"),
    reveal,
    rule,
    element("h4", "", "只用一个参数继续探索"),
    slider,
    sliderReadout,
  );
  layout.append(graphPane, panel);
  root.append(layout);
  updateSlider();
}

function renderSummary(root) {
  const cards = [
    ["Sign", "a>0：开口向上，有最小值；a<0：开口向下，有最大值。"],
    ["Magnitude", "|a| 越大，开口越窄；|a| 越小，开口越宽。"],
    ["Fixed", "无论 a 如何改变，顶点始终为 (0,0)，对称轴始终为 x=0。"],
    ["Monotonicity", "a>0 左减右增；a<0 左增右减。"],
  ];
  const wrap = element("div", "lesson02-summary-cards");
  const reveal = button("Reveal 下一条");
  let count = 0;

  function update() {
    wrap.replaceChildren();
    cards.forEach((card, index) => {
      const node = element("article", "lesson02-summary-card");
      node.append(
        element("h3", "", card[0]),
        element("p", "", index < count ? card[1] : "点击 Reveal 后归纳这一条。"),
      );
      wrap.append(node);
    });
    reveal.disabled = count === cards.length;
  }
  reveal.addEventListener("click", () => {
    count = Math.min(cards.length, count + 1);
    update();
  });

  root.append(element("p", "lesson02-prompt", "把刚才的观察压缩成一张可复习的控制面板。"), formula("\\boxed{y=ax^2}"), wrap, reveal);
  update();
}

function renderSinglePractice(root, onStepChange, cleanup) {
  const quickCheck = createQuickCheck(createSingleChallenge);
  let challenge = null;
  const number = element("p", "lesson02-quick-check-number");
  const question = element("div", "lesson02-quick-check-question");
  const feedback = element("p", "lesson02-status", "先根据解析式判断，再用图象验证。");
  const options = element("div", "lesson02-practice-options");
  const graphWrap = element("div", "lesson02-practice-graph");
  graphWrap.hidden = true;
  const graphPlaceholder = element("p", "lesson02-practice-graph-placeholder", "点击“Check with Graph”后，在这里验证你的判断。\n图像会保持在右侧，不需要向下滚动。");
  const graphPane = element("section", "lesson02-practice-graph-pane");
  graphPane.append(element("h3", "", "图像验证"), graphPlaceholder, graphWrap);
  let graph = null;

  const direction = button("开口向上", "lesson02-choice-button");
  const downward = button("开口向下", "lesson02-choice-button");
  [direction, downward].forEach((choice) => {
    choice.addEventListener("click", () => {
      const opensUp = challenge.a > 0;
      const correct = choice === direction ? opensUp : !opensUp;
      challenge.answerWith(choice.textContent);
      feedback.textContent = correct ? "判断正确。接着用图象验证。" : "先保留你的判断，点击图象验证。";
      direction.disabled = true;
      downward.disabled = true;
    });
  });
  options.append(direction, downward);

  const show = button("Check with Graph");
  show.addEventListener("click", () => {
    challenge.showGraph();
    graphWrap.hidden = false;
    graphPlaceholder.hidden = true;
    if (!graph) {
      graph = createParabolaGraph(graphWrap, {
        curves: [{ a: challenge.a, color: challenge.a > 0 ? COLORS.positive : COLORS.negative }],
        ariaLabel: "随机二次函数图象",
      });
      cleanup.push(() => graph.destroy());
    } else {
      graph.update({ curves: [{ a: challenge.a, color: challenge.a > 0 ? COLORS.positive : COLORS.negative }] });
    }
    feedback.textContent = "验证：a=" + challenge.a + "；方向看符号，宽窄看 |a|=" + Math.abs(challenge.a) + "。";
  });

  const next = button("下一题（随机）", "lesson02-action lesson02-action-secondary");
  function loadNextChallenge() {
    challenge = quickCheck.next();
    number.textContent = "Quick Check · 第 " + quickCheck.count + " 题";
    question.replaceChildren(formula(formatFunctionLatex(challenge.a)));
    direction.disabled = false;
    downward.disabled = false;
    graphWrap.hidden = true;
    graphPlaceholder.hidden = false;
    feedback.textContent = "先根据解析式判断，再用图象验证。";
  }
  next.addEventListener("click", loadNextChallenge);

  const questionPane = element("section", "lesson02-practice-question-pane");
  questionPane.append(
    element("h3", "", "Can You Read a Parabola?"),
    number,
    question,
    element("p", "lesson02-question", "只看解析式，图象开口向哪里？"),
    options,
    show,
    feedback,
    next,
  );
  const layout = element("div", "lesson02-practice-layout");
  layout.append(questionPane, graphPane);
  root.append(layout);
  loadNextChallenge();
}

function renderPairPractice(root, onStepChange, cleanup) {
  const quickCheck = createQuickCheck(createPairChallenge);
  let pair = null;
  const number = element("p", "lesson02-quick-check-number");
  const question = element("div", "lesson02-quick-check-question");
  const feedback = element("p", "lesson02-status", "谁的开口更宽？请比较 |a|。");
  const choices = element("div", "lesson02-practice-options");
  const graphWrap = element("div", "lesson02-practice-graph");
  graphWrap.hidden = true;
  const graphPlaceholder = element("p", "lesson02-practice-graph-placeholder", "先比较两个 |a| 的大小，再点击按钮在右侧坐标系验证。\n图像区域始终留在本页右半部分。");
  const graphPane = element("section", "lesson02-practice-graph-pane");
  graphPane.append(element("h3", "", "图像验证"), graphPlaceholder, graphWrap);
  let graph = null;

  [
    ["a", "函数 A"],
    ["b", "函数 B"],
    ["same", "一样大"],
  ].forEach(([value, label]) => {
    const choice = button(label, "lesson02-choice-button");
    choice.addEventListener("click", () => {
      feedback.textContent = value === pair.correctAnswer
        ? "正确。比较开口宽窄，要比较 |a|。"
        : "再想一想：|a| 越小，开口越宽。";
    });
    choices.append(choice);
  });

  const show = button("Check with Graph");
  show.addEventListener("click", () => {
    pair.showGraph();
    graphWrap.hidden = false;
    graphPlaceholder.hidden = true;
    if (!graph) {
      graph = createParabolaGraph(graphWrap, {
        curves: [
          { a: pair.a, color: COLORS.positive },
          { a: pair.b, color: COLORS.negative },
        ],
        labels: [
          { x: -3.5, y: pair.a * 12.25, text: "A" },
          { x: 3.2, y: pair.b * 10.24, text: "B" },
        ],
        ariaLabel: "两条随机二次函数图象的比较",
      });
      cleanup.push(() => graph.destroy());
    } else {
      graph.update({
        curves: [
          { a: pair.a, color: COLORS.positive },
          { a: pair.b, color: COLORS.negative },
        ],
        labels: [
          { x: -3.5, y: pair.a * 12.25, text: "A" },
          { x: 3.2, y: pair.b * 10.24, text: "B" },
        ],
      });
    }
  });

  const next = button("下一题（随机）", "lesson02-action lesson02-action-secondary");
  function loadNextChallenge() {
    pair = quickCheck.next();
    number.textContent = "Quick Check · 第 " + quickCheck.count + " 题";
    question.replaceChildren(
      formula("A:\\ " + formatFunctionLatex(pair.a)),
      formula("B:\\ " + formatFunctionLatex(pair.b)),
    );
    graphWrap.hidden = true;
    graphPlaceholder.hidden = false;
    feedback.textContent = "谁的开口更宽？请比较 |a|。";
  }
  next.addEventListener("click", loadNextChallenge);

  const questionPane = element("section", "lesson02-practice-question-pane");
  questionPane.append(
    element("h3", "", "Which One Is Wider?"),
    number,
    question,
    choices,
    show,
    feedback,
    next,
  );
  const layout = element("div", "lesson02-practice-layout");
  layout.append(questionPane, graphPane);
  root.append(layout);
  loadNextChallenge();
}

function renderMisconception(root, onStepChange, cleanup) {
  const layout = element("div", "lesson02-comparison-layout");
  const graphPane = element("section", "lesson02-comparison-graph lesson02-graph-panel");
  const graphHost = element("div", "lesson02-graph-host");
  graphPane.append(graphHost);
  const graph = createParabolaGraph(graphHost, {
    curves: [],
    ariaLabel: "正负系数与绝对值比较的综合图象",
  });
  cleanup.push(() => graph.destroy());
  const panel = element("section", "lesson02-comparison-controls lesson02-observe-panel");
  const selection = createCurveToggleState(COMPARISON_CURVES.map((curve) => curve.id));
  const toggles = element("div", "lesson02-curve-toggles");
  const status = element("p", "lesson02-curve-status", "点击一个函数，把它画到同一坐标系；再次点击可隐藏它。");

  function updateComparison() {
    const selected = selection.selectedIds;
    graph.update({
      curves: COMPARISON_CURVES
        .filter((curve) => selected.includes(curve.id))
        .map(({ a, color }) => ({ a, color })),
    });
    COMPARISON_CURVES.forEach((curve) => {
      const toggle = toggles.querySelector('[data-curve-id="' + curve.id + '"]');
      const active = selected.includes(curve.id);
      toggle.classList.toggle("is-active", active);
      toggle.setAttribute("aria-pressed", String(active));
    });
    status.textContent = selected.length === 0
      ? "点击一个函数，把它画到同一坐标系；再次点击可隐藏它。"
      : "当前显示 " + selected.length + " 条曲线：比较 a 的正负决定方向，|a| 决定开口宽窄。";
  }

  COMPARISON_CURVES.forEach((curve) => {
    const toggle = button("", "lesson02-curve-toggle");
    toggle.dataset.curveId = curve.id;
    toggle.style.setProperty("--curve-color", curve.color);
    toggle.setAttribute("aria-pressed", "false");
    toggle.append(element("span", "lesson02-curve-swatch"));
    const label = element("span", "lesson02-curve-label");
    renderFormula(label, curve.latex, { ariaLabel: curve.latex });
    toggle.append(label);
    toggle.addEventListener("click", () => {
      selection.toggle(curve.id);
      updateComparison();
    });
    toggles.append(toggle);
  });

  panel.append(
    element("h3", "", "点选函数，比较 a 的正负与大小"),
    element("p", "lesson02-question", "把多条曲线放在同一坐标系中：哪一些向上开口？哪一些向下开口？同向时，谁更窄？"),
    toggles,
    status,
  );
  layout.append(panel, graphPane);
  root.append(layout);
  updateComparison();
}

function renderBridgeOut(root, onStepChange, cleanup) {
  const graph = addGraph(root, {
    curves: [{ a: 1, color: COLORS.positive }],
    ariaLabel: "标准抛物线与上移后的抛物线",
  }, cleanup);
  const next = element("div", "lesson02-rule");
  next.hidden = true;
  next.append(formula("\\boxed{y=ax^2+k}", "下一课 y 等于 a x 平方加 k"));
  const reveal = button("把图象整体向上移动");
  reveal.addEventListener("click", () => {
    graph.update({
      curves: [
        { a: 1, k: 0, color: "#aac9c0" },
        { a: 1, k: 2, color: COLORS.positive },
      ],
      labels: [{ x: 2.2, y: 6.8, text: "k=2" }],
    });
    reveal.disabled = true;
    next.hidden = false;
  });

  root.append(
    element("p", "lesson02-prompt", "到目前为止，无论怎么改变 a，顶点始终都在原点。"),
    formula("y=ax^2"),
    element("p", "lesson02-question", "如果我想保持抛物线形状不变，只把它整体向上或向下移动，该怎么办？"),
    formula("y=ax^2+\\ ?"),
    reveal,
    next,
  );
}

const RENDERERS = Object.freeze([
  renderBridge,
  renderPlotter,
  (root, onStepChange, cleanup) => renderPaper(root, "negative", cleanup),
  renderSignCompare,
  (root, onStepChange, cleanup) => renderPaper(root, "width", cleanup),
  renderMagnitude,
  renderSummary,
  renderSinglePractice,
  renderPairPractice,
  renderMisconception,
  renderBridgeOut,
]);

export function renderLesson02(stage, { step = 1, onStepChange }) {
  const safeStep = Math.min(RENDERERS.length, Math.max(1, Number(step) || 1));
  const cleanup = [];
  const root = createRoot(safeStep);
  RENDERERS[safeStep - 1](root, onStepChange, cleanup);
  appendNavigation(root, safeStep, onStepChange);
  stage.replaceChildren(root);

  return {
    destroy() {
      cleanup.forEach((dispose) => dispose());
    },
  };
}
