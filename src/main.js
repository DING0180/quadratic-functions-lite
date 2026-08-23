import "./styles.css";
import { COURSE, getLessonFromHash } from "./course.js";
import { renderFormula } from "./formula.js";
import { renderLesson01 } from "./lessons/lesson01.js";
import { renderLesson02 } from "./lessons/lesson02.js";
import { renderLesson03 } from "./lessons/lesson03.js";
import { renderLesson04 } from "./lessons/lesson04.js";
import { renderLesson05 } from "./lessons/lesson05.js";
import { renderLesson06 } from "./lessons/lesson06.js";
import { renderLesson07 } from "./lessons/lesson07.js";
import { renderLesson08 } from "./lessons/lesson08.js";
import { renderLesson09 } from "./lessons/lesson09.js";

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

let activeLesson = null;

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
  activeLesson?.destroy();
  activeLesson = null;

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
  const stepCount = isLesson01 ? 8 : isLesson02 ? 12 : isLesson03 ? 10 : isLesson04 ? 5 : isLesson05 ? 6 : isLesson06 ? 8 : isLesson07 ? 7 : isLesson08 ? 12 : isLesson09 ? 10 : 0;
  const step = stepCount ? lessonStepFromHash(window.location.hash, lesson.id, stepCount) : null;
  const canonicalHash = stepCount ? lessonStepHash(lesson.id, step) : "#" + lesson.id;
  if (window.location.hash !== canonicalHash) {
    window.history.replaceState(null, "", canonicalHash);
  }

  document.title = lesson.number + " · " + lesson.title + "｜二次函数互动课堂";
  renderSidebar(lesson.id);

  if (isLesson01 || isLesson02 || isLesson03 || isLesson04 || isLesson05 || isLesson06 || isLesson07 || isLesson08 || isLesson09) {
    stage.classList.add("lesson-stage-active");
    const renderer = isLesson01 ? renderLesson01 : isLesson02 ? renderLesson02 : isLesson03 ? renderLesson03 : isLesson04 ? renderLesson04 : isLesson05 ? renderLesson05 : isLesson06 ? renderLesson06 : isLesson07 ? renderLesson07 : isLesson08 ? renderLesson08 : renderLesson09;
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
render();


