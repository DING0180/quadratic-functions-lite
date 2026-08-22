import { renderFormula } from "../formula.js";
import { createParabolaGraph } from "../graph/parabola-svg.js";
import "./lesson06.css";

const VIEWPORT = Object.freeze({ xMin: -6, xMax: 6, yMin: -8, yMax: 12, yTickStep: 2 });
const COLORS = Object.freeze({ curve: "#19735d", vertex: "#c88818" });
export const LESSON06_STEP_TITLES = Object.freeze(["Bridge In：两种形式", "教师示范：配方法", "互动配方：轮到你", "从数字到字母", "Axis & Vertex Formula", "双表示视图", "Quick Random Challenge", "Summary + Bridge Out"]);

function element(tag, className = "", text = "") { const node = document.createElement(tag); if (className) node.className = className; if (text) node.textContent = text; return node; }
function button(text, className = "lesson06-action") { const node = element("button", className, text); node.type = "button"; return node; }
function number(value) { return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(4))); }
function signed(value) { return value === 0 ? "" : value > 0 ? "+" + number(value) : number(value); }
function vertexText({ a, h, k }) { const coefficient = a === 1 ? "" : a === -1 ? "-" : number(a); const inside = h === 0 ? "x" : "x" + (h > 0 ? "-" : "+") + number(Math.abs(h)); return "y=" + coefficient + "(" + inside + ")²" + signed(k); }
function generalText({ a, b, c }) { return "y=" + (a === 1 ? "" : a === -1 ? "-" : number(a)) + "x²" + (b === 0 ? "" : b > 0 ? "+" + number(b) + "x" : number(b) + "x") + signed(c); }
function formula(text, className = "lesson06-formula", dataset = "") { const node = element("div", className); if (dataset) node.dataset[dataset] = ""; renderFormula(node, text.replaceAll("²", "^2"), { ariaLabel: text, displayMode: true }); return node; }
function card(label, latex, ariaLabel, dataset) { const node = element("article", "lesson06-form-card"); const host = element("div", "lesson06-formula"); host.dataset[dataset] = ""; renderFormula(host, latex, { ariaLabel, displayMode: true }); node.append(element("p", "lesson06-card-label", label), host); return node; }

export function vertexFromGeneral({ a, b, c }) { if (![a, b, c].every(Number.isFinite) || a === 0) throw new TypeError("general form needs finite non-zero a"); const h = -b / (2 * a); return { a, h, k: (4 * a * c - b * b) / (4 * a) }; }

function createRoot(step) { const root = element("section", "lesson06-step"); const heading = element("header", "lesson06-heading"); heading.append(element("p", "lesson06-kicker", "LESSON 06 · " + String(step).padStart(2, "0") + " / 08"), element("h2", "lesson06-title", LESSON06_STEP_TITLES[step - 1])); root.append(heading); return root; }
function appendNavigation(root, step, onStepChange) { const nav = element("nav", "lesson06-step-controls"); nav.setAttribute("aria-label", "Lesson 6 步骤导航"); const previous = button("上一步", "lesson06-action lesson06-secondary"); previous.disabled = step === 1; previous.addEventListener("click", () => onStepChange(Math.max(1, step - 1))); const next = button(step === 8 ? "回到本课开始" : "下一步"); next.addEventListener("click", () => onStepChange(step === 8 ? 1 : step + 1)); nav.append(previous, element("span", "lesson06-step-count", step + " / 8"), next); root.append(nav); }
function addGraph(host, parameters, cleanup, ariaLabel) { const graph = createParabolaGraph(host, { viewport: VIEWPORT, curves: [{ ...parameters, color: COLORS.curve }], points: [{ x: parameters.h, y: parameters.k, color: COLORS.vertex, radius: 5 }], guides: [{ x: parameters.h, color: COLORS.vertex }], labels: [{ x: Math.min(5, parameters.h + .25), y: Math.min(11, parameters.k + .8), text: "V(" + number(parameters.h) + ", " + number(parameters.k) + ")" }], ariaLabel }); cleanup.push(() => graph.destroy()); return graph; }
function updateGraph(graph, p, ariaLabel) { graph.update({ curves: [{ ...p, color: COLORS.curve }], points: [{ x: p.h, y: p.k, color: COLORS.vertex, radius: 5 }], guides: [{ x: p.h, color: COLORS.vertex }], labels: [{ x: Math.min(5, p.h + .25), y: Math.min(11, p.k + .8), text: "V(" + number(p.h) + ", " + number(p.k) + ")" }], ariaLabel }); }
function reveal(text, dataset) { const node = button(text); node.dataset[dataset] = ""; return node; }

