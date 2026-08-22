import "./styles.css";
import { COURSE, getLessonFromHash } from "./course.js";
import { renderFormula } from "./formula.js";
import { renderLesson02 } from "./lessons/lesson02.js";

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

function lesson02StepFromHash(hash) {
  const match = String(hash ?? "").match(/^#lesson-02\/step-(\d{2})$/);
  const step = Number(match?.[1]);
  return Number.isInteger(step) && step >= 1 && step <= 12 ? step : 1;
}

function lesson02Hash(step) {
  return "#lesson-02/step-" + String(step).padStart(2, "0");
}

const classroom = createElement("div", "classroom");
const sidebar = createElement("aside", "sidebar");
const brand = createElement("div", "brand");
const brandTitle = createElement("h1", "brand-title", "二次函数");
const brandSubtitle = createElement("p", "brand-subtitle", "互动课堂 · Lite");
const formula = createElement("div", "brand-formula");
renderFormula(formula, "y=ax^2+bx+c", { ariaLabel: "二次函数一般式" });
brand.append(brandTitle, brandSubtitle, formula);

const navigation = createElement("nav", "lesson-navigation");
navigation.setAttribute("aria-label", "课时导航");
const navigationTitle = createElement("p", "navigation-label", "本章课时");
const lessonList = createElement("ol", "lesson-list");
navigation.append(navigationTitle, lessonList);
sidebar.append(brand, navigation);

const stage = createElement("section", "lesson-stage");
stage.setAttribute("aria-live", "polite");
const stageLabel = createElement("p", "lesson-number");
const stageTitle = createElement("h2", "lesson-title");
const stageRule = createElement("div", "stage-rule");
const stageStatus = createElement("p", "stage-status", "课堂壳已就绪");
const stageMessage = createElement("p", "stage-message", "本课教学内容将在后续逐课加入。");

classroom.append(sidebar, stage);
root.replaceChildren(classroom);

let activeLesson02 = null;

function renderSidebar(activeLessonId) {
  lessonList.replaceChildren(...COURSE.map((item) => {
    const itemElement = document.createElement("li");
    const link = document.createElement("a");
    link.href = "#" + item.id;
    link.className = "lesson-link";
    link.dataset.lessonId = item.id;
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
  activeLesson02?.destroy();
  activeLesson02 = null;

  const lesson = getLessonFromHash(window.location.hash);
  const isLesson02 = lesson.id === "lesson-02";
  const step = isLesson02 ? lesson02StepFromHash(window.location.hash) : null;
  const canonicalHash = isLesson02 ? lesson02Hash(step) : "#" + lesson.id;
  if (window.location.hash !== canonicalHash) {
    window.history.replaceState(null, "", canonicalHash);
  }

  document.title = lesson.number + " · " + lesson.title + "｜二次函数互动课堂";
  renderSidebar(lesson.id);

  if (isLesson02) {
    stage.classList.add("lesson-stage-active");
    activeLesson02 = renderLesson02(stage, {
      step,
      onStepChange(nextStep) {
        window.location.hash = lesson02Hash(nextStep);
      },
    });
    return;
  }

  renderGenericLesson(lesson);
}

window.addEventListener("hashchange", render);
render();
