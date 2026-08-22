export const LESSON02_X_VALUES = Object.freeze([-4, -3, -2, -1, 0, 1, 2, 3, 4]);

export const LESSON02_A_POOL = Object.freeze([
  -4, -3, -2, -1, -1 / 2, -1 / 3, -1 / 5,
  1 / 5, 1 / 3, 1 / 2, 1, 2, 3, 4,
]);

function pick(pool, random) {
  const value = Number(random?.());
  const normalized = Number.isFinite(value) ? Math.min(0.999999, Math.max(0, value)) : 0;
  return pool[Math.floor(normalized * pool.length)];
}

export function formatCoefficientLatex(a) {
  if (a === 1) return "";
  if (a === -1) return "-";

  const sign = a < 0 ? "-" : "";
  const absolute = Math.abs(a);
  if (absolute === 1 / 2) return sign + "\\frac{1}{2}";
  if (absolute === 1 / 3) return sign + "\\frac{1}{3}";
  if (absolute === 1 / 5) return sign + "\\frac{1}{5}";
  return String(a);
}

export function formatFunctionLatex(a) {
  return "y=" + formatCoefficientLatex(a) + "x^2";
}

export function createPlotterState() {
  const plotted = new Map();
  let connected = false;

  return {
    get points() {
      return LESSON02_X_VALUES
        .filter((x) => plotted.has(x))
        .map((x) => ({ x, y: x * x }));
    },
    get lastPoint() {
      return this.points.at(-1) ?? null;
    },
    get count() {
      return plotted.size;
    },
    get connected() {
      return connected;
    },
    get canConnect() {
      return plotted.size === LESSON02_X_VALUES.length && !connected;
    },
    plot(x) {
      if (!LESSON02_X_VALUES.includes(x) || plotted.has(x)) return false;
      plotted.set(x, x * x);
      return true;
    },
    connect() {
      if (!this.canConnect) return false;
      connected = true;
      return true;
    },
    reset() {
      plotted.clear();
      connected = false;
    },
  };
}

function createQuestionState(a) {
  let graphVisible = false;
  let answer = null;

  return {
    a,
    get answer() {
      return answer;
    },
    get graphVisible() {
      return graphVisible;
    },
    answerWith(value) {
      answer = value;
    },
    showGraph() {
      graphVisible = true;
    },
  };
}

export function createSingleChallenge(random = Math.random) {
  return createQuestionState(pick(LESSON02_A_POOL, random));
}

export function createPairChallenge(firstRandom = Math.random, secondRandom = Math.random) {
  const a = pick(LESSON02_A_POOL, firstRandom);
  const b = pick(LESSON02_A_POOL, secondRandom);
  const state = createQuestionState(a);
  const correctAnswer = Math.abs(a) < Math.abs(b)
    ? "a"
    : Math.abs(a) > Math.abs(b)
      ? "b"
      : "same";

  return Object.assign(state, { b, correctAnswer });
}

export function createQuickCheck(createChallenge) {
  let count = 0;
  let current = null;

  return {
    get count() {
      return count;
    },
    get current() {
      return current;
    },
    next() {
      current = createChallenge();
      count += 1;
      return current;
    },
  };
}

export function createCurveToggleState(ids) {
  const available = new Set(ids);
  const selected = new Set();

  return {
    get selectedIds() {
      return ids.filter((id) => selected.has(id));
    },
    toggle(id) {
      if (!available.has(id)) return false;
      if (selected.has(id)) {
        selected.delete(id);
        return false;
      }
      selected.add(id);
      return true;
    },
  };
}
