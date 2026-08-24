export function applyClassroomSplit(layout, workspace, visualization) {
  if (!layout || !workspace || !visualization) return layout;
  layout.classList.add("classroom-split");
  workspace.classList.add("classroom-workspace");
  visualization.classList.add("classroom-visualization");
  if (workspace.parentElement === layout && visualization.parentElement === layout) {
    layout.replaceChildren(workspace, visualization);
  }
  return layout;
}
