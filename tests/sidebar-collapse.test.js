// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";

afterEach(() => {
  document.body.replaceChildren();
  window.history.replaceState(null, "", "/");
});

describe("desktop sidebar collapse control", () => {
  it("starts compact and can reopen then collapse after changing lessons", async () => {
    document.body.innerHTML = '<div id="app"></div>';
    window.history.replaceState(null, "", "/#lesson-06/step-06");

    await import("../src/main.js?sidebar-collapse-test=" + Date.now());

    const classroom = document.querySelector(".classroom");
    const toggle = document.querySelector(".sidebar-toggle");
    expect(classroom.classList.contains("classroom--sidebar-collapsed")).toBe(true);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");

    toggle.click();
    expect(classroom.classList.contains("classroom--sidebar-collapsed")).toBe(false);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");

    window.location.hash = "#lesson-07/step-01";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    expect(document.querySelector(".lesson07-step")).not.toBeNull();

    toggle.click();
    expect(classroom.classList.contains("classroom--sidebar-collapsed")).toBe(true);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
  });
});
