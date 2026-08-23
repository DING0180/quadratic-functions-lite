import { renderFormula } from "../formula.js";
import "./lesson01.css";

export const LESSON01_STEP_TITLES = Object.freeze([
  "Bridge In：一次函数 → 二次函数",
  "拆解二次函数一般式",
  "从实际问题建立二次函数",
  "四种情况与参数 Gate",
  "随机辨认：a 与二次项",
]);

const PRACTICE = Object.freeze([
  { latex: "y=5x-3x^2+7", label: "y=5x−3x²+7", answer: "二次项是 −3x²；所以 a=−3。二次项不一定写在最前面。" },
  { latex: "y=4x+2-\\frac{1}{2}x^2", label: "y=4x+2−1/2x²", answer: "二次项是 −1/2x²；所以 a=−1/2。它也可以写在最后。" },
  { latex: "y=6+5x^2-2x", label: "y=6+5x²−2x", answer: "二次项是 5x²；所以 a=5。先找带 x² 的那一项。" },
]);

const PARAMETER_CHALLENGES = Object.freeze([
  { coefficient: "m+3", coefficientLabel: "m+3", exponent: "m^2-2m+1", exponentLabel: "m²−2m+1", tail: "+6x-1", answer: "绿色 Gate：m²−2m+1=2；红色 Gate：m+3≠0。两条条件必须同时成立。" },
  { coefficient: "2p-1", coefficientLabel: "2p−1", exponent: "p+1", exponentLabel: "p+1", tail: "-3x+5", answer: "绿色 Gate：p+1=2；红色 Gate：2p−1≠0。先让指数等于 2，再排除系数为 0 的值。" },
  { coefficient: "t^2+1", coefficientLabel: "t²+1", exponent: "2t", exponentLabel: "2t", tail: "+t", answer: "绿色 Gate：2t=2；红色 Gate：t²+1≠0。两个 Gate 都通过，才是二次函数。" },
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
    element("p", "lesson01-kicker", "LESSON 01 · " + String(step).padStart(2, "0") + " / 05"),
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
  const next = button(step === 5 ? "回到本课开始" : "下一步");
  next.addEventListener("click", () => onStepChange(step === 5 ? 1 : step + 1));
  navigation.append(previous, element("span", "lesson01-step-count", step + " / 05"), next);
  root.append(navigation);
}

function exampleFormula(latex, label, kind) {
  const host = element("div", "lesson01-example-formula");
  host.dataset["lesson01" + kind + "Example"] = "";
  host.append(formula(latex, label));
  return host;
}

function renderBridge(root) {
  const linearGroup = element("section", "lesson01-example-group lesson01-linear-group");
  const linearExamples = element("div", "lesson01-example-grid");
  [
    ["y=x+1", "y=x+1"],
    ["y=-\\frac{1}{2}x+3", "y=−1/2x+3"],
    ["y=3x-2", "y=3x−2"],
  ].forEach(([latex, label]) => linearExamples.append(exampleFormula(latex, label, "Linear")));
  const linearForm = element("div", "lesson01-standard-form"); linearForm.dataset.lesson01LinearForm = ""; linearForm.hidden = true;
  linearForm.append(element("p", "lesson01-card-label", "归纳：一次函数的一般式"), formula("y=kx+b", "一次函数的一般式 y=kx+b"));
  linearGroup.append(element("h3", "lesson01-group-title", "先看几个一次函数"), linearExamples, linearForm);

  const quadraticGroup = element("section", "lesson01-example-group lesson01-quadratic-group"); quadraticGroup.hidden = true;
  const quadraticExamples = element("div", "lesson01-example-grid");
  [
    ["y=x^2", "y=x²"],
    ["y=-2x^2+3x+1", "y=−2x²+3x+1"],
    ["y=\\frac{1}{2}x^2-4", "y=1/2x²−4"],
  ].forEach(([latex, label]) => quadraticExamples.append(exampleFormula(latex, label, "Quadratic")));
  const quadraticForm = element("div", "lesson01-standard-form"); quadraticForm.dataset.lesson01QuadraticForm = ""; quadraticForm.hidden = true;
  quadraticForm.append(element("p", "lesson01-card-label", "归纳：二次函数的一般式"), formula("y=ax^2+bx+c", "二次函数的一般式 y=ax²+bx+c"), element("p", "lesson01-form-note", "其中 a、b、c 为常数，且 a≠0。"));
  quadraticGroup.append(element("h3", "lesson01-group-title", "再看几个二次函数"), quadraticExamples, quadraticForm);

  const groups = element("div", "lesson01-example-groups"); groups.append(linearGroup, quadraticGroup);
  const question = element("p", "lesson01-question", "现在请你告诉老师：为什么这些函数一个叫“一次”，另一个叫“二次”？"); question.hidden = true;
  const answer = element("p", "lesson01-reveal"); answer.dataset.lesson01BridgeAnswer = ""; answer.hidden = true;
  const advance = button("继续：归纳一次函数"); advance.dataset.lesson01BridgeAdvance = "";
  let phase = 0;
  function markPowers() {
    const examples = [...linearExamples.children, ...quadraticExamples.children];
    examples.forEach((example, index) => {
      const power = index < 3 ? "1" : "2";
      const badge = element("span", "lesson01-power-badge", power);
      badge.dataset.lesson01PowerBadge = power;
      example.append(badge);
      requestAnimationFrame(() => badge.classList.add("is-visible"));
    });
  }
  advance.addEventListener("click", () => {
    phase += 1;
    if (phase === 1) { linearForm.hidden = false; advance.textContent = "继续：观察二次函数"; }
    if (phase === 2) { quadraticGroup.hidden = false; advance.textContent = "继续：归纳二次函数"; }
    if (phase === 3) { quadraticForm.hidden = false; question.hidden = false; advance.textContent = "Reveal：为什么叫一次、二次？"; }
    if (phase === 4) {
      markPowers();
      answer.textContent = "函数名称来自自变量 x 的最高次数：一次函数的 x 标为 1，二次函数的 x 标为 2。";
      answer.hidden = false;
      advance.disabled = true;
      advance.textContent = "已标出最高次数";
    }
  });
  root.append(element("p", "lesson01-prompt", "先不急着给一般式。观察下面这些熟悉的函数，看看它们有什么共同点。"), groups, question, advance, answer);
}

function renderGeneral(root) {
  const cards = element("div", "lesson01-decomposition-grid");
  const items = [
    ["quadratic", "ax^2", "二次项", "ax² 是二次项；其中 a 表示二次项系数，而且 a≠0。"],
    ["linear", "bx", "一次项", "bx 是一次项；其中 b 表示一次项系数。"],
    ["constant", "c", "常数项", "c 是常数项；它不含 x，可以等于 0。"],
  ];
  items.forEach(([id, latex, title, copy]) => {
    const card = element("article", "lesson01-decomposition-card is-" + id); card.dataset.lesson01DecompositionCard = id; card.hidden = true;
    card.append(formula(latex, latex), element("h3", "", title), element("p", "", copy));
    cards.append(card);
  });
  const conclusion = element("p", "lesson01-reveal"); conclusion.hidden = true;
  const advance = button("开始拆分：先看 ax²"); advance.dataset.lesson01DecomposeAdvance = "";
  let phase = 0;
  advance.addEventListener("click", () => {
    phase += 1;
    cards.children[phase - 1].hidden = false;
    if (phase === 1) advance.textContent = "继续：再看 bx";
    if (phase === 2) advance.textContent = "继续：最后看 c";
    if (phase === 3) { conclusion.textContent = "把三块合起来，就是二次函数的一般式 y=ax²+bx+c，其中 a≠0。"; conclusion.hidden = false; advance.disabled = true; advance.textContent = "拆分完成"; }
  });
  root.append(element("p", "lesson01-prompt", "一般地，y=ax²+bx+c（a、b、c 为常数，a≠0）叫做二次函数。现在把这个式子一块一块拆开。"), formula("y=ax^2+bx+c", "二次函数的一般式", "lesson01-formula lesson01-current"), cards, advance, conclusion);
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
    prompt.textContent = "请先口答：二次项是哪一项？二次项系数 a 等于多少？注意：二次项不一定写在最前面。";
    renderFormula(formulaHost, item.latex, { ariaLabel: item.label, displayMode: true });
    formulaHost.dataset.lesson01PracticeFunction = "";
    answer.hidden = true;
  }
  check.addEventListener("click", () => { answer.textContent = PRACTICE[index].answer; answer.hidden = false; });
  reset.addEventListener("click", () => { index = (index + 1) % PRACTICE.length; render(); });
  render();
  root.append(prompt, formulaHost, element("div", "lesson01-actions", ""), answer);
  root.querySelector(".lesson01-actions").append(check, reset);
}

