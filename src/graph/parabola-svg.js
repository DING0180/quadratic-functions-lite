const SVG_NS = "http://www.w3.org/2000/svg";
const WIDTH = 520;
const HEIGHT = 360;
const PADDING = 38;
const X_MIN = -4;
const X_MAX = 4;

function createSvgElement(tag, className) {
  const element = document.createElementNS(SVG_NS, tag);
  if (className) element.setAttribute("class", className);
  return element;
}

function graphBounds(options) {
  const values = [
    ...options.curves.flatMap(({ a, k = 0 }) => [a * 4 + k, a * 16 + k, k]),
    ...options.points.map((point) => Array.isArray(point) ? point[1] : point.y),
    1,
    -1,
  ];
  const extent = Math.max(4, ...values.map((value) => Math.abs(value)));
  return {
    yMin: -extent,
    yMax: extent,
  };
}

function createScale(bounds) {
  const innerWidth = WIDTH - PADDING * 2;
  const innerHeight = HEIGHT - PADDING * 2;

  return {
    x(value) {
      return PADDING + ((value - X_MIN) / (X_MAX - X_MIN)) * innerWidth;
    },
    y(value) {
      return HEIGHT - PADDING - ((value - bounds.yMin) / (bounds.yMax - bounds.yMin)) * innerHeight;
    },
  };
}

function appendAxes(svg, scale, bounds) {
  const xAxis = createSvgElement("line", "parabola-axis");
  xAxis.setAttribute("x1", String(PADDING));
  xAxis.setAttribute("x2", String(WIDTH - PADDING));
  xAxis.setAttribute("y1", String(scale.y(0)));
  xAxis.setAttribute("y2", String(scale.y(0)));
  svg.append(xAxis);

  const yAxis = createSvgElement("line", "parabola-axis");
  yAxis.setAttribute("x1", String(scale.x(0)));
  yAxis.setAttribute("x2", String(scale.x(0)));
  yAxis.setAttribute("y1", String(PADDING));
  yAxis.setAttribute("y2", String(HEIGHT - PADDING));
  svg.append(yAxis);

  for (let value = X_MIN; value <= X_MAX; value += 1) {
    if (value === 0) continue;
    const tick = createSvgElement("text", "parabola-tick");
    tick.setAttribute("x", String(scale.x(value)));
    tick.setAttribute("y", String(scale.y(0) + 18));
    tick.textContent = String(value);
    svg.append(tick);
  }

  const yStep = bounds.yMax > 20 ? 10 : bounds.yMax > 8 ? 4 : 2;
  for (let value = bounds.yMin; value <= bounds.yMax; value += yStep) {
    if (value === 0) continue;
    const tick = createSvgElement("text", "parabola-tick parabola-tick-y");
    tick.setAttribute("x", String(scale.x(0) + 8));
    tick.setAttribute("y", String(scale.y(value) + 4));
    tick.textContent = String(value);
    svg.append(tick);
  }
}

function curvePath(a, k, scale) {
  const points = [];
  for (let x = X_MIN; x <= X_MAX + 0.001; x += 0.1) {
    const command = points.length === 0 ? "M" : "L";
    points.push(command + scale.x(x).toFixed(2) + " " + scale.y(a * x * x + k).toFixed(2));
  }
  return points.join(" ");
}

function appendCurve(svg, curve, scale, progress) {
  const path = createSvgElement("path", "parabola-curve");
  path.setAttribute("d", curvePath(curve.a, curve.k ?? 0, scale));
  path.setAttribute("pathLength", "1");
  path.setAttribute("stroke", curve.color ?? "#2563eb");
  path.setAttribute("stroke-dasharray", "1");
  path.setAttribute("stroke-dashoffset", String(1 - Math.max(0, Math.min(1, progress))));
  svg.append(path);
}

function appendPoint(svg, point, scale) {
  const [x, y] = Array.isArray(point) ? point : [point.x, point.y];
  const circle = createSvgElement("circle", "parabola-point");
  circle.setAttribute("cx", String(scale.x(x)));
  circle.setAttribute("cy", String(scale.y(y)));
  circle.setAttribute("r", "4");
  svg.append(circle);
}

function appendLabel(svg, label, scale) {
  const text = createSvgElement("text", "parabola-label");
  text.setAttribute("x", String(scale.x(label.x)));
  text.setAttribute("y", String(scale.y(label.y)));
  text.textContent = label.text;
  svg.append(text);
}

export function createParabolaGraph(container, initialOptions = {}) {
  let options = {
    curves: [],
    points: [],
    labels: [],
    curveProgress: 1,
    ...initialOptions,
  };

  function render() {
    const bounds = graphBounds(options);
    const scale = createScale(bounds);
    const svg = createSvgElement("svg", "parabola-svg");
    svg.setAttribute("viewBox", "0 0 " + WIDTH + " " + HEIGHT);
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", options.ariaLabel ?? "二次函数图象");

    appendAxes(svg, scale, bounds);
    options.curves.forEach((curve) => appendCurve(svg, curve, scale, options.curveProgress));
    options.points.forEach((point) => appendPoint(svg, point, scale));
    options.labels.forEach((label) => appendLabel(svg, label, scale));
    container.replaceChildren(svg);
  }

  render();

  return {
    update(nextOptions = {}) {
      options = { ...options, ...nextOptions };
      render();
    },
    destroy() {
      container.replaceChildren();
    },
  };
}
