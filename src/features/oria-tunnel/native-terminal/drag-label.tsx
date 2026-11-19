export function workspacePoint(workspace: HTMLElement, clientX: number, clientY: number) {
  const bounds = workspace.getBoundingClientRect();
  return {
    x: (clientX - bounds.left) * workspace.offsetWidth / bounds.width - workspace.clientLeft,
    y: (clientY - bounds.top) * workspace.offsetHeight / bounds.height - workspace.clientTop,
  };
}

export function TerminalDragLabel({name}: {name: string}) {
  return <span className="terminal-drag-label" aria-hidden="true">
    <span className="terminal-tab-indicator" data-tone="success"/>{name}
  </span>;
}
