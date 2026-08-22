import katex from "katex";

export function renderFormula(element, latex, { displayMode = false, ariaLabel = "" } = {}) {
  if (!element || typeof element !== "object") {
    throw new TypeError("A target element is required");
  }

  const source = String(latex ?? "");
  try {
    element.innerHTML = katex.renderToString(source, {
      displayMode,
      output: "htmlAndMathml",
      throwOnError: true,
      trust: false,
    });
    if (ariaLabel) element.setAttribute?.("aria-label", ariaLabel);
    else element.removeAttribute?.("aria-label");
    return { ok: true, element };
  } catch (error) {
    element.innerHTML = "";
    element.textContent = source;
    element.setAttribute?.("aria-label", ariaLabel || source);
    return { ok: false, error, element };
  }
}
