import schoolLogoUrl from "./assets/depu-school-logo.jpg";
import { renderFormula } from "./formula.js";
import { createParabolaGraph } from "./graph/parabola-svg.js";
import "./home.css";

function element(tag, className, text = "") {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

export function createHomeLanding() {
  const page = element("main", "home-shell");
  page.setAttribute("aria-labelledby", "home-title");

  const header = element("header", "home-header");
  const identity = element("div", "home-identity");
  const logo = document.createElement("img");
  logo.className = "home-school-logo";
  logo.src = schoolLogoUrl;
  logo.alt = "重庆德普外国语学校校徽";
  const identityCopy = element("div", "home-identity-copy");
  identityCopy.append(
    element("p", "home-school-name", "重庆德普外国语学校"),
    element("p", "home-department-name", "双语初中数学组"),
  );
  identity.append(logo, identityCopy);
  header.append(identity);

  const content = element("section", "home-content");
  const introduction = element("div", "home-introduction");
  introduction.append(
    element("p", "home-course-kicker", "数学 · 函数与图象"),
    element("h1", "home-title", "二次函数互动课堂"),
    element("p", "home-course-name", "Quadratic Functions"),
    element("p", "home-summary", "从图象出发，观察开口、顶点、对称轴与变量之间的联系。"),
  );
  introduction.querySelector("h1").id = "home-title";

  const startLearning = element("a", "home-start-learning", "进入学习");
  startLearning.href = "#lesson-01/step-01";
  startLearning.setAttribute("aria-label", "进入学习，从第一课开始");
  const startEnglish = element("span", "home-start-learning-english", "Start Learning");
  startLearning.append(startEnglish);
  introduction.append(startLearning);

  const figure = element("figure", "home-math-visual");
  const graphHost = element("div", "home-graph-host");
  const equation = element("div", "home-equation");
  renderFormula(equation, "y=(x-1)^2-2", { ariaLabel: "y 等于 x 减一的平方减二" });
  const caption = element("figcaption", "home-graph-caption", "顶点 V(1, −2) · 对称轴 x = 1");
  figure.append(graphHost, equation, caption);

  content.append(introduction, figure);
  page.append(header, content);

  const graph = createParabolaGraph(graphHost, {
    viewport: { xMin: -3, xMax: 5, yMin: -4, yMax: 8, xTickStep: 1, yTickStep: 2 },
    curves: [{ a: 0.72, h: 1, k: -2, color: "#075445" }],
    points: [{ x: 1, y: -2, color: "#bd842e", radius: 6 }],
    guides: [{ x: 1, color: "#bd842e" }],
    labels: [{ x: 1.25, y: -1.15, text: "V(1, −2)" }],
    ariaLabel: "二次函数图象：y 等于 x 减一的平方减二，顶点为一负二，对称轴为 x 等于一",
  });

  return {
    element: page,
    destroy() {
      graph.destroy();
    },
  };
}
