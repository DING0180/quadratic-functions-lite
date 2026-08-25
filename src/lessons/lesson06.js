import { renderFormula } from "../formula.js";
import { createParabolaGraph } from "../graph/parabola-svg.js";
import "./lesson06.css";

const VIEWPORT = Object.freeze({ xMin: -6, xMax: 6, yMin: -8, yMax: 12, yTickStep: 2 });
const COLORS = Object.freeze({ curve: "#19735d", vertex: "#c88818" });
export const LESSON06_STEP_TITLES = Object.freeze(["Bridge In：两种形式", "教师示范：配方法", "配方后读顶点与对称轴", "Quick Random Challenge", "Summary + Bridge Out"]);

function element(tag, className = "", text = "") { const node = document.createElement(tag); if (className) node.className = className; if (text) node.textContent = text; return node; }
function button(text, className = "lesson06-action") { const node = element("button", className, text); node.type = "button"; return node; }
function number(value) { return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(4))); }
function signed(value) { return value === 0 ? "" : value > 0 ? "+" + number(value) : number(value); }
function vertexText({ a, h, k }) { const coefficient = a === 1 ? "" : a === -1 ? "-" : number(a); const inside = h === 0 ? "x" : "x" + (h > 0 ? "-" : "+") + number(Math.abs(h)); return "y=" + coefficient + "(" + inside + ")²" + signed(k); }
function generalText({ a, b, c }) { return "y=" + (a === 1 ? "" : a === -1 ? "-" : number(a)) + "x²" + (b === 0 ? "" : b > 0 ? "+" + number(b) + "x" : number(b) + "x") + signed(c); }
function formula(text, className = "lesson06-formula", dataset = "") { const node = element("div", className); if (dataset) node.dataset[dataset] = ""; renderFormula(node, text.replaceAll("²", "^2"), { ariaLabel: text, displayMode: true }); return node; }
function card(label, latex, ariaLabel, dataset) { const node = element("article", "lesson06-form-card"); const host = element("div", "lesson06-formula"); host.dataset[dataset] = ""; renderFormula(host, latex, { ariaLabel, displayMode: true }); node.append(element("p", "lesson06-card-label", label), host); return node; }
function formInfoTable(rows, dataset) {
  const table = element("table", "lesson06-form-info");
  table.dataset[dataset] = "";
  const body = document.createElement("tbody");
  rows.forEach(([label, value, unknown]) => {
    const row = document.createElement("tr");
    const heading = element("th", "", label); heading.scope = "row";
    const cell = element("td", unknown ? "lesson06-form-info-unknown" : "", value);
    row.append(heading, cell);
    body.append(row);
  });
  table.append(body);
  return table;
}

export function vertexFromGeneral({ a, b, c }) { if (![a, b, c].every(Number.isFinite) || a === 0) throw new TypeError("general form needs finite non-zero a"); const h = -b / (2 * a); return { a, h, k: (4 * a * c - b * b) / (4 * a) }; }

function createRoot(step) { const root = element("section", "lesson06-step"); const heading = element("header", "lesson06-heading"); heading.append(element("p", "lesson06-kicker", "LESSON 06 · " + String(step).padStart(2, "0") + " / " + String(LESSON06_STEP_TITLES.length).padStart(2, "0")), element("h2", "lesson06-title", LESSON06_STEP_TITLES[step - 1])); root.append(heading); return root; }
function appendNavigation(root, step, onStepChange) { const nav = element("nav", "lesson06-step-controls"); nav.setAttribute("aria-label", "Lesson 6 步骤导航"); const previous = button("上一步", "lesson06-action lesson06-secondary"); previous.disabled = step === 1; previous.addEventListener("click", () => onStepChange(Math.max(1, step - 1))); const finalStep = LESSON06_STEP_TITLES.length; const next = button(step === finalStep ? "回到本课开始" : "下一步"); next.addEventListener("click", () => onStepChange(step === finalStep ? 1 : step + 1)); nav.append(previous, element("span", "lesson06-step-count", step + " / " + finalStep), next); root.append(nav); }
function addGraph(host, parameters, cleanup, ariaLabel) { const graph = createParabolaGraph(host, { viewport: VIEWPORT, curves: [{ ...parameters, color: COLORS.curve }], points: [{ x: parameters.h, y: parameters.k, color: COLORS.vertex, radius: 5 }], guides: [{ x: parameters.h, color: COLORS.vertex }], labels: [{ x: Math.min(5, parameters.h + .25), y: Math.min(11, parameters.k + .8), text: "V(" + number(parameters.h) + ", " + number(parameters.k) + ")" }], ariaLabel }); cleanup.push(() => graph.destroy()); return graph; }
function updateGraph(graph, p, ariaLabel) { graph.update({ curves: [{ ...p, color: COLORS.curve }], points: [{ x: p.h, y: p.k, color: COLORS.vertex, radius: 5 }], guides: [{ x: p.h, color: COLORS.vertex }], labels: [{ x: Math.min(5, p.h + .25), y: Math.min(11, p.k + .8), text: "V(" + number(p.h) + ", " + number(p.k) + ")" }], ariaLabel }); }
function reveal(text, dataset) { const node = button(text); node.dataset[dataset] = ""; return node; }

