import { renderFormula } from "../formula.js";
import "./lesson01.css";

export const LESSON01_STEP_TITLES = Object.freeze([
  "Bridge In：一次函数 → 二次函数",
  "二次函数一般式",
  "二次项、一次项和常数项",
  "Formula Scanner：项与系数",
  "Quick Check：它是不是二次函数？",
  "例题与参数条件",
  "从实际问题建立二次函数",
  "Summary + Bridge Out",
]);

const PRACTICE = Object.freeze([
  { latex: "y=2x^2-3x+1", label: "y=2x²−3x+1", answer: "是。最高次数是 2，且二次项系数 2≠0。" },
  { latex: "y=(x+2)^2-x^2", label: "y=(x+2)²−x²", answer: "不是。整理后 y=4x+4，最高次数只有 1。" },
  { latex: "y=0x^2+5x-1", label: "y=0x²+5x−1", answer: "不是。二次项系数为 0，所以它实际上是一次函数。" },
]);

function element(tag, className = "", text = "") {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function button(text, className = "lesson01-action") {
  const node = element("button", className, text);
  node.type = "button";
  return node;
}

function formula(latex, label, className = "lesson01-formula") {
  const node = element("div", className);
  renderFormula(node, latex, { ariaLabel: label, displayMode: true });
  return node;
}

function createRoot(step) {
  const root = element("section", "lesson01-step");
  const heading = element("header", "lesson01-heading");
  heading.append(
    element("p", "lesson01-kicker", "LESSON 01 · " + String(step).padStart(2, "0") + " / 08"),
    element("h2", "lesson01-title", LESSON01_STEP_TITLES[step - 1]),
  );
  root.append(heading);
  return root;
}

function appendNavigation(root, step, onStepChange) {
  const navigation = element("nav", "lesson01-step-controls");
  navigation.setAttribute("aria-label", "Lesson 01 步骤导航");
  const previous = button("上一步", "lesson01-action lesson01-secondary");
  previous.disabled = step === 1;
  previous.addEventListener("click", () => onStepChange(Math.max(1, step - 1)));
  const next = button(step === 8 ? "回到本课开始" : "下一步");
  next.addEventListener("click", () => onStepChange(step === 8 ? 1 : step + 1));
  navigation.append(previous, element("span", "lesson01-step-count", step + " / 08"), next);
  root.append(navigation);
}

function renderBridge(root) {
  const cards = element("div", "lesson01-bridge-grid");
  const linear = element("article", "lesson01-card lesson01-linear-card");
  linear.append(element("p", "lesson01-card-label", "已学过 / Linear"), formula("y=kx+b", "一次函数 y=kx+b"), element("p", "", "看自变量 x 的最高次数：1"));
  const quadratic = element("article", "lesson01-card lesson01-quadratic-card");
  quadratic.append(element("p", "lesson01-card-label", "今天 / Quadratic"), formula("y=ax^2+bx+c", "二次函数 y=ax²+bx+c"), element("p", "", "看自变量 x 的最高次数：2"));
  cards.append(linear, element("div", "lesson01-arrow", "一次 → 二次"), quadratic);
  const answer = element("p", "lesson01-reveal"); answer.dataset.lesson01BridgeAnswer = ""; answer.hidden = true;
  const reveal = button("Reveal：为什么叫二次函数？"); reveal.dataset.lesson01BridgeReveal = "";
  reveal.addEventListener("click", () => {
    answer.textContent = "函数名称来自自变量 x 的最高次数：最高次数是 2，所以称为二次函数。";
    answer.hidden = false;
  });
  root.append(element("p", "lesson01-prompt", "从一次函数走向二次函数，变化的关键不是系数，而是 x 的最高次数。"), cards, reveal, answer);
}

function renderGeneral(root) {
  const terms = [
    { id: "quadratic", text: "ax²", latex: "ax^2", explanation: "ax² 是二次项；a 是二次项系数，并且 a≠0。" },
    { id: "linear", text: "+bx", latex: "+bx", explanation: "bx 是一次项；b 是一次项系数。" },
    { id: "constant", text: "+c", latex: "+c", explanation: "c 是常数项；它可以等于 0。" },
  ];
  const formulaLine = element("div", "lesson01-general-formula");
  const controls = element("div", "lesson01-term-controls");
  const explanation = element("p", "lesson01-reveal"); explanation.dataset.lesson01TermExplanation = "";
  let selected = "quadratic";
  function render() {
    formulaLine.replaceChildren(...terms.map((term) => {
      const part = formula(term.latex, term.text, "lesson01-formula-part is-" + term.id + (selected === term.id ? " is-active" : ""));
      return part;
    }));
    controls.replaceChildren(...terms.map((term) => {
      const control = button(term.text, "lesson01-action lesson01-secondary");
      control.dataset.lesson01Term = term.id;
      control.setAttribute("aria-pressed", String(selected === term.id));
      control.addEventListener("click", () => { selected = term.id; render(); });
      return control;
    }));
    explanation.textContent = terms.find((term) => term.id === selected).explanation;
  }
  render();
  root.append(element("p", "lesson01-prompt", "一般地，形如下面的式子（其中 a、b、c 为常数，a≠0）的函数叫做二次函数。点击一项，让它和对应系数一起亮起来。"), formulaLine, controls, explanation);
}

function renderTerms(root) {
  const grid = element("div", "lesson01-term-grid");
  [
    ["ax^2", "ax²", "二次项", "a", "二次项系数", "quadratic"],
    ["bx", "bx", "一次项", "b", "一次项系数", "linear"],
    ["c", "c", "常数项", "", "不含字母 x", "constant"],
  ].forEach(([latex, label, term, coefficient, note, tone]) => {
    const card = element("article", "lesson01-card lesson01-term-card is-" + tone);
    card.append(formula(latex, label), element("h3", "", term), coefficient ? element("p", "lesson01-coefficient", coefficient + " · " + note) : element("p", "", note));
    grid.append(card);
  });
  root.append(element("p", "lesson01-prompt", "“项”是式子中完整的一部分；“系数”是项前面的数字或字母。不要把它们混在一起。"), grid);
}

function renderScanner(root) {
  const choices = [
    ["quadratic", "ax²", "二次项 ax²；它的系数是 a。"],
    ["linear", "bx", "一次项 bx；它的系数是 b。"],
    ["constant", "c", "常数项 c；它没有 x，也不说一次项系数。"],
  ];
  const controls = element("div", "lesson01-scan-controls");
  const result = element("p", "lesson01-reveal"); result.dataset.lesson01ScanResult = ""; result.hidden = true;
  choices.forEach(([id, label, copy]) => {
    const control = button("扫描 " + label, "lesson01-action lesson01-secondary");
    control.dataset.lesson01Scan = id;
    control.addEventListener("click", () => { result.textContent = copy; result.hidden = false; });
    controls.append(control);
  });
  root.append(element("p", "lesson01-prompt", "把一般式看成三块：请选择一块，说出它的名称，再说出对应系数。"), formula("y=ax^2+bx+c", "二次函数一般式", "lesson01-formula lesson01-current"), controls, result);
}

function renderPractice(root, random) {
  const prompt = element("p", "lesson01-question"); prompt.dataset.lesson01PracticePrompt = "";
  const formulaHost = element("div", "lesson01-formula lesson01-current");
  const answer = element("p", "lesson01-reveal"); answer.dataset.lesson01PracticeAnswer = ""; answer.hidden = true;
  const check = button("Check 判断理由"); check.dataset.lesson01PracticeCheck = "";
  const reset = button("New Question", "lesson01-action lesson01-secondary"); reset.dataset.lesson01PracticeReset = "";
  let index = Math.min(PRACTICE.length - 1, Math.max(0, Math.floor((Number(random()) || 0) * PRACTICE.length)));
  function render() {
    const item = PRACTICE[index];
    prompt.textContent = "先整理，再看最高次数，最后检查二次项系数：下面是不是二次函数？";
    renderFormula(formulaHost, item.latex, { ariaLabel: item.label, displayMode: true });
    answer.hidden = true;
  }
  check.addEventListener("click", () => { answer.textContent = PRACTICE[index].answer; answer.hidden = false; });
  reset.addEventListener("click", () => { index = (index + 1) % PRACTICE.length; render(); });
  render();
  root.append(prompt, formulaHost, element("div", "lesson01-actions", ""), answer);
  root.querySelector(".lesson01-actions").append(check, reset);
}

function renderExamples(root) {
  const examples = [
    ["标准式", "y=3x^2-5x+2", "二次项是 3x²，一次项是 −5x，常数项是 2。"],
    ["先整理", "y=(x+1)(x-2)=x^2-x-2", "展开整理后最高次数是 2，所以它是二次函数。"],
    ["二次项抵消", "y=(x+3)^2-x^2=6x+9", "二次项抵消后最高次数只有 1，所以它不是二次函数。"],
    ["参数条件", "y=(m+3)x^{m^2-2m+1}+6x-1", "指数等于 2 且 m+3≠0，解得 m=−1。"],
  ];
  const select = document.createElement("select"); select.className = "lesson01-select"; select.setAttribute("aria-label", "选择例题");
  examples.forEach(([title], index) => { const option = document.createElement("option"); option.value = String(index); option.textContent = title; select.append(option); });
  const work = element("div", "lesson01-worked-example");
  function render() { const [title, latex, copy] = examples[Number(select.value)]; work.replaceChildren(element("h3", "", title), formula(latex, latex), element("p", "", copy)); }
  select.addEventListener("change", render); render();
  root.append(element("p", "lesson01-prompt", "判断时务必先整理。参数题还要同时满足“次数为 2”和“二次项系数不为 0”两个条件。"), select, work);
  return () => select.removeEventListener("change", render);
}

function renderModel(root) {
  const slider = document.createElement("input"); slider.type = "range"; slider.min = "0"; slider.max = "4"; slider.step = "1"; slider.value = "0"; slider.dataset.lesson01ModelSize = ""; slider.setAttribute("aria-label", "增加的长度");
  const diagram = element("div", "lesson01-model-diagram");
  const readout = element("p", "lesson01-model-readout"); readout.dataset.lesson01ModelReadout = "";
  const answer = element("p", "lesson01-reveal"); answer.dataset.lesson01NegativeNote = ""; answer.hidden = true;
  const negative = button("选择负的数学解", "lesson01-action lesson01-secondary"); negative.dataset.lesson01NegativeChoice = "";
  function render() { const size = Number(slider.value); diagram.style.setProperty("--lesson01-size", String(size)); readout.textContent = (4 + size) + " × " + (3 + size) + "；面积增加 y=(4+x)(3+x)−12=x²+7x"; }
  slider.addEventListener("input", render);
  negative.addEventListener("click", () => { answer.textContent = "这个解不符合实际意义：x 表示增加的长度，不能为负。"; answer.hidden = false; });
  render();
  root.append(element("p", "lesson01-prompt", "长 4、宽 3 的长方形各增加 x，面积增加多少？现实问题也能得到二次函数。"), slider, diagram, readout, formula("y=(4+x)(3+x)-12=x^2+7x", "面积增加的二次函数"), negative, answer);
  return () => slider.removeEventListener("input", render);
}

function renderSummary(root) {
  const grid = element("div", "lesson01-summary-grid");
  [["最高次数", "先整理，再看 x 的最高次数是否为 2。"], ["一般式", "y=ax²+bx+c，其中 a≠0。"], ["判断顺序", "整理 → 看次数 → 查二次项系数。"]].forEach(([title, copy]) => { const card = element("article", "lesson01-card"); card.append(element("h3", "", title), element("p", "", copy)); grid.append(card); });
  root.append(element("p", "lesson01-prompt", "今天我们认识了二次函数。下一课将从最简单的 y=ax² 开始研究它的图象。"), formula("y=ax^2+bx+c\longrightarrow y=ax^2", "从一般式到 y=ax²", "lesson01-formula lesson01-current"), grid, element("p", "lesson01-bridge-out", "Bridge Out：图象会是什么样子？进入 Lesson 02。"));
}

const RENDERERS = Object.freeze([renderBridge, renderGeneral, renderTerms, renderScanner, renderPractice, renderExamples, renderModel, renderSummary]);

export function renderLesson01(stage, { step = 1, onStepChange = () => {}, random = Math.random } = {}) {
  const safeStep = Math.min(8, Math.max(1, Number(step) || 1));
  const cleanup = [];
  const root = createRoot(safeStep);
  const dispose = RENDERERS[safeStep - 1](root, random);
  if (typeof dispose === "function") cleanup.push(dispose);
  appendNavigation(root, safeStep, onStepChange);
  stage.replaceChildren(root);
  return { destroy() { cleanup.forEach((handler) => handler()); } };
}
