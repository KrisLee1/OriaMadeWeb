// Adapted from OriaTunnel 90da190, terminal-split-panels.tsx (GPL-3.0-only).
import {useImperativeHandle, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject, type ReactNode} from "react";
import {createPortal} from "react-dom";
import {TabsContent} from "@/components/ui/tabs";
import {FileDemoSeparator} from "../file-demo-controls";
import {groupPreviewShare, paneKeys, type PaneDrop, type PaneTree, type TerminalGroup} from "./terminal-splits";

type Preview = {source: string; drop: PaneDrop} | null;

function SessionPortal({slot, children}: {slot: () => HTMLElement | null; children: ReactNode}) {
  const [host, setHost] = useState<HTMLDivElement>();
  useLayoutEffect(() => {
    const element = document.createElement("div");
    element.className = "terminal-pane-host";
    setHost(element);
    return () => element.remove();
  }, []);
  useLayoutEffect(() => {
    const parent = slot();
    if (parent && host && host.parentNode !== parent) parent.appendChild(host);
  });
  return host && createPortal(children, host);
}

export function SplitPanels({groups, preview, renderPane, resizeLabel, resizeRef}: {
  groups: TerminalGroup[]; preview: Preview;
  renderPane: (key: string, group: TerminalGroup) => ReactNode;
  resizeRef: RefObject<((id: string, value: number) => void) | null>;
  resizeLabel: (horizontal: boolean) => string;
}) {
  const slots = useRef(new Map<string, HTMLDivElement>());
  const [sizes, setSizes] = useState<Record<string, number>>({});
  function resize(id: string, value: number) {
    setSizes(previous => ({...previous, [id]: value}));
  }
  useImperativeHandle(resizeRef, () => resize, []);
  const splits = new Set<string>();
  function branch(tree: PaneTree): ReactNode {
    if (typeof tree === "string") return <div className="terminal-pane-slot" ref={node => {
      if (node) slots.current.set(tree, node);
      else slots.current.delete(tree);
    }}/>;
    splits.add(tree.id);
    const horizontal = tree.axis === "horizontal";
    const size = sizes[tree.id] ?? tree.firstSize ?? 50;
    return <div key={tree.id} className="terminal-split" data-split-id={tree.id} style={{
      [horizontal ? "gridTemplateColumns" : "gridTemplateRows"]:
        `minmax(0, ${size}fr) 8px minmax(0, ${100 - size}fr)`,
    }}>
      {branch(tree.first)}
      <FileDemoSeparator label={resizeLabel(horizontal)} vertical={horizontal} value={size} minimum={12}
        onChange={value => resize(tree.id, value)}/>
      {branch(tree.second)}
    </div>;
  }
  useLayoutEffect(() => {
    if (Object.keys(sizes).some(key => !splits.has(key)))
      setSizes(Object.fromEntries(Object.entries(sizes).filter(([id]) => splits.has(id))));
  });
  return <>
    {groups.map(group => {
      const drop = preview?.drop;
      const side = drop && drop !== "tabs" && drop.scope === "group" && drop.target === group.tab ? drop.side : undefined;
      const share = side && preview && groupPreviewShare(group.tree, preview.source, side);
      return <TabsContent keepMounted key={group.tab} value={group.tab} className="terminal-group-panel"
        data-terminal-group={group.tab} data-split={typeof group.tree !== "string" || undefined}
        data-drop={share ? side : undefined} style={share ? {"--terminal-drop-size": share + "%"} as CSSProperties : undefined}>
        {branch(group.tree)}
      </TabsContent>;
    })}
    {groups.flatMap(group => paneKeys(group.tree).map(key =>
      <SessionPortal key={key} slot={() => slots.current.get(key) ?? null}>{renderPane(key, group)}</SessionPortal>))}
  </>;
}
