const SVG_NS = "http://www.w3.org/2000/svg";
const WIDTH = 520;
const HEIGHT = 360;
const PADDING = 38;
const X_MIN = -4;
const X_MAX = 4;
const Y_MIN = -16;
const Y_MAX = 16;
const Y_TICKS = Object.freeze([-16, -12, -8, -4, 4, 8, 12, 16]);
let graphId = 0;

function createSvgElement(tag, className) {
  const element = document.createElementNS(SVG_NS, tag);
  if (className) element.setAttribute("class", className);
  return element;
}

function getViewport(options) {
  const viewport = {
    xMin: X_MIN,
    xMax: X_MAX,
    yMin: Y_MIN,
    yMax: Y_MAX,
    yTickStep: 4,
    ...(options.viewport ?? {}),
  };
  if (![viewport.xMin, viewport.xMax, viewport.yMin, viewport.yMax, viewport.yTickStep].every(Number.isFinite)
    || viewport.xMin >= viewport.xMax || viewport.yMin >= viewport.yMax || viewport.yTickStep <= 0) {
    throw new TypeError("viewport needs finite increasing bounds");
  }
  return viewport;
}

function createScale(viewport) {
  const innerWidth = WIDTH - PADDING * 2;
  const innerHeight = HEIGHT - PADDING * 2;

  return {
    x(value) {
      return PADDING + ((value - viewport.xMin) / (viewport.xMax - viewport.xMin)) * innerWidth;
    },
    y(value) {
      return HEIGHT - PADDING - ((value - viewport.yMin) / (viewport.yMax - viewport.yMin)) * innerHeight;
    },
  };
}

function appendDefinitions(svg, id) {
  const defs = createSvgElement("defs");
  const marker = createSvgElement("marker", "parabola-axis-arrow");
  marker.setAttribute("id", id + "-axis-arrow");
  marker.setAttribute("viewBox", "0 0 8 8");
  marker.setAttribute("refX", "7");
  marker.setAttribute("refY", "4");
  marker.setAttribute("markerWidth", "6");
  marker.setAttribute("markerHeight", "6");
  marker.setAttribute("orient", "auto");
  const arrow = createSvgElement("path");
  arrow.setAttribute("d", "M 0 0 L 8 4 L 0 8 z");
  arrow.setAttribute("fill", "#7b8e87");
  marker.append(arrow);

  const clipPath = createSvgElement("clipPath");
  clipPath.setAttribute("id", id + "-plot-area");
  const rect = createSvgElement("rect");
  rect.setAttribute("x", String(PADDING));
  rect.setAttribute("y", String(PADDING));
  rect.setAttribute("width", String(WIDTH - PADDING * 2));
  rect.setAttribute("height", String(HEIGHT - PADDING * 2));
  clipPath.append(rect);
  defs.append(marker, clipPath);
  svg.append(defs);
}

function appendAxes(svg, scale, id, viewport, customViewport) {
  const xAxis = createSvgElement("line", "parabola-axis");
  xAxis.setAttribute("x1", String(PADDING));
  xAxis.setAttribute("x2", String(WIDTH - PADDING));
  xAxis.setAttribute("y1", String(scale.y(0)));
  xAxis.setAttribute("y2", String(scale.y(0)));
  xAxis.setAttribute("marker-end", "url(#" + id + "-axis-arrow)");
  svg.append(xAxis);

  const yAxis = createSvgElement("line", "parabola-axis");
  yAxis.setAttribute("x1", String(scale.x(0)));
  yAxis.setAttribute("x2", String(scale.x(0)));
  yAxis.setAttribute("y1", String(HEIGHT - PADDING));
  yAxis.setAttribute("y2", String(PADDING));
  yAxis.setAttribute("marker-end", "url(#" + id + "-axis-arrow)");
  svg.append(yAxis);

  const xTickStart = customViewport ? Math.ceil(viewport.xMin) : X_MIN;
  const xTickEnd = customViewport ? Math.floor(viewport.xMax) : X_MAX;
  for (let value = xTickStart; value <= xTickEnd; value += 1) {
    if (value === 0) continue;
    const tick = createSvgElement("text", "parabola-tick");
    tick.setAttribute("x", String(scale.x(value)));
    tick.setAttribute("y", String(scale.y(0) + 18));
    tick.textContent = String(value);
    svg.append(tick);
  }

  const yTickValues = customViewport
    ? Array.from({ length: Math.floor((viewport.yMax - viewport.yMin) / viewport.yTickStep) + 1 }, (_, index) => Math.ceil(viewport.yMin / viewport.yTickStep) * viewport.yTickStep + index * viewport.yTickStep)
      .filter((value) => value <= viewport.yMax && value !== 0)
    : Y_TICKS;
  yTickValues.forEach((value) => {
    const tick = createSvgElement("text", "parabola-tick parabola-tick-y");
    tick.setAttribute("x", String(scale.x(0) + 8));
    tick.setAttribute("y", String(scale.y(value) + 4));
    tick.textContent = String(value);
    svg.append(tick);
  });

  const xName = createSvgElement("text", "parabola-axis-name");
  xName.setAttribute("x", String(WIDTH - PADDING - 3));
  xName.setAttribute("y", String(scale.y(0) - 9));
  xName.textContent = "x";
  svg.append(xName);

  const yName = createSvgElement("text", "parabola-axis-name");
  yName.setAttribute("x", String(scale.x(0) - 9));
  yName.setAttribute("y", String(PADDING + 12));
  yName.setAttribute("text-anchor", "end");
  yName.textContent = "y";
  svg.append(yName);
}