function renderBridge(root) { const forms = element("div", "lesson06-forms"); forms.append(card("顶点式 (vertex form)", "y=a(x-h)^2+k", "y=a(x-h)²+k", "lesson06VertexForm"), element("strong", "lesson06-arrow", "↔"), card("一般式 (general form)", "y=ax^2+bx+c", "y=ax²+bx+c", "lesson06GeneralForm")); const control = reveal("Reveal Connection", "lesson06BridgeReveal"); const conclusion = element("p", "lesson06-conclusion", "同一条抛物线可以用两种形式表示：一般式便于展开与代点；顶点式便于读顶点、对称轴和最值。"); conclusion.hidden = true; control.addEventListener("click", () => { conclusion.hidden = false; }); root.append(element("p", "lesson06-question", "同一条抛物线能否在两种形式之间转换？"), forms, control, conclusion); }

function renderDemo(root, _change, cleanup) { const moves = [["原式", "y=2x^2-8x+3"], ["提取 a", "y=2(x^2-4x)+3"], ["加减同一个数", "y=2[(x^2-4x+4)-4]+3"], ["合成完全平方", "y=2(x-2)^2-8+3"], ["整理成顶点式", "y=2(x-2)^2-5"]]; let index = 0; const morph = element("div", "lesson06-morph"); const status = element("p", "lesson06-status"); const next = button("Next Move"); next.dataset.lesson06DemoNext = ""; const result = element("div", "lesson06-demo-result"); result.dataset.lesson06DemoResult = ""; result.hidden = true; const graphPanel = element("div", "lesson06-graph-panel"); graphPanel.hidden = true; addGraph(graphPanel, { a: 2, h: 2, k: -5 }, cleanup, "y=2(x-2)²-5 的图象"); function render() { morph.replaceChildren(element("p", "lesson06-card-label", moves[index][0]), formula(moves[index][1], "lesson06-formula lesson06-morph-formula")); status.textContent = "第 " + (index + 1) + " / 5 步：" + moves[index][0] + "。"; const done = index === 4; result.hidden = !done; graphPanel.hidden = !done; next.disabled = done; if (done) result.textContent = "顶点 (vertex)：(2, -5)；对称轴 (axis of symmetry)：x=2。"; } next.addEventListener("click", () => { index = Math.min(4, index + 1); render(); }); root.append(element("p", "lesson06-question", "每次只做一个配方动作：先把二次项系数提出，再在括号内加减同一个数。"), morph, next, status, result, graphPanel); render(); }

