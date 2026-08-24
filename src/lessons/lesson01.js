import { renderFormula } from "../formula.js";
import "./lesson01.css";

export const LESSON01_STEP_TITLES = Object.freeze([
  "Bridge In：一次函数 → 二次函数",
  "拆解二次函数一般式",
  "随机辨认：a 与二次项",
  "三种情况判断二次函数",
  "从实际问题建立二次函数",
]);

const PRACTICE = Object.freeze([
  { label: "y=5x−3x²+7", parts: [{ latex: "y=" }, { id: "linear", coefficient: "5", variable: "x" }, { id: "quadratic", coefficient: "-3", variable: "x^2" }, { latex: "+7" }] },
  { label: "y=4x+2−1/2x²", parts: [{ latex: "y=" }, { id: "linear", coefficient: "4", variable: "x" }, { latex: "+2" }, { id: "quadratic", coefficient: "-\\frac{1}{2}", variable: "x^2" }] },
  { label: "y=6+5x²−2x", parts: [{ latex: "y=6+" }, { id: "quadratic", coefficient: "5", variable: "x^2" }, { id: "linear", coefficient: "-2", variable: "x" }] },
]);

const PRACTICE_QUESTIONS = Object.freeze([
  { id: "quadratic-term", target: "quadratic", kind: "term", prompt: "请先口答：二次项是哪一项？" },
  { id: "quadratic-coefficient", target: "quadratic", kind: "coefficient", prompt: "请先口答：二次项系数是多少？" },
  { id: "linear-term", target: "linear", kind: "term", prompt: "请先口答：一次项是哪一项？" },
  { id: "linear-coefficient", target: "linear", kind: "coefficient", prompt: "请先口答：一次项系数是多少？" },
]);

