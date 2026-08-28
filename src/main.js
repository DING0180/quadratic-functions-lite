import "./styles.css";
import { COURSE, getLessonFromHash } from "./course.js";
import { renderFormula } from "./formula.js";
import { createHomeLanding } from "./home.js";
import { createParabolaPortal } from "./portal-transition.js";
import { renderLesson01 } from "./lessons/lesson01.js";
import { renderLesson02 } from "./lessons/lesson02.js";
import { renderLesson03 } from "./lessons/lesson03.js";
import { renderLesson04 } from "./lessons/lesson04.js";
import { renderLesson05 } from "./lessons/lesson05.js";
import { renderLesson06 } from "./lessons/lesson06.js";
import { renderLesson07 } from "./lessons/lesson07.js";
import { renderLesson08 } from "./lessons/lesson08.js";
import { renderLesson09 } from "./lessons/lesson09.js";
import { renderLesson10 } from "./lessons/lesson10.js";
import { renderLesson11 } from "./lessons/lesson11.js";
import "./classroom-polish.css";

const root = document.querySelector("#app");

if (!root) {
  throw new Error("Missing #app mount point");
}

function createElement(tag, className, text = "") {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function lessonStepFromHash(hash, lessonId, totalSteps) {
  const match = String(hash ?? "").match(new RegExp("^#" + lessonId + "/step-(\\d{2})$"));
  const step = Number(match?.[1]);
  return Number.isInteger(step) && step >= 1 && step <= totalSteps ? step : 1;
}

function lessonStepHash(lessonId, step) {
  return "#" + lessonId + "/step-" + String(step).padStart(2, "0");
}

const classroom = createElement("div", "classroom");
const sidebar = createElement("aside", "sidebar");
const sidebarToggle = createElement("button", "sidebar-toggle");
sidebarToggle.type = "button";
sidebarToggle.setAttribute("aria-controls", "lesson-navigation");
const sidebarToggleIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
sidebarToggleIcon.setAttribute("class", "sidebar-toggle-icon");
sidebarToggleIcon.setAttribute("viewBox", "0 0 20 20");
sidebarToggleIcon.setAttribute("aria-hidden", "true");
const sidebarTogglePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
sidebarTogglePath.setAttribute("d", "m7 4 6 6-6 6");
sidebarToggleIcon.append(sidebarTogglePath);
sidebarToggle.append(sidebarToggleIcon);
const brand = createElement("div", "brand");
const brandSchool = createElement("p", "brand-school", "重庆德普外国语学校");
const brandProgram = createElement("p", "brand-program", "双语初中 · 二次函数学习");
const formula = createElement("div", "brand-formula");
renderFormula(formula, "y=ax^2+bx+c", { ariaLabel: "二次函数一般式" });
brand.append(brandSchool, brandProgram, formula);

const homeReturnLink = createElement("a", "sidebar-home-link");
homeReturnLink.href = "#home";
homeReturnLink.setAttribute("aria-label", "返回主页");
const homeReturnIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
homeReturnIcon.setAttribute("class", "sidebar-home-icon");
homeReturnIcon.setAttribute("viewBox", "0 0 24 24");
homeReturnIcon.setAttribute("aria-hidden", "true");
const homeReturnPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
homeReturnPath.setAttribute("d", "m3.5 10 8.5-7 8.5 7v9.5a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5V10Zm5.5 11v-6.5h6V21");
homeReturnIcon.append(homeReturnPath);
const homeReturnLabel = createElement("span", "sidebar-home-label", "返回主页");
homeReturnLink.append(homeReturnIcon, homeReturnLabel);

const navigation = createElement("nav", "lesson-navigation");
navigation.id = "lesson-navigation";
navigation.setAttribute("aria-label", "课时导航");
const navigationTitle = createElement("p", "navigation-label", "本章课时");
const lessonList = createElement("ol", "lesson-list");
navigation.append(navigationTitle, lessonList);
sidebar.append(brand, homeReturnLink, navigation, sidebarToggle);

const stage = createElement("section", "lesson-stage");
stage.setAttribute("aria-live", "polite");
const stageLabel = createElement("p", "lesson-number");
const stageTitle = createElement("h2", "lesson-title");
const stageRule = createElement("div", "stage-rule");
const stageStatus = createElement("p", "stage-status", "课堂壳已就绪");
const stageMessage = createElement("p", "stage-message", "本课教学内容将在后续逐课加入。");

classroom.append(sidebar, stage);
let portal;
const home = createHomeLanding({
  onStartLearning({ home: homeElement, trigger }) {
    portal.start({ home: homeElement, trigger });
  },
});
portal = createParabolaPortal({
  onComplete() {
    document.body.classList.add("lesson-is-arriving");
    window.location.hash = "#lesson-01/step-01";
    window.setTimeout(() => document.body.classList.remove("lesson-is-arriving"), 720);
  },
});

let activeLesson = null;
let sidebarCollapsed = true;
let sidebarOpeningTimer = null;

function setSidebarCollapsed(collapsed) {
  sidebarCollapsed = collapsed;
  classroom.classList.toggle("classroom--sidebar-collapsed", collapsed);
  sidebarToggle.setAttribute("aria-expanded", String(!collapsed));
  sidebarToggle.setAttribute("aria-label", collapsed ? "展开课时导航" : "收起课时导航");
  sidebarToggle.title = collapsed ? "展开课时导航" : "收起课时导航";
  window.clearTimeout(sidebarOpeningTimer);
  sidebar.classList.remove("sidebar--opening");
  if (!collapsed) {
    sidebar.classList.add("sidebar--opening");
    sidebarOpeningTimer = window.setTimeout(() => {
      sidebar.classList.remove("sidebar--opening");
    }, 760);
  }
}

sidebarToggle.addEventListener("click", () => {
  setSidebarCollapsed(!sidebarCollapsed);
});

sidebar.addEventListener("click", (event) => {
  if (event.target === sidebar) setSidebarCollapsed(!sidebarCollapsed);
});

function renderSidebar(activeLessonId) {
  lessonList.replaceChildren(...COURSE.map((item, index) => {
    const itemElement = document.createElement("li");
    const link = document.createElement("a");
    link.href = "#" + item.id;
    link.className = "lesson-link";
    link.dataset.lessonId = item.id;
    link.style.setProperty("--sidebar-entry-index", String(index));
    link.style.setProperty("--sidebar-entry-delay", String(index * 38) + "ms");
    if (item.id === activeLessonId) link.setAttribute("aria-current", "page");

    const number = createElement("span", "lesson-link-number", item.number);
    const title = createElement("span", "lesson-link-title", item.title);
    link.append(number, title);
    itemElement.append(link);
    return itemElement;
  }));
}

function renderGenericLesson(lesson) {
  stage.classList.remove("lesson-stage-active");
  stage.replaceChildren(stageLabel, stageTitle, stageRule, stageStatus, stageMessage);
  stageLabel.textContent = "LESSON " + lesson.number;
  stageTitle.textContent = lesson.title;
}

function render() {
  activeLesson?.destroy();
  activeLesson = null;

  const homeRoute = window.location.hash === "" || window.location.hash === "#home";
  if (homeRoute) {
    portal.cancel();
    document.title = "二次函数互动课堂｜重庆德普外国语学校";
    root.replaceChildren(home.element);
    return;
  }

  root.replaceChildren(classroom);

  const lesson = getLessonFromHash(window.location.hash);
  const isLesson01 = lesson.id === "lesson-01";
  const isLesson02 = lesson.id === "lesson-02";
  const isLesson03 = lesson.id === "lesson-03";
  const isLesson04 = lesson.id === "lesson-04";
  const isLesson05 = lesson.id === "lesson-05";
  const isLesson06 = lesson.id === "lesson-06";
  const isLesson07 = lesson.id === "lesson-07";
  const isLesson08 = lesson.id === "lesson-08";
  const isLesson09 = lesson.id === "lesson-09";
  const isLesson10 = lesson.id === "lesson-10";
  const isLesson11 = lesson.id === "lesson-11";
  const stepCount = isLesson01 ? 5 : isLesson02 ? 12 : isLesson03 ? 10 : isLesson04 ? 5 : isLesson05 ? 6 : isLesson06 ? 8 : isLesson07 ? 7 : isLesson08 ? 12 : isLesson09 ? 10 : isLesson10 ? 8 : isLesson11 ? 9 : 0;
  const step = stepCount ? lessonStepFromHash(window.location.hash, lesson.id, stepCount) : null;
  const canonicalHash = stepCount ? lessonStepHash(lesson.id, step) : "#" + lesson.id;
  if (window.location.hash !== canonicalHash) {
    window.history.replaceState(null, "", canonicalHash);
  }

  document.title = lesson.number + " · " + lesson.title + "｜二次函数互动课堂";
  renderSidebar(lesson.id);

  if (isLesson01 || isLesson02 || isLesson03 || isLesson04 || isLesson05 || isLesson06 || isLesson07 || isLesson08 || isLesson09 || isLesson10 || isLesson11) {
    stage.classList.add("lesson-stage-active");
    const renderer = isLesson01 ? renderLesson01 : isLesson02 ? renderLesson02 : isLesson03 ? renderLesson03 : isLesson04 ? renderLesson04 : isLesson05 ? renderLesson05 : isLesson06 ? renderLesson06 : isLesson07 ? renderLesson07 : isLesson08 ? renderLesson08 : isLesson09 ? renderLesson09 : isLesson10 ? renderLesson10 : renderLesson11;
    activeLesson = renderer(stage, {
      step,
      onStepChange(nextStep) {
        window.location.hash = lessonStepHash(lesson.id, nextStep);
      },
    });
    return;
  }

  renderGenericLesson(lesson);
}

window.addEventListener("hashchange", render);
setSidebarCollapsed(true);
render();


