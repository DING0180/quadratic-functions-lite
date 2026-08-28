const SESSION_KEY = "parabola-portal-seen";
const DURATIONS = Object.freeze({ full: 2400, compact: 720, reduced: 340 });
const MATH_ITEMS = Object.freeze([
  "y = x²",
  "x = (−b ± √(b² − 4ac)) / 2a",
  "Δ = b² − 4ac",
  "y = a(x − h)² + k",
  "vertex",
  "axis of symmetry",
]);

function element(tag, className, text = "") {
  const node = document.createElement(tag);
  node.className = className;
  if (text) node.textContent = text;
  return node;
}

function seenBefore() {
  try { return window.sessionStorage.getItem(SESSION_KEY) === "true"; } catch { return false; }
}

function rememberVisit() {
  try { window.sessionStorage.setItem(SESSION_KEY, "true"); } catch { /* Storage is optional. */ }
}

function blackHole() {
  const hole = element("div", "portal-black-hole");
  hole.append(element("div", "portal-event-horizon"), element("div", "portal-singularity"));
  return hole;
}

function overlayFor(mode, home) {
  const overlay = element("aside", "parabola-portal");
  overlay.dataset.portalMode = mode;
  overlay.dataset.portalScene = "black-hole";
  overlay.setAttribute("aria-hidden", "true");
  const origin = element("div", "portal-origin");
  const graph = home.querySelector(".parabola-svg")?.cloneNode(true);
  if (graph) { graph.classList.add("portal-source-graph"); origin.append(graph); }
  overlay.append(origin);
  overlay.append(blackHole());
  if (mode === "full") {
    const tunnel = element("div", "portal-math-tunnel");
    const mobile = window.matchMedia?.("(max-width: 760px)").matches;
    const tunnelItems = mobile ? MATH_ITEMS.slice(0, 3) : MATH_ITEMS;
    const positions = mobile ? [[20, 20], [20, 52], [24, 76]] : [[14, 18], [55, 12], [10, 47], [63, 43], [25, 74], [68, 77]];
    tunnelItems.forEach((item, index) => {
      const token = element("span", "portal-math-item", item);
      const [left, top] = positions[index];
      token.style.setProperty("--portal-item-index", String(index));
      token.style.top = `${top}%`;
      token.style.left = `${left}%`;
      token.style.setProperty("--portal-entry-x", `${50 - left}vw`);
      token.style.setProperty("--portal-entry-y", `${50 - top}vh`);
      token.style.setProperty("--portal-exit-x", `${(left - 50) * 0.12}vw`);
      token.style.setProperty("--portal-exit-y", `${(top - 50) * 0.12}vh`);
      tunnel.append(token);
    });
    overlay.append(tunnel);
  }
  return overlay;
}

export function createParabolaPortal({ onComplete, reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches } = {}) {
  let active = false;
  let finishTimer = null;
  let fallbackTimer = null;
  let context = null;

  function cleanUp() {
    if (finishTimer !== null) window.clearTimeout(finishTimer);
    if (fallbackTimer !== null) window.clearTimeout(fallbackTimer);
    finishTimer = null;
    fallbackTimer = null;
    context?.overlay.remove();
    context?.home.classList.remove("home-is-entering");
    context?.trigger.removeAttribute("aria-disabled");
    context?.trigger.removeAttribute("tabindex");
    document.documentElement.classList.remove("portal-is-active");
    document.body.classList.remove("portal-is-active");
    context = null;
  }

  function finish() {
    if (!active) return;
    active = false;
    cleanUp();
    onComplete?.();
  }

  return {
    start({ home, trigger }) {
      if (active || !home || !trigger) return false;
      const mode = reducedMotion() ? "reduced" : seenBefore() ? "compact" : "full";
      const overlay = overlayFor(mode, home);
      active = true;
      context = { home, trigger, overlay };
      home.classList.add("home-is-entering");
      trigger.setAttribute("aria-disabled", "true");
      trigger.setAttribute("tabindex", "-1");
      document.documentElement.classList.add("portal-is-active");
      document.body.classList.add("portal-is-active");
      document.body.append(overlay);
      if (mode === "full") rememberVisit();
      finishTimer = window.setTimeout(finish, DURATIONS[mode]);
      fallbackTimer = window.setTimeout(finish, DURATIONS[mode] + 450);
      return true;
    },
    cancel() {
      if (!active) return;
      active = false;
      cleanUp();
    },
    isActive() { return active; },
  };
}

