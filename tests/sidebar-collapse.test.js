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
    const sidebar = document.querySelector(".sidebar");
    const toggle = document.querySelector(".sidebar-toggle");
    const lessonLinks = document.querySelectorAll(".lesson-link");
    expect(document.querySelector(".brand-title").textContent).toBe("二次函数互动课堂 · Lite");
    expect(document.querySelector(".brand-school").textContent).toBe("重庆德普外国语学校");
    expect(document.querySelector(".brand-program").textContent).toBe("双语初中 · 二次函数学习");
    expect(lessonLinks).toHaveLength(11);
    expect(lessonLinks[0].style.getPropertyValue("--sidebar-entry-index")).toBe("0");
    expect(lessonLinks[10].style.getPropertyValue("--sidebar-entry-index")).toBe("10");
    expect(classroom.classList.contains("classroom--sidebar-collapsed")).toBe(true);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");

    toggle.click();
    expect(classroom.classList.contains("classroom--sidebar-collapsed")).toBe(false);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(sidebar.classList.contains("sidebar--opening")).toBe(true);

    window.location.hash = "#lesson-07/step-01";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    expect(document.querySelector(".lesson07-step")).not.toBeNull();

    toggle.click();
    expect(classroom.classList.contains("classroom--sidebar-collapsed")).toBe(true);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
  });
});
