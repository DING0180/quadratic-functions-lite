import { describe, expect, it } from "vitest";
import {
  LESSON02_X_VALUES,
  createPairChallenge,
  createPlotterState,
  createSingleChallenge,
  formatCoefficientLatex,
  formatFunctionLatex,
} from "../src/lessons/lesson02-state.js";

describe("lesson 02 mathematics", () => {
  it("formats fraction coefficients and the matching y=ax² formula", () => {
    expect(formatCoefficientLatex(-0.5)).toBe("-\\frac{1}{2}");
    expect(formatFunctionLatex(1 / 3)).toBe("y=\\frac{1}{3}x^2");
  });

  it("creates one plotting row for every x from negative four through four", () => {
    const state = createPlotterState();

    expect(LESSON02_X_VALUES).toEqual([-4, -3, -2, -1, 0, 1, 2, 3, 4]);
    expect(state.count).toBe(0);
    expect(state.canConnect).toBe(false);
    expect(state.plot(-4)).toBe(true);
    expect(state.plot(-4)).toBe(false);

    LESSON02_X_VALUES.slice(1).forEach((x) => state.plot(x));

    expect(state.points).toEqual(LESSON02_X_VALUES.map((x) => ({ x, y: x * x })));
    expect(state.canConnect).toBe(true);
    expect(state.connect()).toBe(true);
    expect(state.connected).toBe(true);
  });

  it("creates a pair challenge whose answer follows absolute coefficient magnitude", () => {
    const pair = createPairChallenge(() => 0, () => 0.999);

    expect(pair.a).toBe(-4);
    expect(pair.b).toBe(4);
    expect(pair.correctAnswer).toBe("same");
  });

  it("keeps practice answers and graph visibility local to one challenge", () => {
    const challenge = createSingleChallenge(() => 0.8);

    expect(challenge.graphVisible).toBe(false);
    expect(challenge.answer).toBeNull();
    challenge.answerWith("向上");
    challenge.showGraph();
    expect(challenge.answer).toBe("向上");
    expect(challenge.graphVisible).toBe(true);
  });
});