function curvePath(a, k, h, scale, viewport) {
  const points = [];
  for (let x = viewport.xMin; x <= viewport.xMax + 0.001; x += 0.1) {
    const command = points.length === 0 ? "M" : "L";
    points.push(command + scale.x(x).toFixed(2) + " " + scale.y(a * (x - h) * (x - h) + k).toFixed(2));
  }
  return points.join(" ");
}

function appendCurve(svg, curve, scale, progress, viewport) {
  const path = createSvgElement("path", "parabola-curve");
  path.setAttribute("d", curvePath(curve.a, curve.k ?? 0, curve.h ?? 0, scale, viewport));
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
  circle.setAttribute("r", String(Array.isArray(point) ? 4 : point.radius ?? 4));
  if (!Array.isArray(point) && point.color) circle.setAttribute("fill", point.color);
  svg.append(circle);
}

function appendArrow(svg, arrow, scale) {
  const from = { x: scale.x(arrow.from.x), y: scale.y(arrow.from.y) };
  const to = { x: scale.x(arrow.to.x), y: scale.y(arrow.to.y) };
  const directionX = to.x - from.x;
  const directionY = to.y - from.y;
  const length = Math.hypot(directionX, directionY);
  const color = arrow.color ?? "#b45f06";

  const shaft = createSvgElement("line", "parabola-arrow");
  shaft.setAttribute("x1", String(from.x));
  shaft.setAttribute("y1", String(from.y));
  shaft.setAttribute("x2", String(to.x));
  shaft.setAttribute("y2", String(to.y));
  shaft.setAttribute("stroke", color);
  svg.append(shaft);

  if (length > 0) {
    const angle = Math.atan2(directionY, directionX);
    const arrowhead = 8;
    [-Math.PI / 6, Math.PI / 6].forEach((offset) => {
      const head = createSvgElement("line", "parabola-arrow");
      head.setAttribute("x1", String(to.x));
      head.setAttribute("y1", String(to.y));
      head.setAttribute("x2", String(to.x - arrowhead * Math.cos(angle + offset)));
      head.setAttribute("y2", String(to.y - arrowhead * Math.sin(angle + offset)));
      head.setAttribute("stroke", color);
      svg.append(head);
    });
  }

  if (arrow.label) {
    const label = createSvgElement("text", "parabola-arrow-label");
    label.setAttribute("x", String((from.x + to.x) / 2));
    label.setAttribute("y", String((from.y + to.y) / 2 - 8));
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("fill", color);
    label.textContent = arrow.label;
    svg.append(label);
  }
}

function appendLabel(svg, label, scale) {
  const text = createSvgElement("text", "parabola-label");
  text.setAttribute("x", String(scale.x(label.x)));
  text.setAttribute("y", String(scale.y(label.y)));
  text.textContent = label.text;
  svg.append(text);
}

export function createParabolaGraph(container, initialOptions = {}) {
  const id = "parabola-graph-" + String(++graphId);
  let options = {
    curves: [],
    points: [],
    labels: [],
    arrows: [],
    curveProgress: 1,
    ...initialOptions,
  };

  function render() {
    const viewport = getViewport(options);
    const scale = createScale(viewport);
    const svg = createSvgElement("svg", "parabola-svg");
    svg.setAttribute("viewBox", "0 0 " + WIDTH + " " + HEIGHT);
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", options.ariaLabel ?? "二次函数图象");

    appendDefinitions(svg, id);
    appendAxes(svg, scale, id, viewport, options.viewport != null);
    const plotContent = createSvgElement("g", "parabola-plot-content");
    plotContent.setAttribute("clip-path", "url(#" + id + "-plot-area)");
    options.curves.forEach((curve) => appendCurve(plotContent, curve, scale, options.curveProgress, viewport));
    options.points.forEach((point) => appendPoint(plotContent, point, scale));
    options.arrows.forEach((arrow) => appendArrow(plotContent, arrow, scale));
    options.labels.forEach((label) => appendLabel(plotContent, label, scale));
    svg.append(plotContent);
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