function renderBridge(root) {
  const vertexCard = card("顶点式 (vertex form)", "y=a(x-h)^2+k", "y=a(x-h)²+k", "lesson06VertexForm");
  vertexCard.append(formInfoTable([["顶点", "(h,k)  ·  可直接读出"], ["对称轴", "x=h  ·  可直接读出"]], "lesson06VertexInfo"));
  const generalCard = card("一般式 (general form)", "y=ax^2+bx+c", "y=ax²+bx+c", "lesson06GeneralForm");
  generalCard.append(formInfoTable([["顶点", "？", true], ["对称轴", "？", true]], "lesson06GeneralInfo"));
  const forms = element("div", "lesson06-forms");
  forms.append(vertexCard, element("strong", "lesson06-arrow", "↔"), generalCard);
  const control = reveal("Reveal Connection", "lesson06BridgeReveal");
  const conclusion = element("p", "lesson06-conclusion", "只给一般式 y=ax²+bx+c 时，我们能不能也直接读出顶点和对称轴？怎样把一般式转换成顶点式？这就是本节课要解决的核心问题。");
  conclusion.hidden = true;
  control.addEventListener("click", () => { conclusion.hidden = false; });
  root.append(element("p", "lesson06-question", "顶点式下的信息可以直接读出；一般式下的两个问号，怎样才能回答？"), forms, control, conclusion);
}

function renderDemo(root, _change, cleanup) { const moves = [["原式", "y=2x^2-8x+3"], ["提取 a", "y=2(x^2-4x)+3"], ["加减同一个数", "y=2[(x^2-4x+4)-4]+3"], ["合成完全平方", "y=2(x-2)^2-8+3"], ["整理成顶点式", "y=2(x-2)^2-5"]]; let index = 0; const morph = element("div", "lesson06-morph"); const status = element("p", "lesson06-status"); const next = button("Next Move"); next.dataset.lesson06DemoNext = ""; const result = element("div", "lesson06-demo-result"); result.dataset.lesson06DemoResult = ""; result.hidden = true; const graphPanel = element("div", "lesson06-graph-panel"); graphPanel.hidden = true; addGraph(graphPanel, { a: 2, h: 2, k: -5 }, cleanup, "y=2(x-2)²-5 的图象"); function render() { morph.replaceChildren(element("p", "lesson06-card-label", moves[index][0]), formula(moves[index][1], "lesson06-formula lesson06-morph-formula")); status.textContent = "第 " + (index + 1) + " / 5 步：" + moves[index][0] + "。"; const done = index === 4; result.hidden = !done; graphPanel.hidden = !done; next.disabled = done; if (done) result.textContent = "顶点 (vertex)：(2, -5)；对称轴 (axis of symmetry)：x=2。"; } next.addEventListener("click", () => { index = Math.min(4, index + 1); render(); }); root.append(element("p", "lesson06-question", "每次只做一个配方动作：先把二次项系数提出，再在括号内加减同一个数。"), morph, next, status, result, graphPanel); render(); }

function renderInteractive(root) {
  const general = { a: 2, b: -8, c: 3 };
  const formAnswer = element("section", "lesson06-answer lesson06-practice-form");
  formAnswer.dataset.lesson06PracticeForm = "";
  formAnswer.hidden = true;
  formAnswer.append(
    element("p", "lesson06-card-label", "配方后的顶点式"),
    formula("y=2(x-2)^2-5", "lesson06-formula lesson06-hero lesson06-morph-formula"),
    element("p", "", "请把它与顶点式 y=a(x-h)²+k 对照：本题的 h、k 分别是谁？顶点和对称轴是什么？"),
  );
  const formulaAnswer = element("section", "lesson06-answer lesson06-practice-answer");
  formulaAnswer.dataset.lesson06PracticeAnswer = "";
  formulaAnswer.hidden = true;
  formulaAnswer.append(
    element("p", "", "由 y=a(x-h)²+k 可读出 h=-b/(2a)，k=(4ac-b²)/(4a)。因此给定一般式："),
    element("p", "", "对称轴 (axis of symmetry)："),
    formula("x=-\\frac{b}{2a}", "lesson06-formula", "lesson06DirectAxis"),
    element("p", "", "顶点 (vertex)："),
    formula("\\left(-\\frac{b}{2a},\\frac{4ac-b^2}{4a}\\right)", "lesson06-formula", "lesson06DirectVertex"),
    element("p", "", "理解公式时看配方；做题时读出 a、b、c 后可直接套用这两个结论。"),
  );
  const control = reveal("Reveal 配方结果", "lesson06PracticeReveal");
  let phase = 0;
  control.addEventListener("click", () => {
    if (phase === 0) {
      formAnswer.hidden = false;
      control.textContent = "Reveal Answer";
      phase = 1;
      return;
    }
    formulaAnswer.hidden = false;
    control.disabled = true;
  });
  root.append(
    element("p", "lesson06-prompt", "先用配方法把一般式改写成顶点式；再根据顶点式的结构，回答一般式的顶点坐标和对称轴怎样直接读出。"),
    element("div", "lesson06-question", "请先独立配方："),
    formula(generalText(general), "lesson06-formula lesson06-hero", "lesson06PracticeGeneral"),
    control,
    formAnswer,
    formulaAnswer,
  );
}