function renderInteractive(root, _change, cleanup) { const choices = element("div", "lesson06-choice-grid"); const status = element("p", "lesson06-status", "先判断下一步，再 Reveal。 "); [["提出 2", "先得到 2(x²+4x)+5。"], ["加减 4", "在括号内配成 (x+2)²。"], ["直接读顶点", "必须先改写成顶点式。"]].forEach(([text, feedback]) => { const choice = button(text, "lesson06-action lesson06-secondary"); choice.dataset.lesson06InteractiveChoice = ""; choice.addEventListener("click", () => { status.textContent = "已记录：" + feedback + "答案将在 Reveal 后展示。"; }); choices.append(choice); }); const answer = element("div", "lesson06-answer"); answer.dataset.lesson06InteractiveAnswer = ""; answer.hidden = true; const graphPanel = element("div", "lesson06-graph-panel"); graphPanel.hidden = true; addGraph(graphPanel, { a: 2, h: -2, k: -3 }, cleanup, "y=2(x+2)²-3 的图象"); const control = reveal("Reveal Answer", "lesson06InteractiveReveal"); control.addEventListener("click", () => { answer.replaceChildren(formula("y=2(x^2+4x)+5"), formula("y=2[(x+2)^2-4]+5"), formula("y=2(x+2)^2-3"), element("p", "", "所以 h=-2；顶点 (vertex) 是 (-2, -3)，对称轴 (axis of symmetry) 是 x=-2。")); answer.hidden = false; graphPanel.hidden = false; }); root.append(element("p", "lesson06-question", "把 y=2x²+8x+5 改写成顶点式。注意：(x+2)² 对应 h=-2。"), formula("y=2x^2+8x+5", "lesson06-formula lesson06-hero"), choices, status, control, answer, graphPanel); }

function renderSymbolic(root) { const moves = [["一般式", "y=ax^2+bx+c"], ["提出 a", "y=a(x^2+\\frac{b}{a}x)+c"], ["在括号内配方", "y=a[(x+\\frac{b}{2a})^2-\\frac{b^2}{4a^2}]+c"], ["整理", "y=a(x+\\frac{b}{2a})^2+\\frac{4ac-b^2}{4a}"], ["与顶点式对齐", "y=a[x-(-\\frac{b}{2a})]^2+\\frac{4ac-b^2}{4a}"]]; let index = 0; const morph = element("div", "lesson06-morph"); const next = button("Next Move"); next.dataset.lesson06SymbolicNext = ""; function render() { morph.replaceChildren(element("p", "lesson06-card-label", moves[index][0]), formula(moves[index][1], "lesson06-formula lesson06-morph-formula")); next.disabled = index === 4; } next.addEventListener("click", () => { index = Math.min(4, index + 1); render(); }); root.append(element("p", "lesson06-question", "数字配方的每一步都可以推广到字母；最后把括号写成 x-h，公式来源就清楚了。"), morph, next); render(); }

function renderFormulaCards(root) { const cards = element("div", "lesson06-formula-cards"); cards.append(card("对称轴 (axis of symmetry)", "x=-\\frac{b}{2a}", "x=-b/(2a)", "lesson06AxisFormula"), card("顶点 (vertex)", "\\left(-\\frac{b}{2a},\\frac{4ac-b^2}{4a}\\right)", "(-b/(2a), (4ac-b²)/(4a))", "lesson06VertexFormula")); root.append(element("p", "lesson06-question", "这些公式不是孤立背诵的结论；它们来自刚才的配方过程。"), cards, element("p", "lesson06-conclusion", "配方 → 顶点式 → 对比 y=a(x-h)²+k：h=-b/(2a)，k=(4ac-b²)/(4a)。")); }

function renderDual(root, _change, cleanup) { const general = { a: 2, b: -8, c: 3 }; const vertex = vertexFromGeneral(general); const layout = element("div", "lesson06-dual-layout"); const comparison = element("div", "lesson06-comparison"); comparison.append(card("一般式 (general form)", "y=2x^2-8x+3", generalText(general), "lesson06DualGeneral"), card("顶点式 (vertex form)", "y=2(x-2)^2-5", vertexText(vertex), "lesson06DualVertex"), element("p", "lesson06-conclusion", "一般式便于展开/代点；顶点式便于读顶点、对称轴和最值。两式描述的是同一条抛物线。")); const graphPanel = element("div", "lesson06-graph-panel"); addGraph(graphPanel, vertex, cleanup, "一般式与顶点式表示的同一条抛物线"); layout.append(comparison, graphPanel); root.append(layout); }