const PARAMETER_CHALLENGES = Object.freeze([
  { coefficient: "\\left(m+3\\right)", coefficientLabel: "(m+3)", exponent: "m^2-2m+1", exponentLabel: "m²−2m+1", tail: "+6x-1", answer: "绿色：x 的次数 m²−2m+1 必须等于 2；红色：(m+3)≠0。两条条件必须同时成立。" },
  { coefficient: "\\left|p-2\\right|", coefficientLabel: "|p−2|", exponent: "\\left|p\\right|+1", exponentLabel: "|p|+1", tail: "-3x+5", answer: "绿色：x 的次数 |p|+1 必须等于 2；红色：|p−2|≠0，也就是 p≠2。绝对值为 0 也会让二次项消失。" },
  { coefficient: "\\left|t-2\\right|+1", coefficientLabel: "|t−2|+1", exponent: "t", exponentLabel: "t", tail: "+t", answer: "绿色：x 的次数 t 必须等于 2；红色：|t−2|+1 始终大于 0。两个 Gate 都通过，才是二次函数。" },
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

function exampleFormula({ latex, label, revealedLatex, revealedLabel, power }, kind) {
  const host = element("div", "lesson01-example-formula");
  host.dataset["lesson01" + kind + "Example"] = "";
  host.setAttribute("aria-label", label);
  const formulaHost = formula(latex, label);
  host.append(formulaHost);
  return {
    host,
    revealPower() {
      renderFormula(formulaHost, revealedLatex, { ariaLabel: revealedLabel, displayMode: true });
      host.setAttribute("aria-label", revealedLabel);
      host.dataset.lesson01PowerHighlight = power;
      host.classList.add("is-power-highlighted");
    },
  };
}

function renderBridge(root) {
  const linearGroup = element("section", "lesson01-example-group lesson01-linear-group");
  const linearExamples = element("div", "lesson01-example-grid is-vertical");
  const linearCards = [
    { latex: "y=x+1", label: "y=x+1", revealedLatex: "y=x^{\\color{#d84242}{\\mathbf{1}}}+1", revealedLabel: "y=x¹+1", power: "1" },
    { latex: "y=-\\frac{1}{2}x+3", label: "y=−1/2x+3", revealedLatex: "y=-\\frac{1}{2}x^{\\color{#d84242}{\\mathbf{1}}}+3", revealedLabel: "y=−1/2x¹+3", power: "1" },
    { latex: "y=3x-2", label: "y=3x−2", revealedLatex: "y=3x^{\\color{#d84242}{\\mathbf{1}}}-2", revealedLabel: "y=3x¹−2", power: "1" },
  ].map((example) => exampleFormula(example, "Linear"));
  linearCards.forEach(({ host }) => linearExamples.append(host));
  const linearForm = element("div", "lesson01-standard-form"); linearForm.dataset.lesson01LinearForm = "";
  linearForm.append(element("p", "lesson01-card-label", "归纳：一次函数的一般式"), formula("y=kx+b", "一次函数的一般式 y=kx+b"));
  linearGroup.append(element("h3", "lesson01-group-title", "先看几个一次函数"), linearExamples, linearForm);

  const quadraticGroup = element("section", "lesson01-example-group lesson01-quadratic-group"); quadraticGroup.hidden = true;
  const quadraticExamples = element("div", "lesson01-example-grid is-vertical");
  const quadraticCards = [
    { latex: "y=x^2", label: "y=x²", revealedLatex: "y=x^{\\color{#d84242}{\\mathbf{2}}}", revealedLabel: "y=x²", power: "2" },
    { latex: "y=4x^2+3x-7", label: "y=4x²+3x−7", revealedLatex: "y=4x^{\\color{#d84242}{\\mathbf{2}}}+3x-7", revealedLabel: "y=4x²+3x−7", power: "2" },
    { latex: "y=-\\frac{1}{2}x^2-4", label: "y=−1/2x²−4", revealedLatex: "y=-\\frac{1}{2}x^{\\color{#d84242}{\\mathbf{2}}}-4", revealedLabel: "y=−1/2x²−4", power: "2" },
  ].map((example) => exampleFormula(example, "Quadratic"));
  quadraticCards.forEach(({ host }) => quadraticExamples.append(host));
  const quadraticForm = element("div", "lesson01-standard-form"); quadraticForm.dataset.lesson01QuadraticForm = ""; quadraticForm.hidden = true;
  quadraticForm.append(element("p", "lesson01-card-label", "归纳：二次函数的一般式"), formula("y=ax^2+bx+c", "二次函数的一般式 y=ax²+bx+c"), element("p", "lesson01-form-note", "其中 a、b、c 为常数，且 a≠0。"));
  quadraticGroup.append(element("h3", "lesson01-group-title", "再看几个二次函数"), quadraticExamples, quadraticForm);

  const groups = element("div", "lesson01-example-groups lesson01-compare-grid"); groups.append(linearGroup, quadraticGroup);
  const question = element("p", "lesson01-question", "现在请你告诉老师：为什么这些函数一个叫“一次”，另一个叫“二次”？"); question.hidden = true;
  const answer = element("p", "lesson01-reveal"); answer.dataset.lesson01BridgeAnswer = ""; answer.hidden = true;
  const advance = button("转换：再看几个二次函数"); advance.dataset.lesson01BridgeAdvance = "";
  let phase = 0;
  advance.addEventListener("click", () => {
    if (phase === 0) {
      quadraticGroup.hidden = false;
      quadraticForm.hidden = false;
      question.hidden = false;
      phase = 1;
      advance.textContent = "Reveal：为什么叫一次、二次？";
      return;
    }
    [...linearCards, ...quadraticCards].forEach(({ revealPower }) => revealPower());
    answer.textContent = "函数名称来自自变量 x 的最高次数：左边的一次函数补出并高亮 x¹，右边的二次函数高亮 x²。";
    answer.hidden = false;
    advance.disabled = true;
    advance.textContent = "已点亮最高次数";
  });
  root.append(element("p", "lesson01-prompt", "先观察左侧的三个一次函数及其一般式；点击转换后，再在右侧比较三个二次函数。"), groups, question, advance, answer);
}

function renderGeneral(root) {
  const cards = element("div", "lesson01-decomposition-grid");
  cards.dataset.lesson01TokenTargets = "";
  const source = element("div", "lesson01-token-formula lesson01-current");
  source.dataset.lesson01TokenSource = "";
  const parts = [
    { id: "quadratic", latex: "ax^2", label: "ax²", title: "二次项", copy: "ax² 是二次项；其中 a 表示二次项系数，而且 a≠0。", coefficient: "a", remainder: "x^2", coefficientTitle: "a 是二次项系数" },
    { id: "linear", latex: "bx", label: "bx", title: "一次项", copy: "bx 是一次项；其中 b 表示一次项系数。", coefficient: "b", remainder: "x", coefficientTitle: "b 是一次项系数" },
    { id: "constant", latex: "c", label: "c", title: "常数项", copy: "c 是常数项；它不含 x，可以等于 0。" },
  ].map((part) => {
    const token = formula(part.latex, part.label, "lesson01-formula lesson01-general-token is-" + part.id);
    token.dataset.lesson01GeneralToken = part.id;
    const separator = part.id === "constant" ? null : formula("+", "加号", "lesson01-formula lesson01-token-separator");
    if (separator) separator.dataset.lesson01TokenSeparator = part.id;
    const card = element("article", "lesson01-decomposition-card is-" + part.id);
    card.dataset.lesson01DecompositionCard = part.id;
    const slot = element("div", "lesson01-token-slot"); slot.dataset.lesson01TokenSlot = part.id;
    const details = element("div", "lesson01-token-label"); details.dataset.lesson01TokenLabel = part.id; details.hidden = true;
    const callout = element("p", "lesson01-coefficient-callout"); callout.dataset.lesson01CoefficientCallout = part.id; callout.hidden = true;
    details.append(element("h3", "", part.title), element("p", "", part.copy), callout);
    card.append(slot, details);
    cards.append(card);
    return { ...part, token, separator, card, slot, details, callout };
  });
  const prefix = formula("y=", "y 等于", "lesson01-formula lesson01-token-prefix");
  prefix.dataset.lesson01TokenPrefix = "";
  source.append(prefix);
  parts.forEach(({ token, separator }) => {
    source.append(token);
    if (separator) source.append(separator);
  });
  const conclusion = element("p", "lesson01-reveal"); conclusion.hidden = true;
  const advance = button("开始拆分：移动 ax²"); advance.dataset.lesson01DecomposeAdvance = "";
  let phase = 0;
  const activeFlights = new Set();
  function createDecomposedToken(part) {
    if (!part.coefficient) {
      const token = formula(part.latex, part.label, "lesson01-formula lesson01-decomposed-token is-" + part.id);
      token.dataset.lesson01DecomposedToken = part.id;
      return token;
    }
    const token = element("div", "lesson01-formula lesson01-decomposed-token is-" + part.id);
    token.dataset.lesson01DecomposedToken = part.id;
    const coefficient = formula(part.coefficient, part.coefficient, "lesson01-formula lesson01-coefficient-token is-" + part.id);
    coefficient.dataset.lesson01CoefficientToken = part.id;
    token.append(coefficient, formula(part.remainder, part.remainder, "lesson01-formula lesson01-term-remainder"));
    return token;
  }
  function moveToken(part) {
    const before = part.token.getBoundingClientRect();
    part.card.classList.add("is-revealed");
    const after = part.slot.getBoundingClientRect();
    const flight = formula(part.latex, part.label, "lesson01-formula lesson01-flight-token is-" + part.id);
    flight.dataset.lesson01FlightToken = part.id;
    flight.style.left = before.left + "px";
    flight.style.top = before.top + "px";
    root.append(flight);
    activeFlights.add(flight);
    const deltaX = after.left - before.left;
    const deltaY = after.top - before.top;
    flight.classList.add("is-flip-moving");
    const finish = () => {
      flight.remove();
      activeFlights.delete(flight);
      part.slot.replaceChildren(createDecomposedToken(part));
    };
    if (typeof flight.animate === "function") {
      const animation = flight.animate([
        { transform: "translate(0, 0)", opacity: 0.82 },
        { transform: "translate(" + deltaX + "px, " + deltaY + "px)", opacity: 1 },
      ], { duration: 560, easing: "cubic-bezier(.2,.8,.2,1)", fill: "both" });
      return new Promise((resolve) => {
        let done = false;
        let timeout;
        const complete = () => {
          if (done) return;
          done = true;
          window.clearTimeout(timeout);
          finish();
          resolve();
        };
        timeout = window.setTimeout(complete, 640);
        Promise.resolve(animation.finished).catch(() => undefined).then(complete);
      });
    }
    if (deltaX === 0 && deltaY === 0) return Promise.resolve().then(finish);
    flight.style.setProperty("--lesson01-flip-x", deltaX + "px");
    flight.style.setProperty("--lesson01-flip-y", deltaY + "px");
    flight.classList.add("is-css-fallback");
    void flight.offsetWidth;
    return new Promise((resolve) => {
      const complete = () => { flight.removeEventListener("transitionend", complete); finish(); resolve(); };
      flight.addEventListener("transitionend", complete);
      requestAnimationFrame(() => flight.classList.add("is-flip-settled"));
      window.setTimeout(complete, 640);
    });
  }
  function focusCoefficient(part) {
    const coefficient = part.slot.querySelector("[data-lesson01-coefficient-token='" + part.id + "']");
    coefficient.classList.add("is-coefficient-emphasized");
    part.card.classList.add("is-coefficient-focused");
    part.callout.textContent = part.coefficientTitle;
    part.callout.hidden = false;
  }
  advance.addEventListener("click", async () => {
    if (advance.disabled) return;
    advance.disabled = true;
    if (phase === 3) {
      focusCoefficient(parts[0]);
      phase = 4;
      advance.disabled = false;
      advance.textContent = "继续：聚焦一次项系数 b";
      return;
    }
    if (phase === 4) {
      focusCoefficient(parts[1]);
      phase = 5;
      conclusion.textContent = "项是完整的一块：ax²、bx；系数是项中的一部分：a 是二次项系数，b 是一次项系数。";
      conclusion.hidden = false;
      advance.textContent = "系数已聚焦";
      return;
    }
    const part = parts[phase];
    await moveToken(part);
    part.details.hidden = false;
    phase += 1;
    if (phase === 1) { advance.disabled = false; advance.textContent = "继续：移动 bx"; }
    if (phase === 2) { advance.disabled = false; advance.textContent = "继续：最后移动 c"; }
    if (phase === 3) { conclusion.textContent = "三项已经拆分完成。继续观察：每个完整的项中，哪一部分才是系数？"; conclusion.hidden = false; advance.disabled = false; advance.textContent = "继续：聚焦二次项系数 a"; }
  });
  root.append(element("p", "lesson01-prompt", "一般地，y=ax²+bx+c（a、b、c 为常数，a≠0）叫做二次函数。原式会保留；每次点击会复制一块同色数学 token，并平滑移动到对应位置。"), source, cards, advance, conclusion);
  return () => activeFlights.forEach((flight) => flight.remove());
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
  const formulaHost = element("div", "lesson01-formula lesson01-current lesson01-practice-expression");
  const status = element("p", "lesson01-sr-only"); status.dataset.lesson01PracticeAnswer = ""; status.setAttribute("aria-live", "polite");
  const check = button("Reveal：在原式中标注"); check.dataset.lesson01PracticeCheck = "";
  const reset = button("New Question", "lesson01-action lesson01-secondary"); reset.dataset.lesson01PracticeReset = "";
  let index = Math.min(PRACTICE.length - 1, Math.max(0, Math.floor((Number(random()) || 0) * PRACTICE.length)));
  let questionIndex = Math.min(PRACTICE_QUESTIONS.length - 1, Math.max(0, Math.floor((Number(random()) || 0) * PRACTICE_QUESTIONS.length)));
  function render() {
    const item = PRACTICE[index];
    const question = PRACTICE_QUESTIONS[questionIndex];
    prompt.textContent = question.prompt + " 注意：相应项不一定写在最前面。";
    formulaHost.replaceChildren();
    formulaHost.setAttribute("aria-label", item.label);
    item.parts.forEach((part) => {
      if (!part.id) { formulaHost.append(formula(part.latex, part.latex, "lesson01-formula lesson01-practice-text")); return; }
      const term = element("span", "lesson01-practice-term is-" + part.id); term.dataset.lesson01PracticeTerm = part.id;
      const coefficient = formula(part.coefficient, part.coefficient, "lesson01-formula lesson01-practice-coefficient"); coefficient.dataset.lesson01PracticeCoefficient = part.id;
      term.append(coefficient, formula(part.variable, part.variable, "lesson01-formula"));
      formulaHost.append(term);
    });
    formulaHost.dataset.lesson01PracticeFunction = "";
    status.textContent = "";
  }
  check.addEventListener("click", () => {
    const question = PRACTICE_QUESTIONS[questionIndex];
    const selector = question.kind === "term" ? "[data-lesson01-practice-term='" : "[data-lesson01-practice-coefficient='";
    const answer = formulaHost.querySelector(selector + question.target + "']");
    answer.classList.add(question.kind === "term" ? "is-answer-term" : "is-answer-coefficient");
    status.textContent = "答案已直接标注在原式中。";
  });
  reset.addEventListener("click", () => { index = (index + 1) % PRACTICE.length; questionIndex = (questionIndex + 1) % PRACTICE_QUESTIONS.length; render(); });
  render();
  root.append(prompt, formulaHost, element("div", "lesson01-actions", ""), status);
  root.querySelector(".lesson01-actions").append(check, reset);
}

function renderExamples(root, random) {
  const workspace = element("div", "lesson01-case-workspace"); workspace.dataset.lesson01CaseWorkspace = "";
  const standardBank = [
    { latex: "y=3x^2-5x+2", label: "y=3x²−5x+2", answer: "是二次函数：x 的最高次数是 2，二次项系数 3≠0。" },
    { latex: "y=-\\frac{1}{2}x^2+4x-1", label: "y=−1/2x²+4x−1", answer: "是二次函数：x 的最高次数是 2，二次项系数 −1/2≠0。" },
    { latex: "y=7x-4", label: "y=7x−4", answer: "不是二次函数：x 的最高次数只有 1。" },
  ];
  const simplifyBank = [
    { latex: "y=(x+2)^2-3x^2", label: "y=(x+2)²−3x²", answer: "化简得 y=−2x²+4x+4，是二次函数。" },
    { latex: "y=(x+3)^2-x^2", label: "y=(x+3)²−x²", answer: "利用平方差化简得 y=6x+9，不是二次函数。" },
    { latex: "y=(x+1)(x-1)+2x^2", label: "y=(x+1)(x−1)+2x²", answer: "化简得 y=3x²−1，是二次函数。" },
  ];
  function createSimpleCase(id, title, prompt, bank) {
    const card = element("article", "lesson01-case-card is-" + id); card.dataset.lesson01Case = id;
    const formulaHost = element("div", "lesson01-case-formula"); formulaHost.dataset.lesson01CaseFormula = id;
    const answer = element("p", "lesson01-case-answer"); answer.dataset.lesson01CaseAnswer = id; answer.hidden = true;
    const reveal = button("Reveal：判断是否为二次函数", "lesson01-action lesson01-secondary"); reveal.dataset.lesson01CaseReveal = id;
    const next = button("New Problem", "lesson01-action lesson01-secondary"); next.dataset.lesson01CaseNew = id;
    let index = Math.min(bank.length - 1, Math.max(0, Math.floor((Number(random()) || 0) * bank.length)));
    function render() {
      const problem = bank[index];
      renderFormula(formulaHost, problem.latex, { ariaLabel: problem.label, displayMode: true });
      answer.hidden = true;
    }
    reveal.addEventListener("click", () => { answer.textContent = bank[index].answer; answer.hidden = false; });
    next.addEventListener("click", () => { index = (index + 1) % bank.length; render(); });
    render();
    card.append(element("h3", "", title), element("p", "lesson01-case-prompt", prompt), formulaHost, reveal, next, answer);
    return card;
  }

  function createParameterCase() {
    const parameter = element("article", "lesson01-case-card lesson01-parameter-gate"); parameter.dataset.lesson01Case = "parameter";
    const expression = element("div", "lesson01-parameter-expression"); expression.dataset.lesson01CaseFormula = "parameter";
    const coefficient = formula("", "", "lesson01-parameter-piece is-coefficient"); coefficient.dataset.lesson01ParameterCoefficient = "";
    const exponent = formula("", "", "lesson01-parameter-piece is-exponent"); exponent.dataset.lesson01ParameterExponent = "";
    const tail = formula("", "", "lesson01-parameter-piece");
    const answer = element("p", "lesson01-case-answer"); answer.dataset.lesson01ParameterAnswer = ""; answer.hidden = true;
    const reveal = button("Reveal：检查两个 Gate", "lesson01-action lesson01-secondary"); reveal.dataset.lesson01CaseReveal = "parameter";
    const next = button("New Problem", "lesson01-action lesson01-secondary"); next.dataset.lesson01CaseNew = "parameter";
    let parameterIndex = Math.min(PARAMETER_CHALLENGES.length - 1, Math.max(0, Math.floor((Number(random()) || 0) * PARAMETER_CHALLENGES.length)));
    function renderParameter() {
      const challenge = PARAMETER_CHALLENGES[parameterIndex];
      expression.setAttribute("aria-label", "y=" + challenge.coefficientLabel + "x 的 " + challenge.exponentLabel + " 次方" + challenge.tail);
      renderFormula(coefficient, challenge.coefficient, { ariaLabel: challenge.coefficientLabel, displayMode: true });
      renderFormula(exponent, "x^{" + challenge.exponent + "}", { ariaLabel: "x 的指数 " + challenge.exponentLabel, displayMode: true });
      renderFormula(tail, challenge.tail, { ariaLabel: challenge.tail, displayMode: true });
      answer.hidden = true;
    }
    reveal.addEventListener("click", () => { answer.textContent = PARAMETER_CHALLENGES[parameterIndex].answer; answer.hidden = false; });
    next.addEventListener("click", () => { parameterIndex = (parameterIndex + 1) % PARAMETER_CHALLENGES.length; renderParameter(); });
    expression.append(formula("y=", "y 等于", "lesson01-parameter-piece"), coefficient, exponent, tail);
    parameter.append(element("h3", "", "③ 含参 Gate"), element("p", "lesson01-case-prompt", "同时检查：x 的次数是否为 2，以及二次项系数是否不为 0。"), element("p", "lesson01-parameter-legend", "绿色：x 的次数（指数）必须等于 2　｜　红色：二次项系数必须不等于 0"), expression, reveal, next, answer);
    renderParameter();
    return parameter;
  }
  const selector = document.createElement("select"); selector.className = "lesson01-select"; selector.dataset.lesson01CaseSelector = ""; selector.setAttribute("aria-label", "选择练习类型");
  [["standard", "① 标准式"], ["simplify", "② 先化简"], ["parameter", "③ 含参 Gate"]].forEach(([value, label]) => { const option = document.createElement("option"); option.value = value; option.textContent = label; selector.append(option); });
  function renderSelectedCase() {
    const current = selector.value;
    const card = current === "standard"
      ? createSimpleCase("standard", "① 标准式", "直接判断：它是不是二次函数？留意也可能混入一次函数。", standardBank)
      : current === "simplify"
        ? createSimpleCase("simplify", "② 先化简", "先展开或用公式化简，再判断它是不是二次函数。", simplifyBank)
        : createParameterCase();
    workspace.replaceChildren(card);
  }
  selector.addEventListener("change", renderSelectedCase);
  renderSelectedCase();
  root.append(element("p", "lesson01-prompt", "请选择一种情况练习：标准式可直接判断；化简题先整理；含参题要同时通过两个 Gate。"), selector, workspace);
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

const RENDERERS = Object.freeze([renderBridge, renderGeneral, renderPractice, renderExamples, renderModel]);

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

