import { createParabolaGraph } from "../graph/parabola-svg.js";
import { renderFormula } from "../formula.js";
import {
  LESSON02_X_VALUES,
  createPairChallenge,
  createPlotterState,
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

const STEP_TITLES = Object.freeze([
  "从一般式到 y=ax²",
  "描点法：亲手生成 y=x²",
  "连接九个点，得到抛物线",
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

function createRoot(step) {
  const root = element("section", "lesson02-step");
  const heading = element("header", "lesson02-heading");
  heading.append(
    element("p", "lesson02-kicker", "LESSON 02 · " + String(step).padStart(2, "0") + " / 12"),
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

  const next = button(step === 12 ? "回到本课开始" : "下一步");
  next.addEventListener("click", () => onStepChange(step === 12 ? 1 : step + 1));

  controls.append(previous, element("span", "lesson02-step-count", String(step) + " / 12"), next);
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

function animateProgress(graph, update, cleanup) {
  let active = true;
  let frame = null;
  const request = window.requestAnimationFrame ?? ((callback) => window.setTimeout(callback, 16));
  const cancel = window.cancelAnimationFrame ?? window.clearTimeout;
  cleanup.push(() => {
    active = false;
    if (frame !== null) cancel(frame);
  });

  let progress = 0;
  function advance() {
    if (!active) return;
    progress = Math.min(1, progress + 0.08);
    update(progress);
    if (progress < 1) frame = request(advance);
  }
  advance();
}

function renderBridge(root) {
  const reveal = element("div", "lesson02-reveal");
  reveal.hidden = true;
  reveal.append(
    formula("b\\to0,\\quad c\\to0", "令 b 和 c 等于 0"),
    formula("\\boxed{y=ax^2}", "二次函数 y 等于 a x 平方"),
    element("p", "lesson02-question", "今天的问题：y=ax² 的图象到底长什么样？"),
  );

  const start = button("从最简单的情况开始");
  start.addEventListener("click", () => {
    start.hidden = true;
    reveal.hidden = false;
  });

  root.append(
    element("p", "lesson02-prompt", "上一节课，我们认识了二次函数的一般形式。现在开始研究它的图象。"),
    formula("y=ax^2+bx+c", "二次函数一般式"),
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
    connect.hidden = !state.canConnect;
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
    if (state.connect()) onStepChange(3);
  });

  workbench.append(
    formula("y=x^2", "函数 y 等于 x 平方"),
    element("p", "lesson02-prompt", "请选择一个 x，读出代入、函数值和坐标。"),
    choices,
    progress,
    calculation,
    table,
    connect,
  );
  layout.append(graphPane, workbench);
  root.append(layout);
  update();
}

function renderConnect(root, onStepChange, cleanup) {
  const graph = addGraph(root, {
    curves: [{ a: 1, color: COLORS.positive }],
    points: LESSON02_X_VALUES.map((x) => [x, x * x]),
    curveProgress: 0,
    ariaLabel: "经过九个点的 y 等于 x 平方图象",
  }, cleanup);
  const panel = element("div", "lesson02-observe-panel");
  const name = element("p", "lesson02-parabola-name", "Parabola · 抛物线");
  name.hidden = true;
  const draw = button("用平滑曲线连接这些点");

  draw.addEventListener("click", () => {
    draw.disabled = true;
    animateProgress(graph, (progress) => {
      graph.update({ curveProgress: progress });
      if (progress === 1) name.hidden = false;
    }, cleanup);
  });

  panel.append(
    element("h3", "", "从“点”到“曲线”"),
    element("p", "", "九个点已经出现。点击后，观察标准函数图象如何被平滑地画出。"),
    draw,
    name,
    element("p", "lesson02-question", "观察这条曲线，你第一眼发现了什么？"),
  );
  root.append(panel);
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
  const motion = button("演示增减性", "lesson02-action lesson02-action-secondary");
  motion.addEventListener("click", () => {
    let x = -4;
    let active = true;
    let frame = null;
    const request = window.requestAnimationFrame ?? ((callback) => window.setTimeout(callback, 30));
    const cancel = window.cancelAnimationFrame ?? window.clearTimeout;
    cleanup.push(() => {
      active = false;
      if (frame !== null) cancel(frame);
    });
    function move() {
      if (!active) return;
      graph.update({ points: [[x, x * x], [x, -(x * x)]] });
      x += 0.2;
      if (x <= 4.001) frame = request(move);
    }
    move();
  });

  panel.append(
    element("h3", "", "先观察，再总结"),
    formula("y=x^2\\quad\\text{and}\\quad y=-x^2"),
    table,
    reveal,
    motion,
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

  const sliderLabel = element("p", "lesson02-slider-label");
  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = "-4";
  slider.max = "4";
  slider.step = "0.2";
  slider.value = "1";

  function updateSlider() {
    const a = Number(slider.value);
    if (a === 0) return;
    sliderLabel.replaceChildren(
      element("span", "", "探索："),
      formula("y=" + formatFunctionLatex(a).replace(/^y=/, ""), "当前系数", "lesson02-inline-formula"),
    );
    graph.update({ curves: [{ a, color: a > 0 ? COLORS.positive : COLORS.negative }] });
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
    sliderLabel,
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
  const challenge = createSingleChallenge();
  const feedback = element("p", "lesson02-status", "先根据解析式判断，再用图象验证。");
  const options = element("div", "lesson02-practice-options");
  const graphWrap = element("div", "lesson02-practice-graph");
  graphWrap.hidden = true;
  let graph = null;

  const opensUp = challenge.a > 0;
  const direction = button("开口向上", "lesson02-choice-button");
  const downward = button("开口向下", "lesson02-choice-button");
  [direction, downward].forEach((choice) => {
    choice.addEventListener("click", () => {
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
    if (!graph) {
      graph = createParabolaGraph(graphWrap, {
        curves: [{ a: challenge.a, color: challenge.a > 0 ? COLORS.positive : COLORS.negative }],
        ariaLabel: "随机二次函数图象",
      });
      cleanup.push(() => graph.destroy());
    }
    feedback.textContent = "验证：a=" + challenge.a + "；方向看符号，宽窄看 |a|=" + Math.abs(challenge.a) + "。";
  });

  root.append(
    element("h3", "", "Can You Read a Parabola?"),
    formula(formatFunctionLatex(challenge.a)),
    element("p", "lesson02-question", "只看解析式，图象开口向哪里？"),
    options,
    show,
    feedback,
    graphWrap,
  );
}

function renderPairPractice(root, onStepChange, cleanup) {
  const pair = createPairChallenge();
  const feedback = element("p", "lesson02-status", "谁的开口更宽？请比较 |a|。");
  const choices = element("div", "lesson02-practice-options");
  const graphWrap = element("div", "lesson02-practice-graph");
  graphWrap.hidden = true;
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
    }
  });

  root.append(
    element("h3", "", "Which One Is Wider?"),
    formula("A:\\ " + formatFunctionLatex(pair.a)),
    formula("B:\\ " + formatFunctionLatex(pair.b)),
    choices,
    show,
    feedback,
    graphWrap,
  );
}

function renderMisconception(root, onStepChange, cleanup) {
  const graph = addGraph(root, {
    curves: [
      { a: 1, color: COLORS.positive },
      { a: -1, color: COLORS.negative },
      { a: 2, color: COLORS.narrow },
      { a: 4, color: "#5a3f9d" },
    ],
    ariaLabel: "正负系数与绝对值比较的综合图象",
  }, cleanup);
  const panel = element("div", "lesson02-observe-panel");
  const rule = element("div", "lesson02-rule");
  rule.hidden = true;
  rule.append(formula("\\boxed{\\text{符号决定方向，绝对值决定宽窄}}"));
  let negativeFour = false;

  const toggle = button("切换 y=-4x²");
  toggle.addEventListener("click", () => {
    negativeFour = !negativeFour;
    graph.update({
      curves: [
        { a: 1, color: COLORS.positive },
        { a: -1, color: COLORS.negative },
        { a: 2, color: COLORS.narrow },
        { a: negativeFour ? -4 : 4, color: "#5a3f9d" },
      ],
    });
    toggle.textContent = negativeFour ? "切回 y=4x²" : "切换 y=-4x²";
  });
  const finalRule = button("Final Rule");
  finalRule.addEventListener("click", () => {
    rule.hidden = false;
  });

  panel.append(
    element("h3", "", "关键难点综合图"),
    element("p", "lesson02-question", "y=x² 与 y=-x² 的开口大小一样吗？为什么 y=4x² 比 y=2x² 更窄？"),
    toggle,
    finalRule,
    rule,
  );
  root.append(panel);
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
  renderConnect,
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