function choose(values, random) { return values[Math.min(values.length - 1, Math.floor(Math.max(0, Math.min(.999999, Number(random()) || 0)) * values.length))]; }
function makeChallenge(random) { const vertex = { a: choose([1, 2, -1], random), h: choose([-3, -2, -1, 1, 2, 3], random), k: choose([-3, -2, -1, 1, 2, 3], random) }; return { vertex, general: { a: vertex.a, b: -2 * vertex.a * vertex.h, c: vertex.a * vertex.h * vertex.h + vertex.k } }; }
function renderChallenge(root, _change, cleanup, random) { const prompt = element("div", "lesson06-question"); const answer = element("div", "lesson06-answer"); answer.dataset.lesson06ChallengeAnswer = ""; answer.hidden = true; const graphPanel = element("div", "lesson06-graph-panel"); graphPanel.hidden = true; const graph = addGraph(graphPanel, { a: 1, h: 0, k: 0 }, cleanup, "随机挑战图象"); const control = reveal("Reveal Answer", "lesson06ChallengeReveal"); const next = button("New Challenge", "lesson06-action lesson06-secondary"); let challenge; function render() { challenge = makeChallenge(random); prompt.replaceChildren(element("span", "", "只给一般式："), formula(generalText(challenge.general), "lesson06-formula lesson06-hero"), element("span", "", "请口答对称轴与顶点。")); answer.hidden = true; graphPanel.hidden = true; } control.addEventListener("click", () => { answer.replaceChildren(formula(vertexText(challenge.vertex)), element("p", "", "对称轴 (axis of symmetry)：x=" + number(challenge.vertex.h) + "；顶点 (vertex)：(" + number(challenge.vertex.h) + ", " + number(challenge.vertex.k) + ")。")); answer.hidden = false; graphPanel.hidden = false; updateGraph(graph, challenge.vertex, vertexText(challenge.vertex) + " 的图象"); }); next.addEventListener("click", render); const actions = element("div", "lesson06-actions"); actions.append(control, next); root.append(element("p", "lesson06-prompt", "题目先从简单顶点式随机展开而来；只练习读对称轴和顶点，不做题库或计分。"), prompt, actions, answer, graphPanel); render(); }
function appendDerivationLine(host, move, dataset) {
  const line = element("article", "lesson06-derivation-line lesson06-tone-" + move.tone);
  line.dataset[dataset] = "";
  line.append(element("p", "lesson06-card-label", move.label), formula(move.latex, "lesson06-formula lesson06-morph-formula"), element("p", "lesson06-change-note", move.note));
  host.append(line);
}

function appendTransformationMotion(host, move, dataset, cleanup, onComplete) {
  const motion = element("section", "lesson06-transform-motion lesson06-tone-" + move.tone);
  motion.dataset[dataset] = "";
  motion.setAttribute("aria-live", "polite");
  const bridge = move.motion;
  const heading = element("p", "lesson06-motion-heading", bridge.title);
  const tokens = element("div", "lesson06-motion-track");
  bridge.tokens.filter(({ from, to }) => from !== to).forEach(({ from, to }, index) => {
    const token = element("div", "lesson06-motion-token");
    token.dataset.lesson06MotionToken = "";
    token.style.setProperty("--motion-delay", String(index * 280) + "ms");
    token.append(formula(from, "lesson06-motion-term lesson06-motion-from"), element("span", "lesson06-motion-arrow", "→"), formula(to, "lesson06-motion-term lesson06-motion-to"));
    tokens.append(token);
  });
  const progress = element("div", "lesson06-motion-progress");
  progress.dataset.lesson06MotionProgress = "";
  motion.append(heading, tokens, progress);
  host.append(motion);
  let done = false;
  let timer;
  const finish = () => {
    if (done) return;
    done = true;
    window.clearTimeout(timer);
    motion.classList.add("is-complete");
    onComplete();
  };
  progress.addEventListener("animationend", finish, { once: true });
  timer = window.setTimeout(finish, 3500);
  cleanup.push(() => window.clearTimeout(timer));
  return motion;
}