function renderSymbolic(root) { const moves = [["一般式", "y=ax^2+bx+c"], ["提出 a", "y=a(x^2+\\frac{b}{a}x)+c"], ["在括号内配方", "y=a[(x+\\frac{b}{2a})^2-\\frac{b^2}{4a^2}]+c"], ["整理", "y=a(x+\\frac{b}{2a})^2+\\frac{4ac-b^2}{4a}"], ["与顶点式对齐", "y=a[x-(-\\frac{b}{2a})]^2+\\frac{4ac-b^2}{4a}"]]; let index = 0; const morph = element("div", "lesson06-morph"); const next = button("Next Move"); next.dataset.lesson06SymbolicNext = ""; function render() { morph.replaceChildren(element("p", "lesson06-card-label", moves[index][0]), formula(moves[index][1], "lesson06-formula lesson06-morph-formula")); next.disabled = index === 4; } next.addEventListener("click", () => { index = Math.min(4, index + 1); render(); }); root.append(element("p", "lesson06-question", "数字配方的每一步都可以推广到字母；最后把括号写成 x-h，公式来源就清楚了。"), morph, next); render(); }

function renderFormulaCards(root) { const cards = element("div", "lesson06-formula-cards"); cards.append(card("对称轴 (axis of symmetry)", "x=-\\frac{b}{2a}", "x=-b/(2a)", "lesson06AxisFormula"), card("顶点 (vertex)", "\\left(-\\frac{b}{2a},\\frac{4ac-b^2}{4a}\\right)", "(-b/(2a), (4ac-b²)/(4a))", "lesson06VertexFormula")); root.append(element("p", "lesson06-question", "这些公式不是孤立背诵的结论；它们来自刚才的配方过程。"), cards, element("p", "lesson06-conclusion", "配方 → 顶点式 → 对比 y=a(x-h)²+k：h=-b/(2a)，k=(4ac-b²)/(4a)。")); }

function renderDual(root, _change, cleanup) { const general = { a: 2, b: -8, c: 3 }; const vertex = vertexFromGeneral(general); const layout = element("div", "lesson06-dual-layout"); const comparison = element("div", "lesson06-comparison"); comparison.append(card("一般式 (general form)", "y=2x^2-8x+3", generalText(general), "lesson06DualGeneral"), card("顶点式 (vertex form)", "y=2(x-2)^2-5", vertexText(vertex), "lesson06DualVertex"), element("p", "lesson06-conclusion", "一般式便于展开/代点；顶点式便于读顶点、对称轴和最值。两式描述的是同一条抛物线。")); const graphPanel = element("div", "lesson06-graph-panel"); addGraph(graphPanel, vertex, cleanup, "一般式与顶点式表示的同一条抛物线"); layout.append(comparison, graphPanel); root.append(layout); }

function choose(values, random) { return values[Math.min(values.length - 1, Math.floor(Math.max(0, Math.min(.999999, Number(random()) || 0)) * values.length))]; }
function makeChallenge(random) { const vertex = { a: choose([1, 2, -1], random), h: choose([-3, -2, -1, 1, 2, 3], random), k: choose([-3, -2, -1, 1, 2, 3], random) }; return { vertex, general: { a: vertex.a, b: -2 * vertex.a * vertex.h, c: vertex.a * vertex.h * vertex.h + vertex.k } }; }
function renderChallenge(root, _change, cleanup, random) { const prompt = element("div", "lesson06-question"); const answer = element("div", "lesson06-answer"); answer.dataset.lesson06ChallengeAnswer = ""; answer.hidden = true; const graphPanel = element("div", "lesson06-graph-panel"); graphPanel.hidden = true; const graph = addGraph(graphPanel, { a: 1, h: 0, k: 0 }, cleanup, "随机挑战图象"); const control = reveal("Reveal Answer", "lesson06ChallengeReveal"); const next = button("New Challenge", "lesson06-action lesson06-secondary"); let challenge; function render() { challenge = makeChallenge(random); prompt.replaceChildren(element("span", "", "只给一般式："), formula(generalText(challenge.general), "lesson06-formula lesson06-hero"), element("span", "", "请口答对称轴与顶点。")); answer.hidden = true; graphPanel.hidden = true; } control.addEventListener("click", () => { answer.replaceChildren(formula(vertexText(challenge.vertex)), element("p", "", "对称轴 (axis of symmetry)：x=" + number(challenge.vertex.h) + "；顶点 (vertex)：(" + number(challenge.vertex.h) + ", " + number(challenge.vertex.k) + ")。")); answer.hidden = false; graphPanel.hidden = false; updateGraph(graph, challenge.vertex, vertexText(challenge.vertex) + " 的图象"); }); next.addEventListener("click", render); const actions = element("div", "lesson06-actions"); actions.append(control, next); root.append(element("p", "lesson06-prompt", "题目先从简单顶点式随机展开而来；只练习读对称轴和顶点，不做题库或计分。"), prompt, actions, answer, graphPanel); render(); }
function appendDerivationLine(host, move, dataset, latex = move.latex) {
  const line = element("article", "lesson06-derivation-line lesson06-tone-" + move.tone);
  line.dataset[dataset] = "";
  line.append(element("p", "lesson06-card-label", move.label), formula(latex, "lesson06-formula lesson06-morph-formula"), element("p", "lesson06-change-note", move.note));
  host.append(line);
  return line;
}

