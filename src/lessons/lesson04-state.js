export const BASE_POINTS = Object.freeze([
  { x: -4, y: 16 }, { x: -3, y: 9 }, { x: -2, y: 4 },
  { x: -1, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 1 },
  { x: 2, y: 4 }, { x: 3, y: 9 }, { x: 4, y: 16 },
]);

export const SHIFTED_POINTS = Object.freeze([
  { x: -4, y: 25 }, { x: -3, y: 16 }, { x: -2, y: 9 },
  { x: -1, y: 4 }, { x: 0, y: 1 }, { x: 1, y: 0 },
  { x: 2, y: 1 }, { x: 3, y: 4 }, { x: 4, y: 9 },
]);

export const TRANSLATION_ARROWS = Object.freeze(BASE_POINTS.slice(0, -1).map((from) => ({
  from,
  to: { x: from.x + 1, y: from.y },
  label: "+1",
})));

function validateVertexParameters({ a, h }) {
  if (!Number.isFinite(a) || a === 0) throw new TypeError("a must be finite and non-zero");
  if (!Number.isFinite(h)) throw new TypeError("h must be finite");
}

function formatFraction(value) {
  if (value === 0.5) return "\\frac{1}{2}";
  if (value === 1 / 3) return "\\frac{1}{3}";
  return String(value);
}

function formatCoefficient(a) {
  if (a === 1) return "";
  if (a === -1) return "-";
  return a < 0 ? "-" + formatFraction(-a) : formatFraction(a);
}

function formatHorizontalTerm(h) {
  if (h === 0) return "x";
  return h > 0 ? "(x-" + h + ")" : "(x+" + Math.abs(h) + ")";
}

export function getLesson04Properties({ a, h }) {
  validateVertexParameters({ a, h });
  const upward = a > 0;
  return {
    opening: upward ? "向上" : "向下",
    vertex: { x: h, y: 0 },
    axisLatex: "x=" + h,
    shift: h === 0 ? "不发生左右平移" : "向" + (h > 0 ? "右" : "左") + "平移 " + Math.abs(h) + " 个单位",
    monotonicity: upward
      ? "在 x<" + h + " 时递减，在 x>" + h + " 时递增"
      : "在 x<" + h + " 时递增，在 x>" + h + " 时递减",
    extremum: upward ? "最小值是 0" : "最大值是 0",
  };
}

export function formatLesson04Formula({ a, h }) {
  validateVertexParameters({ a, h });
  return "y=" + formatCoefficient(a) + formatHorizontalTerm(h) + "^2";
}