function renderDemoDetailed(root, _change, cleanup) {
  const moves = [
    { label: "原式", latex: "y=2x^2-8x+3", tone: "base", note: "从一般式开始：先只关注含 x 的两项。" },
    { label: "① 把二次项系数提出", latex: "y=2(x^2-4x)+3", tone: "a", note: "红色：2 提到括号外；因此 -8x ÷ 2 变成 -4x。" },
    { label: "② 补出完全平方", latex: "y=2[(x^2-4x+4)-4]+3", tone: "square", note: "橙色：(-4 ÷ 2)²=4；必须同时 +4 和 -4，式子的值不变。" },
    { label: "③ 合成平方", latex: "y=2[(x-2)^2-4]+3", tone: "square", note: "橙色：x²-4x+4 正好就是 (x-2)²。" },
    { label: "④ 把括号外的 2 分配进去", latex: "y=2(x-2)^2-8+3", tone: "a", note: "红色：2×(-4)=-8；平方部分暂时保持不动。" },
    { label: "⑤ 合并常数", latex: "y=2(x-2)^2-5", tone: "vertex", note: "蓝色：-8+3=-5；现在与 y=a(x-h)²+k 完全对应。" },
  ];
  moves[1].motion = { title: "把 2 从含 x 的两项中提出", before: "y=2x^2-8x+3", after: "y=2(x^2-4x)+3", tokens: [{ from: "2x^2", to: "2\\cdot x^2", cue: "2 留在括号外" }, { from: "-8x", to: "-4x", cue: "-8x ÷ 2" }, { from: "+3", to: "+3", cue: "常数不进括号" }], note: "先看到 2 从 2x² 中“抽出”，再看到 -8x 同时 ÷2 变成 -4x；这就是提出 2 的全过程。" };
  moves[2].motion = { title: "补上 4，也同时减去 4", before: "x^2-4x", after: "x^2-4x+4-4", tokens: [{ from: "-4", to: "-4\\div2=-2", cue: "先取一半" }, { from: "(-2)^2", to: "+4", cue: "把平方补进来" }, { from: "", to: "-4", cue: "同时减回 4" }], note: "新出现的 +4 和 -4 成对加入，括号内的总值没有改变。" };
  moves[3].motion = { title: "把三项折叠成一个平方", before: "x^2-4x+4", after: "(x-2)^2", tokens: [{ from: "x^2", to: "(x-2)^2", cue: "平方的第一项" }, { from: "-4x", to: "-2\\cdot2x", cue: "中间项" }, { from: "+4", to: "(-2)^2", cue: "末项" }], note: "三项分别对上 (x-2)² 的展开式，所以它们可以合成一个平方。" };
  moves[4].motion = { title: "把括号外的 2 分配给 -4", before: "2[(x-2)^2-4]+3", after: "2(x-2)^2-8+3", tokens: [{ from: "2", to: "2", cue: "平方部分保持" }, { from: "2\\cdot(-4)", to: "-8", cue: "只分配给常数 -4" }, { from: "+3", to: "+3", cue: "继续保留" }], note: "2 只乘到括号里的 -4，得到 -8；平方项仍是 2(x-2)²。" };
  moves[5].motion = { title: "合并两个常数", before: "-8+3", after: "-5", tokens: [{ from: "-8", to: "-5", cue: "与 +3 合并" }, { from: "+3", to: "", cue: "完成计算" }], note: "常数相加后，顶点式 y=2(x-2)²-5 就完整出现。" };
  let index = 0;
  let animating = false;
  const sequence = element("div", "lesson06-derivation-sequence");
  const status = element("p", "lesson06-status");
  const actions = element("div", "lesson06-motion-controls");
  const previous = button("回到上一步", "lesson06-action lesson06-secondary"); previous.dataset.lesson06DemoPrevious = "";
  const next = button("下一步（播放变化）"); next.dataset.lesson06DemoNext = "";
  actions.append(previous, next);
  const result = element("div", "lesson06-demo-result"); result.dataset.lesson06DemoResult = ""; result.hidden = true;
  const graphPanel = element("div", "lesson06-graph-panel"); graphPanel.hidden = true;
  addGraph(graphPanel, { a: 2, h: 2, k: -5 }, cleanup, "y=2(x-2)²-5 的图象");
  function syncControls() { const done = index === moves.length; previous.disabled = animating || index <= 1; next.disabled = animating || done; result.hidden = !done; graphPanel.hidden = !done; if (done) result.textContent = "顶点 (vertex)：(2, -5)；对称轴 (axis of symmetry)：x=2。"; }
  function showLine() { appendDerivationLine(sequence, moves[index], "lesson06DemoLine"); status.textContent = "已展示 " + (index + 1) + " / " + moves.length + " 步；前面的等式保留在上方，便于逐项对照。"; index += 1; animating = false; syncControls(); }
  function playNext() { if (index >= moves.length || animating) return; animating = true; syncControls(); appendTransformationMotion(sequence, moves[index], "lesson06DemoMotion", cleanup, showLine); }
  function goPrevious() { if (index <= 1 || animating) return; sequence.lastElementChild.remove(); sequence.lastElementChild.remove(); index -= 1; status.textContent = "已回到第 " + index + " 步；可以再次播放下一次变化。"; syncControls(); }
  next.addEventListener("click", playNext);
  previous.addEventListener("click", goPrevious);
  root.append(element("p", "lesson06-question", "不要跳步：每一行都保留；点击下一步后，只看关键项如何拆开、移动并合成。"), sequence, actions, status, result, graphPanel);
  showLine();
}

