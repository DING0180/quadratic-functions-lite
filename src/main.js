import "./styles.css";
import { COURSE, getLessonFromHash } from "./course.js";
import { renderFormula } from "./formula.js";

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
stage.append(stageLabel, stageTitle, stageRule, stageStatus, stageMessage);

classroom.append(sidebar, stage);
root.replaceChildren(classroom);

function render() {
  const lesson = getLessonFromHash(window.location.hash);
  const canonicalHash = `#${lesson.id}`;
  if (window.location.hash !== canonicalHash) {
    window.history.replaceState(null, "", canonicalHash);
  }

  document.title = `${lesson.number} · ${lesson.title}｜二次函数互动课堂`;
  stageLabel.textContent = `LESSON ${lesson.number}`;
  stageTitle.textContent = lesson.title;

  lessonList.replaceChildren(...COURSE.map((item) => {
    const itemElement = document.createElement("li");
    const link = document.createElement("a");
    link.href = `#${item.id}`;
    link.className = "lesson-link";
    link.dataset.lessonId = item.id;
    if (item.id === lesson.id) link.setAttribute("aria-current", "page");

    const number = createElement("span", "lesson-link-number", item.number);
    const title = createElement("span", "lesson-link-title", item.title);
    link.append(number, title);
    itemElement.append(link);
    return itemElement;
  }));
}

window.addEventListener("hashchange", render);
render();