function setDerivationFormula(line, latex) {
  const host = line.querySelector(".lesson06-morph-formula");
  renderFormula(host, latex, { ariaLabel: latex, displayMode: true });
}

function renderDemoDetailed(root, _change, cleanup) {
  const moves = [
    { label: "原式", latex: "y=2x^2-8x+3", note: "先观察含 x 的两项：2x² 和 -8x。" },
    { label: "① 提出公因式 2", latex: "y=2(x^2-4x)+3", frames: [
      { latex: "y=\\color{#c25443}{2x^2-8x}+3", note: "先把要变化的两项标成红色。" },
      { latex: "y=\\color{#c25443}{2\\cdot x^2}-\\color{#c25443}{2\\cdot4x}+3", note: "把 2x² 和 -8x 拆成含 2 的乘法。" },
      { latex: "y=\\color{#197b9b}{2}(x^2-4x)+3", note: "两个 2 一起移到括号外，括号内留下 x²-4x。" },
    ], note: "批注：提出公因式 2。" },
    { label: "② 凑完全平方", latex: "y=2[(x^2-4x+4)-4]+3", frames: [
      { latex: "y=2(\\color{#c88818}{x^2-4x})+3", note: "一次项系数是 -4；先取一半，得到 -2。" },
      { latex: "y=2[(x^2-4x\\color{#c88818}{+(-2)^2})\\color{#c88818}{-(-2)^2}]+3", note: "在括号内同时加上和减去 (-2)²，式子的值不变。" },
      { latex: "y=2[(x^2-4x\\color{#c88818}{+4})\\color{#c88818}{-4}]+3", note: "把 (-2)² 算成 4；+4 凑平方，-4 做补偿。" },
    ], note: "批注：凑完全平方，补 +4，同时减去 4。" },
    { label: "③ 合成完全平方", latex: "y=2[(x-2)^2-4]+3", frames: [
      { latex: "y=2[\\color{#197b9b}{x^2-4x+4}-4]+3", note: "蓝色三项正好是一个完全平方。" },
      { latex: "y=2[\\color{#197b9b}{(x-2)^2}-4]+3", note: "x²-4x+4 合并成 (x-2)²。" },
    ], note: "批注：合成完全平方。" },
    { label: "④ 分配括号外的 2", latex: "y=2(x-2)^2-8+3", frames: [
      { latex: "y=2(x-2)^2+\\color{#1b765d}{2(-4)}+3", note: "括号外的 2 只需要乘补偿项 -4。" },
      { latex: "y=2(x-2)^2+\\color{#1b765d}{(-8)}+3", note: "2×(-4) 合并为 -8。" },
    ], note: "批注：把 2 分配给 -4。" },
    { label: "⑤ 合并常数", latex: "y=2(x-2)^2-5", frames: [
      { latex: "y=2(x-2)^2+\\color{#7653a6}{(-8+3)}", note: "只剩两个常数需要合并。" },
      { latex: "y=2(x-2)^2+\\color{#7653a6}{(-5)}", note: "-8+3=-5，顶点式出现。" },
    ], note: "批注：合并同类项。" },
  ];
  const frameDelay = 1450;
  let index = 0;
  let playing = false;
  const timers = [];
  const sequence = element("div", "lesson06-derivation-sequence lesson06-demo-sequence");
  const stage = element("section", "lesson06-equation-stage"); stage.dataset.lesson06DemoStage = "";
  const label = element("p", "lesson06-card-label");
  const formulaHost = element("div", "lesson06-formula lesson06-hero lesson06-stage-formula"); formulaHost.dataset.lesson06DemoFormula = "";
  const note = element("p", "lesson06-change-note");
  const status = element("p", "lesson06-status");
  const actions = element("div", "lesson06-motion-controls");
  const previous = button("回到上一步", "lesson06-action lesson06-secondary"); previous.dataset.lesson06DemoPrevious = "";
  const next = button("下一步（播放变化）"); next.dataset.lesson06DemoNext = "";
  actions.append(previous, next);
  const result = element("div", "lesson06-demo-result"); result.dataset.lesson06DemoResult = ""; result.hidden = true;
  cleanup.push(() => timers.forEach((timer) => window.clearTimeout(timer)));
  function show(latex, caption, animate = false) {
    formulaHost.classList.remove("lesson06-stage-formula-moving");
    renderFormula(formulaHost, latex, { ariaLabel: latex, displayMode: true });
    note.textContent = caption;
    if (animate) {
      void formulaHost.offsetWidth;
      formulaHost.classList.add("lesson06-stage-formula-moving");
    }
  }
  function syncControls() {
    const done = index === moves.length - 1;
    previous.disabled = playing || index === 0;
    next.disabled = playing || done;
    result.hidden = !done;
    if (done) result.textContent = "现在已经得到顶点式 y=2(x-2)²-5；下一页再用它读顶点与对称轴。";
  }
  function appendStableLine(move) {
    const line = element("article", "lesson06-derivation-line lesson06-demo-line");
    line.dataset.lesson06DemoLine = "";
    line.append(element("p", "lesson06-card-label", move.label), formula(move.latex, "lesson06-formula lesson06-morph-formula"));
    sequence.append(line);
  }
  function showStable() {
    const current = moves[index];
    const lastFormula = sequence.lastElementChild?.querySelector(".lesson06-morph-formula")?.getAttribute("aria-label");
    if (lastFormula !== current.latex) appendStableLine(current);
    stage.hidden = true;
    status.textContent = "已保留第 " + (index + 1) + " / " + moves.length + " 步；需要时可回到上一步再看。";
    syncControls();
  }
  function playFrame(move, frameIndex) {
    const frame = move.frames[frameIndex];
    stage.hidden = false;
    label.textContent = move.label;
    show(frame.latex, frame.note, true);
    if (frameIndex + 1 < move.frames.length) {
      timers.push(window.setTimeout(() => playFrame(move, frameIndex + 1), frameDelay));
      return;
    }
    timers.push(window.setTimeout(() => {
      index += 1;
      playing = false;
      showStable();
    }, frameDelay));
  }
  function playNext() {
    if (playing || index >= moves.length - 1) return;
    playing = true;
    syncControls();
    playFrame(moves[index + 1], 0);
  }
  function goPrevious() {
    if (playing || index === 0) return;
    sequence.lastElementChild.remove();
    index -= 1;
    stage.hidden = true;
    status.textContent = "已回到第 " + (index + 1) + " / " + moves.length + " 步；可再次播放下一步变化。";
    syncControls();
  }
  next.addEventListener("click", playNext);
  previous.addEventListener("click", goPrevious);
  stage.append(label, formulaHost, note);
  root.append(element("p", "lesson06-question", "不展示无关图像。每次点击后，只在当前等式上观看关键项怎样拆开、移动并合并；完成后的等式会保留在下一行。"), sequence, stage, actions, status, result);
  showStable();
}

