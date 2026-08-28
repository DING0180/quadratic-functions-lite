const SESSION_KEY = "parabola-portal-seen";
const DURATIONS = Object.freeze({ full: 2800, compact: 720, reduced: 340 });
const MATH_ITEMS = Object.freeze(["y = x²", "y = a(x − h)² + k", "vertex", "axis of symmetry", "Δ", "x₁, x₂"]);

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

function destinationLock() {
  const lock = element("div", "portal-destination-lock");
  lock.innerHTML = '<svg viewBox="0 0 520 360" class="portal-lock-graph"><g class="portal-lock-grid"><path d="M40 60H480M40 120H480M40 180H480M40 240H480M40 300H480M120 30V330M200 30V330M280 30V330M360 30V330M440 30V330" /></g><path class="portal-lock-axis" d="M40 180H480M260 330V30" /><path class="portal-lock-parabola" d="M70 45C150 318 370 318 450 45" /><circle class="portal-lock-point" cx="260" cy="300" r="7" /></svg>';
  return lock;
}

function overlayFor(mode, home) {
  const overlay = element("aside", "parabola-portal");
  overlay.dataset.portalMode = mode;
  overlay.setAttribute("aria-hidden", "true");
  const origin = element("div", "portal-origin");
  const graph = home.querySelector(".parabola-svg")?.cloneNode(true);
  if (graph) { graph.classList.add("portal-source-graph"); origin.append(graph); }
  overlay.append(origin);
  if (mode === "full") {
    const tunnel = element("div", "portal-math-tunnel");
    const mobile = window.matchMedia?.("(max-width: 760px)").matches;
    const tunnelItems = mobile ? MATH_ITEMS.slice(0, 3) : MATH_ITEMS;
    const mobilePositions = [[8, 19], [12, 48], [54, 74]];
    tunnelItems.forEach((item, index) => {
      const token = element("span", "portal-math-item", item);
      token.style.setProperty("--portal-item-index", String(index));
      token.style.top = String(mobile ? mobilePositions[index][1] : 18 + index * 12) + "%";
      token.style.left = String(mobile ? mobilePositions[index][0] : 8 + (index % 3) * 29) + "%";
      token.style.setProperty("--portal-exit-x", String((index - 2) * 2) + "rem");
      tunnel.append(token);
    });
    overlay.append(tunnel);
  }
  overlay.append(destinationLock());
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
