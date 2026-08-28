# Quadratic Functions Lite 全站双语术语设计

## 目标

在保持中文为主教学语言的前提下，为 Homepage、Sidebar 与 Lesson 01–11 建立一致、克制的英语数学术语辅助层。学生应能在中文课堂流程中自然接触国际数学课堂常用表达，而不是阅读整段的中英对照翻译。

## 范围与约束

- 保留课程结构、数学结论、教学顺序、交互、配色、图像、动画和 GitHub Pages 部署方式。
- 不引入 i18n 框架、语言开关、React 或新的组件系统。
- Sidebar 保持既有中文课程标题，避免压缩课堂工作区。
- 长篇题干、教师解释和反馈维持中文；仅核心概念、关键标题、属性标签与高频按钮加入英文。
- 必须在 1920×1080、1366×768、1280×720 下验证 Homepage 与 Lesson 01–11，重点排查标题、按钮、Sidebar、公式和 SVG 图像的溢出或挤压。

## 统一 glossary

新建 `src/math-terms.js`，作为全站唯一的术语与简短 UI 文案来源。它导出不可变的术语记录和轻量格式化函数；格式化函数只产出 `中文 (English)`，不会承担翻译、状态管理或 DOM 渲染。

首批术语统一为：

| 中文 | 统一英文 |
| --- | --- |
| 一次函数 | linear function |
| 二次函数 | quadratic function |
| 抛物线 | parabola |
| 一般式 | general form |
| 顶点式 | vertex form |
| 顶点 | vertex |
| 对称轴 | axis of symmetry |
| 根 | root |
| 实数根 | real root |
| 交点 | intersection |
| 判别式 | discriminant |
| 定义域 | domain |
| 区间 | interval |
| 端点 | endpoint |
| 最大值 | maximum |
| 最小值 | minimum |
| 开口向上 | opens upward |
| 开口向下 | opens downward |
| 平移 | translation |
| 二次项 | quadratic term |
| 一次项 | linear term |
| 常数项 | constant term |
| 二次项系数 | quadratic coefficient |
| 一次项系数 | linear coefficient |

相关 UI 文案统一使用短英文：`Home`、`Previous`、`Next`、`Restart Lesson`、`Reveal Answer`、`Reset`、`New Question`、`Check with Graph` 与 `Show Movement`。原有特定交互若有更清楚的短英文名称，仍由此模块集中维护。

## 标题和页面结构

`src/course.js` 继续只提供用于 Sidebar 的中文课程标题。每个 lesson 的步骤标题改为中文主标题及对应的英文副标题数据。Lesson 根节点渲染中文 `h2`，其后紧跟具有较低视觉权重的英文副标题；不把两种语言拼到同一行。

英文副标题用于步骤级关键标题，并使用课程术语表中的统一表达。普通属性表、readout、揭示结论和随机练习仅在术语位置采用括号格式，例如 `顶点 (vertex)：(2, -3)` 与 `对称轴 (axis of symmetry)：x=2`。坐标轴 `x`、`y` 和紧凑图像内标签保持不变。

## 样式与可访问性

为每个既有 lesson 标题系统增加同名 subtitle 选择器，或增加一个共享的低权重标题规则；英文采用较小字号、适度 letter-spacing 和浅墨绿色。标题容器、按钮组、属性表与 workspace 使用现有 `min-width: 0` 和 `flex-wrap` 模式，必要时仅在低高度桌面断点缩短间距或副标题字号。

更新受影响元素的 `aria-label`，使屏幕阅读器能读出一致的中文术语和英语术语。不会在 SVG 坐标区域添加额外英文文本。

## 实施与测试

1. 为 glossary、格式化函数、课程中文 Sidebar 标题、英文副标题和通用 UI 文案建立/更新 Vitest 覆盖。
2. 添加 glossary 模块和统一标题/按钮数据。
3. 依 Lesson 01–11 更新关键标题、属性标签、揭示结果、随机练习关键词和高频按钮；保留中文解释和数学逻辑。
4. 添加最小必要 CSS，确保英语副标题低于中文主标题且小屏幕不扩张 Sidebar。
5. 运行 `npm.cmd test` 与 `npm.cmd run build`。
6. 通过 Playwright 对 Homepage 和 Lesson 01–11 在三个指定桌面尺寸进行路由、控制台错误、滚动高度、可见溢出、按钮换行、公式和图像尺寸检查。

## 非目标

- 不翻译每一句教学文字。
- 不修改公式、图像数值、题目答案或教学步骤数。
- 不新增页面、路由、依赖、语言切换或部署配置。
