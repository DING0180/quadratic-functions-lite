function entry(zh, en) {
  return Object.freeze({ zh, en });
}

export const TERMS = Object.freeze({
  linearFunction: entry("一次函数", "linear function"),
  quadraticFunction: entry("二次函数", "quadratic function"),
  parabola: entry("抛物线", "parabola"),
  generalForm: entry("一般式", "general form"),
  vertexForm: entry("顶点式", "vertex form"),
  vertex: entry("顶点", "vertex"),
  axisOfSymmetry: entry("对称轴", "axis of symmetry"),
  root: entry("根", "root"),
  realRoot: entry("实数根", "real root"),
  intersection: entry("交点", "intersection"),
  discriminant: entry("判别式", "discriminant"),
  domain: entry("定义域", "domain"),
  interval: entry("区间", "interval"),
  endpoint: entry("端点", "endpoint"),
  maximum: entry("最大值", "maximum"),
  minimum: entry("最小值", "minimum"),
  opensUpward: entry("开口向上", "opens upward"),
  opensDownward: entry("开口向下", "opens downward"),
  translation: entry("平移", "translation"),
  quadraticTerm: entry("二次项", "quadratic term"),
  linearTerm: entry("一次项", "linear term"),
  constantTerm: entry("常数项", "constant term"),
  quadraticCoefficient: entry("二次项系数", "quadratic coefficient"),
  linearCoefficient: entry("一次项系数", "linear coefficient"),
});

export const UI = Object.freeze({
  home: "Home",
  previous: "Previous",
  next: "Next",
  restartLesson: "Restart Lesson",
  revealAnswer: "Reveal Answer",
  reset: "Reset",
  newQuestion: "New Question",
  checkWithGraph: "Check with Graph",
  showMovement: "Show Movement",
  startLearning: "Start Learning",
});

export const STEP_SUBTITLES = Object.freeze({
  "lesson-01": Object.freeze([
    "Bridge In: Linear to Quadratic Functions",
    "The General Form of a Quadratic Function",
    "Identify the Quadratic Coefficient",
    "Recognising Quadratic Functions",
    "Modelling a Real Situation",
  ]),
  "lesson-02": Object.freeze([
    "From the General Form to y = ax²",
    "Plotting Points and Drawing y = x²",
    "Your Turn: Draw y = −x²",
    "Comparing y = x² and y = −x²",
    "Your Turn: Compare y = 2x² and y = ½x²",
    "Comparing |a| with Three Graphs",
    "What Does a Control?",
    "Random Parabola Comparison",
    "Combined Graph Challenge",
    "Summary and Bridge Out",
  ]),
  "lesson-03": Object.freeze([
    "From y = ax² to y = x² + 1",
    "Plotting with the Same x-values",
    "From One Unit to k Units",
    "Vertical Translation Controlled by k",
    "What Changes and What Stays the Same?",
    "Vertex, Monotonicity and Extrema",
    "Examples and Variations",
    "The a–k Parameter Lab",
    "Key Conclusions",
    "A Question About Horizontal Translation",
  ]),
  "lesson-04": Object.freeze([
    "Plotting, Connecting and Observing",
    "Explore y = (x − k)²",
    "Reviewing the Properties of y = (x − 1)²",
    "Quick Check",
  ]),
  "lesson-05": Object.freeze([
    "Bridge In: Three Parameters, One Parabola",
    "Parabola Control Lab",
    "Bringing the Properties Together",
    "Shift It: Random Translation Challenge",
    "Read the Parabola: Random Properties Challenge",
    "Summary and Bridge Out",
  ]),
  "lesson-06": Object.freeze([
    "Bridge In: Two Forms",
    "Teacher Demonstration: Completing the Square",
    "Reading the Vertex and Axis",
    "Quick Random Challenge",
    "Summary and Bridge Out",
    "Parameter Exploration Lab",
  ]),
  "lesson-07": Object.freeze([
    "Bridge In: Let y = 0",
    "Roots Are x-coordinates of Intersections",
    "Two, One or No Intersections",
    "Intersection Lab",
    "Quick Random Challenge: Graph to Equation",
    "Reverse Challenge: Equation and Roots to Graph",
    "Summary and Bridge Out",
  ]),
  "lesson-08": Object.freeze([
    "Bridge In: Function and Equation Language",
    "A Graphical View of Roots",
    "Approximating a Root",
    "Narrowing an Interval",
    "Reading Signs from a Graph",
    "Solving an Inequality Graphically",
    "Positive and Negative Intervals",
    "A Zoomed Root Investigation",
    "Quick Sign Check",
    "Random Practice",
    "Key Conclusions",
    "Bridge Out: Extrema on an Interval",
  ]),
  "lesson-09": Object.freeze([
    "Bridge In: Extrema of a Complete Parabola",
    "A Restricted Part of a Graph",
    "Is the Vertex in the Domain?",
    "Method: Domain First, Then Vertex",
    "Quick Random Practice: Interval Decisions",
    "Application 1: Maximum Fencing Area",
    "Application Format: Graph and Steps",
    "Application 2: Price and Revenue",
    "Summary: Extrema on an Interval",
    "Bridge Out: Moving to Profit",
  ]),
  "lesson-10": Object.freeze([
    "Bridge In: Revenue, Cost and Profit",
    "Building Relationships from a Situation",
    "Constructing a Profit Function",
    "Finding Maximum Profit",
    "The Realistic Domain",
    "Profit Parameter Lab",
    "Checkpoint: Read the Model",
    "Random Profit Practice",
  ]),
  "lesson-11": Object.freeze([
    "Bridge In: Modelling an Arch",
    "Real to Math: Keep the Key Information",
    "Choosing an Efficient Coordinate System",
    "Choosing a Suitable Function Model",
    "Key Points Determine a Parabola",
    "Substitute Key Points to Find an Equation",
    "Arch Design Lab",
    "Is the Clearance Height Enough?",
    "Bridge Out: From a Model to a Function",
  ]),
});

export function term(key) {
  const value = TERMS[key];
  if (!value) throw new RangeError("Unknown mathematics term: " + key);
  return value.zh + " (" + value.en + ")";
}

export function getStepSubtitle(lessonId, step) {
  const subtitles = STEP_SUBTITLES[lessonId];
  const index = Number(step) - 1;
  if (!subtitles || !Number.isInteger(index) || index < 0 || index >= subtitles.length) {
    throw new RangeError("Unknown lesson step: " + lessonId + "/" + step);
  }
  return subtitles[index];
}
