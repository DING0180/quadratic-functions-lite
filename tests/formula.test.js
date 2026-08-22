import { describe, expect, it } from "vitest";
import { renderFormula } from "../src/formula.js";

function createElement() {
  const attributes = new Map();
  return {
    innerHTML: "",
    textContent: "",
    setAttribute(name, value) {
      attributes.set(name, value);
    },
    removeAttribute(name) {
      attributes.delete(name);
    },
    getAttribute(name) {
      return attributes.get(name) ?? null;
    },
  };
}

describe("renderFormula", () => {
  it("renders valid LaTex with KaTeX and an accessible label", () => {
    const element = createElement();

    const result = renderFormula(element, "y=ax^2+bx+c", { ariaLabel: "二次函数一般式" });

    expect(result.ok).toBe(true);
    expect(element.innerHTML).toContain("katex");
    expect(element.getAttribute("aria-label")).toBe("二次函数一般式");
  });

  it("falls back to source text when KaTeX rejects the input", () => {
    const element = createElement();

    const result = renderFormula(element, "\\badcommand");

    expect(result.ok).toBe(false);
    expect(element.textContent).toBe("\\badcommand");
    expect(element.getAttribute("aria-label")).toBe("\\badcommand");
  });
});
