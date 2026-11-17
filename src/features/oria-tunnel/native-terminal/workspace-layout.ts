// OriaTunnel components/ui/workspace-layout.ts, 7c24929 (GPL-3.0-only).
const workspaceGap = 4;
export const workspaceDocks = ["bottom", "left", "right"] as const;
export type WorkspaceDock = (typeof workspaceDocks)[number];
export type WorkspaceLayout = {
  dock: WorkspaceDock;
  sizes: Record<WorkspaceDock, number>;
};
export type WorkspaceViewport = {
  width: number;
  height: number;
  headerBottom: number;
  gap?: number;
};
export function workspaceSizeLimit(
  dock: WorkspaceDock,
  viewport: WorkspaceViewport,
) {
  const gap = viewport.gap ?? workspaceGap;
  return Math.max(
    0,
    dock === "bottom"
      ? viewport.height - viewport.headerBottom - gap * 2
      : viewport.width - gap * 2,
  );
}
export function workspaceBounds(
  dock: WorkspaceDock,
  size: number,
  maximized: boolean,
  viewport: WorkspaceViewport,
) {
  const gap = viewport.gap ?? workspaceGap;
  const fullWidth = Math.max(0, viewport.width - gap * 2);
  const fullHeight = workspaceSizeLimit("bottom", viewport);
  const width =
    dock === "bottom" || maximized
      ? fullWidth
      : clampWorkspaceSize(dock, size, fullWidth);
  const height =
    dock !== "bottom" || maximized
      ? fullHeight
      : clampWorkspaceSize(dock, size, fullHeight);
  return {
    left: dock === "right" ? viewport.width - gap - width : gap,
    top: viewport.height - gap - height,
    width,
    height,
  };
}
export const workspaceMinimum = (dock: WorkspaceDock) =>
  dock === "bottom" ? 200 : 280;
export const isWorkspaceDock = (value: unknown): value is WorkspaceDock =>
  workspaceDocks.some((dock) => dock === value);

export function clampWorkspaceSize(
  dock: WorkspaceDock,
  size: number,
  limit: number,
) {
  const maximum = Math.max(0, limit);
  return Math.min(
    Math.max(Math.min(workspaceMinimum(dock), maximum), size),
    maximum,
  );
}

// Pointer deltas follow the physical resize edge: right for left docks, left otherwise.
export function resizeWorkspace(
  dock: WorkspaceDock,
  size: number,
  delta: number,
  limit: number,
) {
  return clampWorkspaceSize(
    dock,
    size + (dock === "left" ? delta : -delta),
    limit,
  );
}

export function workspaceKeyboardSize(
  dock: WorkspaceDock,
  key: string,
  size: number,
  limit: number,
) {
  if (key === "Home") return clampWorkspaceSize(dock, 0, limit);
  if (key === "End") return limit;
  const negative = dock === "bottom" ? "ArrowUp" : "ArrowLeft";
  const positive = dock === "bottom" ? "ArrowDown" : "ArrowRight";
  if (key !== negative && key !== positive) return undefined;
  return resizeWorkspace(dock, size, key === negative ? -20 : 20, limit);
}
