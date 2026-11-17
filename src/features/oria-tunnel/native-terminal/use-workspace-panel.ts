// OriaTunnel components/ui/use-workspace-panel.ts, 7c24929 (GPL-3.0-only).
import { useLayoutEffect, useRef, useState } from "react";
import {
  clampWorkspaceSize,
  workspaceBounds,
  workspaceMinimum,
  workspaceSizeLimit,
  type WorkspaceDock,
  type WorkspaceLayout,
} from "./workspace-layout";

export function useWorkspacePanel({
  open,
  container,
  storageKey,
  standalone,
  initialDock,
}: {
  open: boolean;
  storageKey: string;
  container: React.RefObject<HTMLDivElement | null>;
  standalone: boolean;
  initialDock: WorkspaceDock;
}) {
  const ref = useRef<HTMLElement>(null);
  const [layout, setLayout] = useState<WorkspaceLayout>({
    dock: initialDock,
    sizes: { bottom: standalone ? Infinity : 320, left: 400, right: 400 },
  });
  const { dock } = layout;
  const sideDock = dock !== "bottom";
  const [maximized, setMaximized] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [viewport, setViewport] = useState(() => ({
    width: 1056,
    height: standalone ? 520 : 328,
    headerBottom: 0,
    gap: standalone ? 0 : 4,
  }));
  const limit = workspaceSizeLimit(dock, viewport);
  const minimum = workspaceMinimum(dock);
  const clamp = (value: number) =>
    Math.max(Math.min(minimum, limit), clampWorkspaceSize(dock, value, limit));
  const size = clamp(layout.sizes[dock]);
  const bounds = workspaceBounds(dock, size, maximized, viewport);
  if (standalone) bounds.top = 0;
  const setSize = (value: number) =>
    setLayout((previous) => ({
      ...previous,
      sizes: { ...previous.sizes, [dock]: clamp(value) },
    }));
  const changeDock = (value: WorkspaceDock) => {
    setMaximized(false);
    setLayout((previous) => ({ ...previous, dock: value }));
  };
  useLayoutEffect(() => {
    const element = container.current;
    if (!element) return;
    const update = () =>
      setViewport({
        width: element.clientWidth,
        height: element.clientHeight,
        headerBottom: 0,
        gap: standalone ? 0 : 4,
      });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [container, standalone]);
  const scale = () => {
    const element = container.current;
    return element && element.offsetWidth
      ? element.getBoundingClientRect().width / element.offsetWidth
      : 1;
  };
  return {
    scale,
    ref,
    open,
    storageKey,
    layout,
    dock,
    sideDock,
    maximized,
    setMaximized,
    resizing,
    setResizing,
    viewport,
    limit,
    minimum,
    size,
    bounds,
    setSize,
    changeDock,
  };
}
export type WorkspacePanelState = ReturnType<typeof useWorkspacePanel>;