function renderSymbolicDetailed(root, _change, cleanup) {
  const moves = [
    { label: "一般式", latex: "y=ax^2+bx+c", tone: "base", note: "批注：先观察含 x 的两项。" },
    { label: "① 提出 a", latex: "y=a(x^2+\\frac{b}{a}x)+c", fromLatex: "y=\\color{#c25443}{ax^2+bx}+c", toLatex: "y=\\color{#c25443}{a(x^2+\\frac{b}{a}x)}+c", tone: "a", note: "批注：提出公因式 a。" },
    { label: "② 计算要补的数", latex: "(\\frac{b}{2a})^2=\\frac{b^2}{4a^2}", fromLatex: "\\color{#c88818}{\\frac{b}{a}}", toLatex: "\\color{#c88818}{(\\frac{b}{2a})^2=\\frac{b^2}{4a^2}}", tone: "square", note: "批注：取一次项系数的一半，再平方。" },
    { label: "③ 同时加减该数", latex: "y=a[(x^2+\\frac{b}{a}x+\\frac{b^2}{4a^2})-\\frac{b^2}{4a^2}]+c", fromLatex: "y=a[x^2+\\frac{b}{a}x]+c", toLatex: "y=a[(x^2+\\frac{b}{a}x\\color{#1b765d}{+\\frac{b^2}{4a^2}})\\color{#1b765d}{-\\frac{b^2}{4a^2}}]+c", tone: "square", note: "批注：凑完全平方，同时加减同一个数。" },
    { label: "④ 合成完全平方", latex: "y=a[(x+\\frac{b}{2a})^2-\\frac{b^2}{4a^2}]+c", fromLatex: "y=a[\\color{#197b9b}{x^2+\\frac{b}{a}x+\\frac{b^2}{4a^2}}-\\frac{b^2}{4a^2}]+c", toLatex: "y=a[\\color{#197b9b}{(x+\\frac{b}{2a})^2}-\\frac{b^2}{4a^2}]+c", tone: "vertex", note: "批注：合成完全平方。" },
    { label: "⑤ 把 a 乘回去", latex: "y=a(x+\\frac{b}{2a})^2-\\frac{b^2}{4a}+c", fromLatex: "y=a(x+\\frac{b}{2a})^2+\\color{#c25443}{a(-\\frac{b^2}{4a^2})}+c", toLatex: "y=a(x+\\frac{b}{2a})^2\\color{#c25443}{-\\frac{b^2}{4a}}+c", tone: "a", note: "批注：把 a 分配给补偿项。" },
    { label: "⑥ 合并常数", latex: "y=a(x+\\frac{b}{2a})^2+\\frac{4ac-b^2}{4a}", fromLatex: "y=a(x+\\frac{b}{2a})^2+\\color{#7653a6}{c-\\frac{b^2}{4a}}", toLatex: "y=a(x+\\frac{b}{2a})^2+\\color{#7653a6}{\\frac{4ac-b^2}{4a}}", tone: "vertex", note: "批注：通分后合并同类项。" },
    { label: "⑦ 对齐顶点式", latex: "y=a[x-(-\\frac{b}{2a})]^2+\\frac{4ac-b^2}{4a}", fromLatex: "y=a[\\color{#197b9b}{x+\\frac{b}{2a}}]^2+\\frac{4ac-b^2}{4a}", toLatex: "y=a[\\color{#197b9b}{x-(-\\frac{b}{2a})}]^2+\\frac{4ac-b^2}{4a}", tone: "vertex", note: "批注：改写成 x-h，便于读出 h 与 k。" },
  ];
  moves[1].motion = { title: "把 a 从前两项提出", before: "y=ax^2+bx+c", after: "y=a(x^2+\\frac{b}{a}x)+c", tokens: [{ from: "ax^2", to: "a\\cdot x^2", cue: "a 提到括号外" }, { from: "bx", to: "\\frac{b}{a}x", cue: "bx ÷ a → (b/a)x" }, { from: "+c", to: "+c", cue: "常数留在外面" }], note: "a 向外移动后，括号内每一项都要除以 a；因此 bx 变成 (b/a)x。" };
  moves[2].motion = { title: "从一次项系数找到补数", before: "\\frac{b}{a}", after: "(\\frac{b}{2a})^2=\\frac{b^2}{4a^2}", tokens: [{ from: "\\frac{b}{a}", to: "\\frac{b}{2a}", cue: "先取一半" }, { from: "\\frac{b}{2a}", to: "(\\frac{b}{2a})^2", cue: "再平方" }, { from: "", to: "\\frac{b^2}{4a^2}", cue: "得到补数" }], note: "这一步不是跳出新公式：它把一次项系数 b/a 依次“除以 2、再平方”。" };
  moves[3].motion = { title: "把同一个补数加回又减回", before: "x^2+\\frac{b}{a}x", after: "x^2+\\frac{b}{a}x+\\frac{b^2}{4a^2}-\\frac{b^2}{4a^2}", tokens: [{ from: "\\frac{b^2}{4a^2}", to: "+\\frac{b^2}{4a^2}", cue: "补进平方" }, { from: "\\frac{b^2}{4a^2}", to: "-\\frac{b^2}{4a^2}", cue: "同时减回" }], note: "同一个数一正一负地移动进式子，函数值不变，但前面三项已能合成平方。" };
  moves[4].motion = { title: "让前三项合成平方", before: "x^2+\\frac{b}{a}x+\\frac{b^2}{4a^2}", after: "(x+\\frac{b}{2a})^2", tokens: [{ from: "x^2", to: "(x+\\frac{b}{2a})^2", cue: "第一项" }, { from: "\\frac{b}{a}x", to: "2\\cdot\\frac{b}{2a}x", cue: "中间项" }, { from: "\\frac{b^2}{4a^2}", to: "(\\frac{b}{2a})^2", cue: "末项" }], note: "这三部分逐项对应平方公式，因此可以收拢成 (x+b/(2a))²。" };
  moves[5].motion = { title: "让外面的 a 乘回补偿项", before: "a(-\\frac{b^2}{4a^2})", after: "-\\frac{b^2}{4a}", tokens: [{ from: "a", to: "a/a^2", cue: "约去一个 a" }, { from: "-\\frac{b^2}{4a^2}", to: "-\\frac{b^2}{4a}", cue: "乘回去" }], note: "外面的 a 与分母 a² 约掉一个 a，所以补偿项变成 -b²/(4a)。" };
  moves[6].motion = { title: "把常数通分到同一分母", before: "c-\\frac{b^2}{4a}", after: "\\frac{4ac-b^2}{4a}", tokens: [{ from: "c", to: "\\frac{4ac}{4a}", cue: "c 通分" }, { from: "-\\frac{b^2}{4a}", to: "-\\frac{b^2}{4a}", cue: "分母不变" }], note: "c 先写成 4ac/(4a)，再与 -b²/(4a) 合并为一个常数项。" };
  moves[7].motion = { title: "把加号写成顶点式里的减号", before: "x+\\frac{b}{2a}", after: "x-(-\\frac{b}{2a})", tokens: [{ from: "+\\frac{b}{2a}", to: "-(-\\frac{b}{2a})", cue: "同一个量" }, { from: "\\frac{4ac-b^2}{4a}", to: "k", cue: "平方外常数" }], note: "x+b/(2a) 改写为 x-(-b/(2a)) 后，就能一眼对齐 x-h，直接读出 h 与 k。" };
  let index = 0;
  const sequence = element("div", "lesson06-derivation-sequence");
  const actions = element("div", "lesson06-motion-controls");
  const previous = button("回到上一步", "lesson06-action lesson06-secondary"); previous.dataset.lesson06SymbolicPrevious = "";
  const next = button("下一步（播放变化）"); next.dataset.lesson06SymbolicNext = "";
  actions.append(previous, next);
  const hkPanel = element("section", "lesson06-hk-panel"); hkPanel.hidden = true;
  const mapping = document.createElement("table"); mapping.className = "lesson06-hk-table";
  mapping.innerHTML = "<thead><tr><th>顶点式结构</th><th>本题最终式</th><th>读出的量</th></tr></thead><tbody><tr><td>y=a(x-h)²+k</td><td>y=a[x-(-b/(2a))]²+(4ac-b²)/(4a)</td><td>先找 h 与 k</td></tr><tr><td>括号内 x-h</td><td>x-(-b/(2a))</td><td>h=-b/(2a)</td></tr><tr><td>平方外常数 k</td><td>(4ac-b²)/(4a)</td><td>k=(4ac-b²)/(4a)</td></tr></tbody>";
  const hkPrompt = element("p", "lesson06-question", "现在先请学生说一说：这一式中 h 是谁？k 是谁？再按顶点式的结构直接读出对称轴与顶点。");
  const hkReveal = reveal("Reveal h 与 k", "lesson06HkReveal"); hkReveal.hidden = true;
  const hkAnswer = element("div", "lesson06-answer"); hkAnswer.dataset.lesson06HkAnswer = ""; hkAnswer.hidden = true;
  hkAnswer.append(
    element("p", "", "因为对称轴 (axis of symmetry) 是 x=h，所以一般式可以直接读出："),
    formula("x=-b/(2a)", "lesson06-formula", "lesson06DirectAxis"),
    element("p", "", "因为顶点 (vertex) 是 (h,k)，所以一般式的顶点是："),
    formula("(-b/(2a), (4ac-b²)/(4a))", "lesson06-formula", "lesson06DirectVertex"),
    element("p", "", "记住这两个公式后，平时不必每次都重新配方；配方用于理解公式从哪里来，公式用于快速读图。"),
  );
  hkReveal.addEventListener("click", () => { hkAnswer.hidden = false; });
  function syncControls() { const done = index === moves.length; previous.disabled = index <= 1; next.disabled = done; hkPanel.hidden = !done; hkReveal.hidden = !done; if (!done) hkAnswer.hidden = true; }
  function showLine() { appendDerivationLine(sequence, moves[index], "lesson06SymbolicLine", moves[index].toLatex); index += 1; syncControls(); }
  function playNext() { if (index >= moves.length) return; const lines = sequence.querySelectorAll("[data-lesson06-symbolic-line]"); if (lines.length > 1) setDerivationFormula(lines[lines.length - 2], moves[index - 2].latex); setDerivationFormula(sequence.lastElementChild, moves[index].fromLatex); showLine(); }
  function goPrevious() { if (index <= 1) return; sequence.lastElementChild.remove(); index -= 1; setDerivationFormula(sequence.lastElementChild, moves[index - 1].toLatex || moves[index - 1].latex); syncControls(); }
  next.addEventListener("click", playNext);
  previous.addEventListener("click", goPrevious);
  hkPanel.append(hkPrompt, mapping, hkReveal, hkAnswer);
  root.append(element("p", "lesson06-question", "把数字例题的每一个动作完整搬到字母式：每次只看关键量怎样移动，完成后再读下一条等式。"), sequence, actions, hkPanel);
  showLine();
}