function renderSymbolicDetailed(root, _change, cleanup) {
  const moves = [
    { label: "一般式", latex: "y=ax^2+bx+c", tone: "base", note: "从一般式开始，目标是把含 x 的部分凑成一个平方。" },
    { label: "① 提出 a", latex: "y=a(x^2+\\frac{b}{a}x)+c", tone: "a", note: "红色：把 a 从前两项提出，括号内的一次项变成 (b/a)x。" },
    { label: "② 计算要补的数", latex: "(\\frac{b}{2a})^2=\\frac{b^2}{4a^2}", tone: "square", note: "橙色：一次项系数 b/a 的一半是 b/(2a)，平方后就是要补的数。" },
    { label: "③ 同时加减该数", latex: "y=a[(x^2+\\frac{b}{a}x+\\frac{b^2}{4a^2})-\\frac{b^2}{4a^2}]+c", tone: "square", note: "橙色：括号内 + 和 - 同一个数，函数值保持不变。" },
    { label: "④ 合成完全平方", latex: "y=a[(x+\\frac{b}{2a})^2-\\frac{b^2}{4a^2}]+c", tone: "square", note: "橙色：前三项合成为 (x+b/(2a))²。" },
    { label: "⑤ 把 a 乘回去", latex: "y=a(x+\\frac{b}{2a})^2-\\frac{b^2}{4a}+c", tone: "a", note: "红色：a×[-b²/(4a²)]=-b²/(4a)。" },
    { label: "⑥ 合并常数", latex: "y=a(x+\\frac{b}{2a})^2+\\frac{4ac-b^2}{4a}", tone: "vertex", note: "蓝色：c-b²/(4a) 通分后得到 (4ac-b²)/(4a)。" },
    { label: "⑦ 对齐顶点式", latex: "y=a[x-(-\\frac{b}{2a})]^2+\\frac{4ac-b^2}{4a}", tone: "vertex", note: "蓝色：与 y=a(x-h)²+k 对比，h=-b/(2a)，k=(4ac-b²)/(4a)。" },
  ];
  moves[1].motion = { title: "把 a 从前两项提出", before: "y=ax^2+bx+c", after: "y=a(x^2+\\frac{b}{a}x)+c", tokens: [{ from: "ax^2", to: "a\\cdot x^2", cue: "a 提到括号外" }, { from: "bx", to: "\\frac{b}{a}x", cue: "bx ÷ a → (b/a)x" }, { from: "+c", to: "+c", cue: "常数留在外面" }], note: "a 向外移动后，括号内每一项都要除以 a；因此 bx 变成 (b/a)x。" };
  moves[2].motion = { title: "从一次项系数找到补数", before: "\\frac{b}{a}", after: "(\\frac{b}{2a})^2=\\frac{b^2}{4a^2}", tokens: [{ from: "\\frac{b}{a}", to: "\\frac{b}{2a}", cue: "先取一半" }, { from: "\\frac{b}{2a}", to: "(\\frac{b}{2a})^2", cue: "再平方" }, { from: "", to: "\\frac{b^2}{4a^2}", cue: "得到补数" }], note: "这一步不是跳出新公式：它把一次项系数 b/a 依次“除以 2、再平方”。" };
  moves[3].motion = { title: "把同一个补数加回又减回", before: "x^2+\\frac{b}{a}x", after: "x^2+\\frac{b}{a}x+\\frac{b^2}{4a^2}-\\frac{b^2}{4a^2}", tokens: [{ from: "\\frac{b^2}{4a^2}", to: "+\\frac{b^2}{4a^2}", cue: "补进平方" }, { from: "\\frac{b^2}{4a^2}", to: "-\\frac{b^2}{4a^2}", cue: "同时减回" }], note: "同一个数一正一负地移动进式子，函数值不变，但前面三项已能合成平方。" };
  moves[4].motion = { title: "让前三项合成平方", before: "x^2+\\frac{b}{a}x+\\frac{b^2}{4a^2}", after: "(x+\\frac{b}{2a})^2", tokens: [{ from: "x^2", to: "(x+\\frac{b}{2a})^2", cue: "第一项" }, { from: "\\frac{b}{a}x", to: "2\\cdot\\frac{b}{2a}x", cue: "中间项" }, { from: "\\frac{b^2}{4a^2}", to: "(\\frac{b}{2a})^2", cue: "末项" }], note: "这三部分逐项对应平方公式，因此可以收拢成 (x+b/(2a))²。" };
  moves[5].motion = { title: "让外面的 a 乘回补偿项", before: "a(-\\frac{b^2}{4a^2})", after: "-\\frac{b^2}{4a}", tokens: [{ from: "a", to: "a/a^2", cue: "约去一个 a" }, { from: "-\\frac{b^2}{4a^2}", to: "-\\frac{b^2}{4a}", cue: "乘回去" }], note: "外面的 a 与分母 a² 约掉一个 a，所以补偿项变成 -b²/(4a)。" };
  moves[6].motion = { title: "把常数通分到同一分母", before: "c-\\frac{b^2}{4a}", after: "\\frac{4ac-b^2}{4a}", tokens: [{ from: "c", to: "\\frac{4ac}{4a}", cue: "c 通分" }, { from: "-\\frac{b^2}{4a}", to: "-\\frac{b^2}{4a}", cue: "分母不变" }], note: "c 先写成 4ac/(4a)，再与 -b²/(4a) 合并为一个常数项。" };
  moves[7].motion = { title: "把加号写成顶点式里的减号", before: "x+\\frac{b}{2a}", after: "x-(-\\frac{b}{2a})", tokens: [{ from: "+\\frac{b}{2a}", to: "-(-\\frac{b}{2a})", cue: "同一个量" }, { from: "\\frac{4ac-b^2}{4a}", to: "k", cue: "平方外常数" }], note: "x+b/(2a) 改写为 x-(-b/(2a)) 后，就能一眼对齐 x-h，直接读出 h 与 k。" };
  let index = 0;
  let animating = false;
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
  function syncControls() { const done = index === moves.length; previous.disabled = animating || index <= 1; next.disabled = animating || done; hkPanel.hidden = !done; hkReveal.hidden = !done; if (!done) hkAnswer.hidden = true; }
  function showLine() { appendDerivationLine(sequence, moves[index], "lesson06SymbolicLine"); index += 1; animating = false; syncControls(); }
  function playNext() { if (index >= moves.length || animating) return; animating = true; syncControls(); appendTransformationMotion(sequence, moves[index], "lesson06SymbolicMotion", cleanup, showLine); }
  function goPrevious() { if (index <= 1 || animating) return; sequence.lastElementChild.remove(); sequence.lastElementChild.remove(); index -= 1; syncControls(); }
  next.addEventListener("click", playNext);
  previous.addEventListener("click", goPrevious);
  hkPanel.append(hkPrompt, mapping, hkReveal, hkAnswer);
  root.append(element("p", "lesson06-question", "把数字例题的每一个动作完整搬到字母式：每次只看关键量怎样移动，完成后再读下一条等式。"), sequence, actions, hkPanel);
  showLine();
}