function renderExamples(root, random) {
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
  const parameter = element("section", "lesson01-parameter-gate");
  const expression = element("div", "lesson01-parameter-expression");
  const coefficient = formula("", "", "lesson01-parameter-piece is-coefficient"); coefficient.dataset.lesson01ParameterCoefficient = "";
  const exponent = formula("", "", "lesson01-parameter-piece is-exponent"); exponent.dataset.lesson01ParameterExponent = "";
  const tail = formula("", "", "lesson01-parameter-piece");
  const answer = element("p", "lesson01-reveal"); answer.dataset.lesson01ParameterAnswer = ""; answer.hidden = true;
  const reveal = button("Reveal：检查两个 Gate"); reveal.dataset.lesson01ParameterReveal = "";
  const next = button("New Parameter Challenge", "lesson01-action lesson01-secondary"); next.dataset.lesson01ParameterNext = "";
  let index = Math.min(PARAMETER_CHALLENGES.length - 1, Math.max(0, Math.floor((Number(random()) || 0) * PARAMETER_CHALLENGES.length)));
  function renderParameter() {
    const challenge = PARAMETER_CHALLENGES[index];
    renderFormula(coefficient, challenge.coefficient, { ariaLabel: challenge.coefficientLabel, displayMode: true });
    renderFormula(exponent, "x^{" + challenge.exponent + "}", { ariaLabel: "x 的指数 " + challenge.exponentLabel, displayMode: true });
    renderFormula(tail, challenge.tail, { ariaLabel: challenge.tail, displayMode: true });
    answer.hidden = true;
  }
  reveal.addEventListener("click", () => { answer.textContent = PARAMETER_CHALLENGES[index].answer; answer.hidden = false; });
  next.addEventListener("click", () => { index = (index + 1) % PARAMETER_CHALLENGES.length; renderParameter(); });
  expression.append(formula("y=", "y 等于", "lesson01-parameter-piece"), coefficient, exponent, tail);
  parameter.append(element("h3", "", "参数 Gate：两条条件同时过关"), element("p", "lesson01-parameter-legend", "绿色：x 的最高次数必须等于 2　｜　红色：二次项系数必须不等于 0"), expression, reveal, next, answer);
  renderParameter();
  root.append(element("p", "lesson01-prompt", "判断时务必先整理。下面保留四种常见情况；参数题则要同时检查两条条件。"), select, work, parameter);
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

const RENDERERS = Object.freeze([renderBridge, renderGeneral, renderModel, renderExamples, renderPractice]);

export function renderLesson01(stage, { step = 1, onStepChange = () => {}, random = Math.random } = {}) {
  const safeStep = Math.min(5, Math.max(1, Number(step) || 1));
  const cleanup = [];
  const root = createRoot(safeStep);
  const dispose = RENDERERS[safeStep - 1](root, random);
  if (typeof dispose === "function") cleanup.push(dispose);
  appendNavigation(root, safeStep, onStepChange);
  stage.replaceChildren(root);
  return { destroy() { cleanup.forEach((handler) => handler()); } };
}