function renderGeneralFormula(root) {
  const derivation = element("section", "lesson06-compact-derivation"); derivation.dataset.lesson06CompactDerivation = "";
  derivation.append(
    element("p", "lesson06-card-label", "把一般式配方后的结果"),
    formula("y=a[x-(-\\frac{b}{2a})]^2+\\frac{4ac-b^2}{4a}", "lesson06-formula lesson06-hero", "lesson06CompletedGeneral"),
    element("p", "lesson06-card-label", "与顶点式结构对齐"),
    formula("y=a(x-h)^2+k", "lesson06-formula", "lesson06VertexTemplate"),
  );
  const prompt = element("p", "lesson06-question", "请先说出 h 和 k 分别是谁：括号内要写成 x-h，平方外的常数就是 k。再用它们读出对称轴与顶点。");
  const revealAnswer = reveal("Reveal h 与 k", "lesson06HkReveal");
  const answer = element("div", "lesson06-answer"); answer.dataset.lesson06HkAnswer = ""; answer.hidden = true;
  answer.append(
    element("p", "", "h=-b/(2a)，k=(4ac-b²)/(4a)。因此不必每一题都重新写完整配方过程。"),
    element("p", "", "对称轴 (axis of symmetry)："),
    formula("x=-b/(2a)", "lesson06-formula", "lesson06DirectAxis"),
    element("p", "", "顶点 (vertex)："),
    formula("(-b/(2a), (4ac-b²)/(4a))", "lesson06-formula", "lesson06DirectVertex"),
    element("p", "", "理解公式时看配方；做题读图时，直接记住并套用这两个结论。"),
  );
  revealAnswer.addEventListener("click", () => { answer.hidden = false; });
  root.append(element("p", "lesson06-prompt", "中间推导不在这里重复展开：先看配方后的结果，再把它与顶点式一一对应。"), derivation, prompt, revealAnswer, answer);
}

