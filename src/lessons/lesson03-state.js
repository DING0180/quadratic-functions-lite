export const LESSON03_POINT_X_VALUES = Object.freeze([-4, -3, -2, -1, 0, 1, 2, 3, 4]);

export function createLesson03PointState(k = 1) {
  const plotted = new Set();

  return {
    plot(x) {
      if (!LESSON03_POINT_X_VALUES.includes(x) || plotted.has(x)) return false;
      plotted.add(x);
      return true;
    },
    get rows() {
      return LESSON03_POINT_X_VALUES
        .filter((x) => plotted.has(x))
        .map((x) => ({ x, baseY: x * x, shiftedY: x * x + k, delta: k }));
    },
    get count() {
      return plotted.size;
    },
    get complete() {
      return plotted.size === LESSON03_POINT_X_VALUES.length;
    },
  };
}

export function describeLesson03Function({ a, k }) {
  const value = String(k);
  return {
    vertex: `(0, ${value})`,
    axis: "x=0",
    opening: a > 0 ? "向上" : "向下",
    extremum: `${a > 0 ? "最小" : "最大"}值 ${value}`,
    isQuadratic: a !== 0,
  };
}