function renderChallengeDetailed(root, _change, cleanup, random) {
  root.classList.add("lesson06-challenge-step");
  const prompt = element("div", "lesson06-question"); const answer = element("div", "lesson06-answer"); answer.dataset.lesson06ChallengeAnswer = ""; answer.hidden = true;
  const graphPanel = element("div", "lesson06-graph-panel lesson06-challenge-graph"); graphPanel.dataset.lesson06ChallengeGraph = ""; graphPanel.hidden = true;
  const graph = addGraph(graphPanel, { a: 1, h: 0, k: 0 }, cleanup, "随机挑战图象"); const control = reveal("Reveal Answer", "lesson06ChallengeReveal"); const next = button("New Challenge", "lesson06-action lesson06-secondary"); let challenge;
  function render() { challenge = makeChallenge(random); prompt.replaceChildren(element("span", "", "只给一般式："), formula(generalText(challenge.general), "lesson06-formula lesson06-hero"), element("span", "", "请口答对称轴与顶点。")); answer.hidden = true; graphPanel.hidden = true; }
  control.addEventListener("click", () => { answer.replaceChildren(formula(vertexText(challenge.vertex)), element("p", "", "对称轴 (axis of symmetry)：x=" + number(challenge.vertex.h) + "；顶点 (vertex)：(" + number(challenge.vertex.h) + ", " + number(challenge.vertex.k) + ")。")); answer.hidden = false; graphPanel.hidden = false; updateGraph(graph, challenge.vertex, vertexText(challenge.vertex) + " 的图象"); }); next.addEventListener("click", render);
  const actions = element("div", "lesson06-actions"); actions.append(control, next); root.append(element("p", "lesson06-prompt", "答案揭示后，下方保留一张更大的图像验证；本页可以上下滚动，供课堂仔细读图。"), prompt, actions, answer, graphPanel); render();
}

function renderSummary(root) { const route = element("div", "lesson06-summary-route"); ["一般式 (general form)", "配方法 (completing the square)", "顶点式 (vertex form)", "顶点 / 对称轴"].forEach((label, index) => { route.append(element("strong", "lesson06-route-node", label)); if (index < 3) route.append(element("span", "lesson06-route-arrow", "→")); }); root.append(route, element("p", "lesson06-bridge-out", "Bridge Out：令 y=0，一般式 y=ax²+bx+c 会变成一元二次方程；下一课将研究它与 x 轴的交点。")); }

const RENDERERS = Object.freeze([renderBridge, renderDemoDetailed, renderInteractive, renderSymbolicDetailed, renderFormulaCards, renderDual, renderChallengeDetailed, renderSummary]);
export function renderLesson06(stage, { step = 1, onStepChange = () => {}, random = Math.random }) { const safeStep = Math.min(8, Math.max(1, Number(step) || 1)); const cleanup = []; const root = createRoot(safeStep); RENDERERS[safeStep - 1](root, onStepChange, cleanup, random); appendNavigation(root, safeStep, onStepChange); stage.replaceChildren(root); return { destroy() { cleanup.forEach((dispose) => dispose()); } }; }