function addPracticeGraph(host, parameters, cleanup, ariaLabel) {
  const graph = createParabolaGraph(host, { viewport: VIEWPORT, curves: [{ ...parameters, color: COLORS.curve }], points: [], guides: [], labels: [], ariaLabel });
  cleanup.push(() => graph.destroy());
  return graph;
}

function updatePracticeGraph(graph, parameters, ariaLabel) {
  graph.update({ curves: [{ ...parameters, color: COLORS.curve }], points: [], guides: [], labels: [], ariaLabel });
}

function renderChallengeDetailed(root, _change, cleanup, random) {
  root.classList.add("lesson06-challenge-step");
  const prompt = element("div", "lesson06-question");
  const answer = element("div", "lesson06-answer"); answer.dataset.lesson06ChallengeAnswer = ""; answer.hidden = true;
  const graphPanel = element("div", "lesson06-graph-panel lesson06-challenge-graph"); graphPanel.dataset.lesson06ChallengeGraph = "";
  const graph = addPracticeGraph(graphPanel, { a: 1, h: 0, k: 0 }, cleanup, "随机挑战图象");
  const control = reveal("Reveal Answer", "lesson06ChallengeReveal");
  const next = button("New Challenge", "lesson06-action lesson06-secondary");
  const actions = element("div", "lesson06-actions"); actions.append(control, next);
  const left = element("section", "lesson06-challenge-copy"); left.append(element("p", "lesson06-prompt", "快问快答：不改写顶点式。读出 a、b、c 后，直接套用公式。"), prompt, actions, answer);
  const layout = element("div", "lesson06-challenge-layout"); layout.append(left, graphPanel);
  let challenge;
  function render() {
    challenge = makeChallenge(random);
    prompt.replaceChildren(element("span", "", "只给一般式："), formula(generalText(challenge.general), "lesson06-formula lesson06-hero"), element("span", "", "请直接说出 a、b、c、对称轴和顶点。"));
    answer.hidden = true;
    updatePracticeGraph(graph, challenge.vertex, generalText(challenge.general) + " 的图象");
  }
  control.addEventListener("click", () => {
    answer.replaceChildren(
      element("p", "", "先读系数：a=" + number(challenge.general.a) + "，b=" + number(challenge.general.b) + "，c=" + number(challenge.general.c) + "。"),
      element("p", "", "把 a、b 代入对称轴公式："),
      formula("x=-\\frac{b}{2a}=-\\frac{" + number(challenge.general.b) + "}{2\\cdot" + number(challenge.general.a) + "}=" + number(challenge.vertex.h), "lesson06-formula", "lesson06ChallengeAxisFormula"),
      element("p", "", "所以对称轴是 x=" + number(challenge.vertex.h) + "。把 a、b、c 代入顶点公式："),
      formula("\\left(-\\frac{b}{2a},\\frac{4ac-b^2}{4a}\\right)=(" + number(challenge.vertex.h) + "," + number(challenge.vertex.k) + ")", "lesson06-formula", "lesson06ChallengeVertexFormula"),
      element("p", "", "所以顶点是 (" + number(challenge.vertex.h) + ", " + number(challenge.vertex.k) + ")。"),
    );
    answer.hidden = false;
    updateGraph(graph, challenge.vertex, generalText(challenge.general) + " 的图象；已标出顶点与对称轴");
  });
  next.addEventListener("click", render);
  root.append(layout);
  render();
}

function renderSummary(root) { const route = element("div", "lesson06-summary-route"); ["一般式 (general form)", "配方法 (completing the square)", "顶点式 (vertex form)", "顶点 / 对称轴"].forEach((label, index) => { route.append(element("strong", "lesson06-route-node", label)); if (index < 3) route.append(element("span", "lesson06-route-arrow", "→")); }); root.append(route, element("p", "lesson06-bridge-out", "Bridge Out：令 y=0，一般式 y=ax²+bx+c 会变成一元二次方程；下一课将研究它与 x 轴的交点。")); }

const RENDERERS = Object.freeze([renderBridge, renderDemoDetailed, renderInteractive, renderChallengeDetailed, renderSummary]);
export function renderLesson06(stage, { step = 1, onStepChange = () => {}, random = Math.random }) { const safeStep = Math.min(LESSON06_STEP_TITLES.length, Math.max(1, Number(step) || 1)); const cleanup = []; const root = createRoot(safeStep); RENDERERS[safeStep - 1](root, onStepChange, cleanup, random); appendNavigation(root, safeStep, onStepChange); stage.replaceChildren(root); return { destroy() { cleanup.forEach((dispose) => dispose()); } }; }
