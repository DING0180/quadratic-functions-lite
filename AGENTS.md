# Quadratic Functions Lite：永久 Lesson 开发与部署工作流

## 正式项目边界

- 唯一正式本地 Repository：`D:\桌面\quadratic-functions-lite`
- 唯一正式 GitHub Repository：`https://github.com/DING0180/quadratic-functions-lite.git`
- 唯一正式开发与部署分支：`main`
- 唯一正式线上网站：`https://ding0180.github.io/quadratic-functions-lite/`
- Lesson 01–11 都属于同一个 Vite 网站、同一个 Sidebar 与同一条 Git 历史。

任何 Lesson 专属对话都禁止：

- 创建新的 Vite 项目、独立网站、独立 `index.html`、第二套 Sidebar 或 Router；
- 复制项目后重新执行 `git init`；
- 创建第二个 Git Repository、第二个 GitHub Repository 或第二个正式 `main`；
- 建立与正式 `origin/main` 没有共同祖先的 Git 历史；
- 为绕过历史问题使用 `git merge --allow-unrelated-histories`。

`origin/main` 是唯一正式真源。不要先完成 Lesson 再设法接入 GitHub；必须先同步正式 `main`，再开始开发。

## Lesson 06–11：修改源代码前的强制 Git Preflight

任何 Lesson 06–11 专属对话在修改**任何源代码之前**，必须先完整读取本文件，并在正式项目根目录运行：

```powershell
git rev-parse --show-toplevel
git status
git branch --show-current
git remote -v
git fetch origin
git merge-base main origin/main
```

只有以下条件全部成立，才可开始写当前 Lesson：

1. Git 根目录是 `D:\桌面\quadratic-functions-lite`；
2. 当前正式开发分支是 `main`；
3. `origin` 存在，且 fetch/push URL 均指向 `https://github.com/DING0180/quadratic-functions-lite.git`；
4. `main` 与 `origin/main` 能得到共同祖先；
5. 已经 `git fetch origin`，并以最新 `origin/main` 为开发基线；
6. 开始新 Lesson 前 working tree 是干净的。

若发现未提交改动，禁止删除、覆盖、stash 丢失或混入当前 Lesson；应先保留并厘清其归属，再开始新 Lesson。

若缺少 `origin`，立即修复：

```powershell
git remote add origin https://github.com/DING0180/quadratic-functions-lite.git
git remote -v
```

若 `origin` URL 不正确，立即修复：

```powershell
git remote set-url origin https://github.com/DING0180/quadratic-functions-lite.git
git remote -v
```

若 `git merge-base main origin/main` 没有共同祖先，禁止开始开发；不得把 Lesson 先做完再修 Git，也不得使用 unrelated-histories 合并。应先恢复到正式 `origin/main` 基线。

## 单人项目的开发、提交与部署

本项目由单人维护，Lesson 06–11 不强制 Pull Request、feature branch、用户中途 Review 或 Merge 确认。基线正确时，采用：

```text
Git Preflight → 实施当前 Lesson → test → build → commit → fetch → push origin/main → Pages → 在线验收
```

正常实施中不要询问用户是否允许设计、commit、push、部署、PR 或 merge；这些步骤已获统一授权。普通 Git 配置问题、origin 缺失、测试失败、构建失败与可处理的代码冲突，应优先自行解决。

只有真正的外部硬阻塞才可暂停并向用户说明，例如：GitHub 登录需要账户本人重新授权、写权限被撤销、GitHub 网络完全不可达、或文件系统禁止访问正式 Repository。

## 当前 Lesson 的独立提交

完成当前 Lesson 后必须运行：

```powershell
npm.cmd test
npm.cmd run build
```

失败时自行修复并重复验证，直到 test PASS 且 build PASS。

提交前必须检查：

```powershell
git status
git diff
git diff --cached
```

一个 Lesson commit 只能包含：

- 当前 Lesson 的文件；
- 当前 Lesson 确实需要的少量共享能力调整。

不得混入上一 Lesson 残留、其他 Lesson 的未提交代码、无关删除、PDF/文档临时变化、`node_modules`、`dist`、缓存、临时 worktree 或其他临时文件。每个 Lesson 保持独立、清晰的版本节点，例如：`feat: implement lesson 06 ...`。

Commit 后再次执行：

```powershell
git fetch origin
git push origin main
```

确认开发期间没有未知远端提交，并仅在可正常 fast-forward 时推送。禁止默认或常规使用：

```powershell
git push --force
git push --force-with-lease
```

如果正常 `git push origin main` 因 Codex shell 无法连接 `github.com:443` 失败，但 GitHub Plugin / Connector 可用，则不要要求用户手动 push。自动切换到 GitHub Plugin / Connector，将当前 Lesson 的已验证净文件变化同步到远端 `main`，然后继续 Pages 和线上验收。

## GitHub Pages 与在线验收

推送 `main` 成功后不得立即停止。检查现有 GitHub Pages workflow，等待其从 queued 到 in progress 再到 success；然后实际打开：

`https://ding0180.github.io/quadratic-functions-lite/`

在线验收至少确认：

- 网站可正常打开，Sidebar 正常；
- 当前 Lesson 可以进入，且不是旧版本；
- 当前核心交互、KaTeX 公式和函数图像正常；
- 之前 Lesson 没有明显 regression。

在线验收成功才算当前 Lesson 完成。完成后停止，不自行开始下一 Lesson。

## 专属对话的固定职责

Lesson 06–11 专属对话只需接收该 Lesson 的教学需求。随后必须依次：

1. 读取本文件；
2. 完成 Git Preflight 并确认最新 `origin/main` 基线；
3. 直接实施当前 Lesson；
4. 通过 test 与 build；
5. 仅提交当前 Lesson；
6. 正常 push `main`；
7. 等待 GitHub Pages；
8. 完成线上验收；
9. 停止，不自行启动下一 Lesson。

永久目标是保持一条可追溯的正式历史：Lesson 05 → Lesson 06 → Lesson 07 → Lesson 08 → Lesson 09 → Lesson 10 → Lesson 11。不得再次出现 `no origin`、unrelated histories、不同 Repository 的本地/远端 `main`，或 Lesson 完成后才发现无法部署的情况。
