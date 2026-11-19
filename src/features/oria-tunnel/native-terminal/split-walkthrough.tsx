import {useLayoutEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";
import {MousePointer2} from "lucide-react";
import type {Locale} from "@/i18n/config";
import {DemoPlaybackButton, useDemoPlayback} from "../demo-playback";
import {TerminalDragLabel, workspacePoint} from "./drag-label";

type Step = {action: "pick" | "drag" | "preview" | "join" | "grip" | "resize" | "release"; progress?: number; delay: number};
function motion(action: "drag" | "resize", frames: number): Step[] {
  return Array.from({length: frames}, (_, i) => {
    const t = (i + 1) / frames;
    return {action, progress: t * t * (3 - 2 * t), delay: 20};
  });
}
const steps: Step[] = [
  {action: "pick", delay: 400}, ...motion("drag", 30),
  {action: "preview", delay: 480}, {action: "join", delay: 520},
  {action: "grip", delay: 320}, ...motion("resize", 30), {action: "release", delay: 650},
];
type Point = {x: number; y: number};

export function SplitWalkthrough({locale, name, reset, showPreview, clear, join, resize}: {
  locale: Locale; name: string; reset: () => void; showPreview: () => void;
  clear: () => void; join: () => void; resize: (id: string, value: number) => void;
}) {
  const host = useRef<HTMLSpanElement>(null);
  const automatic = useRef(false);
  const [path, setPath] = useState<{from: Point; to: Point} | null>(null);
  const [divider, setDivider] = useState<HTMLElement | null>(null);
  const surface = host.current?.closest<HTMLElement>(".terminal-workspace");
  function clearPointer() { setPath(null); setDivider(null); }

  const {mode, step, toggle} = useDemoPlayback({host, automatic, steps, interactionRoot: ".terminal-workspace",
    reset: () => {clearPointer(); reset();},
    clear: () => {clearPointer(); clear();},
    apply: next => {
      if (next.action === "preview") showPreview();
      if (next.action === "join") join();
      if (next.action === "grip") {
        const split = surface?.querySelector("[data-split-target]")?.closest(".terminal-split");
        const handle = split?.querySelector<HTMLElement>(":scope > [role=separator]");
        if (!handle) return false;
        setDivider(handle);
      }
      if (next.action === "resize") {
        const id = divider?.parentElement?.dataset.splitId;
        if (!id) return false;
        resize(id, 50 + 15 * next.progress!);
      }
      return true;
    }});

  const carrying = step?.action === "pick" || step?.action === "drag" || step?.action === "preview";
  const visible = mode === "playing" || mode === "paused";
  useLayoutEffect(() => {
    if (!surface || !carrying || !visible) return;
    const tab = surface.querySelector<HTMLElement>(".terminal-draggable-tab[data-split-source]");
    const pane = surface.querySelector<HTMLElement>("[data-split-target]");
    if (!tab || !pane) return;
    const measure = () => {
      const start = tab.getBoundingClientRect(), end = pane.getBoundingClientRect();
      setPath({
        from: workspacePoint(surface, start.left + start.width / 2, start.top + start.height / 2),
        to: workspacePoint(surface, end.left + end.width * .85, end.top + end.height / 2),
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    for (const el of [surface, tab, pane]) observer.observe(el);
    return () => observer.disconnect();
  }, [surface, carrying, visible]);

  const progress = step?.action === "pick" ? 0 : step?.progress ?? 1;
  const position = path && {
    left: path.from.x + (path.to.x - path.from.x) * progress,
    top: path.from.y + (path.to.y - path.from.y) * progress,
  };
  const parent = divider ?? surface;
  return <span className="walkthrough-controls" ref={host}>
    <DemoPlaybackButton locale={locale} mode={mode} onClick={toggle}/>
    {visible && parent && position && createPortal(<span aria-hidden="true" className="walkthrough-pointer terminal-split-pointer"
      data-pressed={carrying || step?.action === "grip" || step?.action === "resize"}
      style={divider ? {left: "50%", top: "50%"} : position}>
      {carrying && <TerminalDragLabel name={name}/>}
      <MousePointer2 size={21}/>
    </span>, parent)}
  </span>;
}
