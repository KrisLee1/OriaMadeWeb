import {useLayoutEffect, useRef, useState, type RefObject} from "react";
import {MousePointer2} from "lucide-react";
import {createPortal} from "react-dom";
import type {Locale} from "@/i18n/config";
import {FileDragArtwork} from "./native-file-artwork";
import {ShortcutHint, platformShortcut} from "./shortcut-hint";
import {DemoPlaybackButton, useDemoPlayback} from "./demo-playback";

type Step = {target: string; delay: number; click?: boolean; text?: string; ratio?: number; file?: "pick" | "hover" | "release"; shortcut?: "A" | "C" | "V"};
const local = ".vnc-clipboard input", remote = ".vnc-note textarea";
const picker = "[data-layout-picker]", panes = ".file-demo-browser > [role=separator]", queue = ".files-body > [role=separator]";
const point = (target: string, delay = 650): Step => ({target, delay});
const click = (target: string): Step[] => [point(target), {target, click: true, delay: 850}];
function drag(target: string, from: number, to: number): Step[] {
  const frames = 18;
  return [point(target), ...Array.from({length: frames}, (_, i) =>
    ({target, ratio: Math.round(from + (to - from) * (i + 1) / frames), delay: 55})), point(target, 700)];
}

const shortcut = (target: string, shortcut: "A" | "C" | "V"): Step => ({target, shortcut, delay: 880});
const clipboardSteps: Step[] = [
  point(local), ...Array.from("coast.svg", (_, i) => ({target: local, text: "coast.svg".slice(0, i+1), delay: 155})),
  shortcut(local, "A"), shortcut(local, "C"), point(remote), shortcut(remote, "A"), shortcut(remote, "V"),
  ...Array.from("-final", (_, i) => ({target: remote, text: "coast"+"-final".slice(0, i+1)+".svg", delay: 185})),
  shortcut(remote, "A"), shortcut(remote, "C"), point(local), shortcut(local, "A"), shortcut(local, "V"),
];

const layoutSteps: Step[] = [
  ...click(picker), ...click('[data-layout-choice="split"]'),
  ...drag(panes, 50, 65), ...drag(queue, 70, 48),
  ...click(picker), ...click('[data-layout-choice="rows"]'),
  ...drag(panes, 65, 48),
];

const sourceRow = '[data-side="source"] [data-entry="README.md"]';
const destinationRow = '[data-side="target"] [data-folder="assets"]';
const dropSteps: Step[] = [
  point(sourceRow, 650), {target: sourceRow, file: "pick", delay: 720},
  {target: destinationRow, file: "hover", delay: 1050},
  {target: destinationRow, file: "release", delay: 1150},
];

type Props = {host: RefObject<HTMLElement | null>; locale: Locale} & (
  | {scene: "clipboard"; local: (text: string) => void; remote: (text: string) => void}
  | {scene: "drop"; resetDrop: () => void; submitDrop: () => void}
  | {scene: "layout"; layout: (layout: string) => void; panes: (ratio: number) => void; queue: (ratio: number) => void}
);

export function PanelWalkthrough(props: Props) {
  const {host, locale, scene} = props;
  const automatic = useRef(false);
  const clipboard = useRef("");
  const clearSelection = () => host.current?.querySelectorAll<HTMLElement>("[data-sample-selection]").forEach(el => el.removeAttribute("data-sample-selection"));
  const [position, setPosition] = useState<{x: number; y: number} | null>(null);
  const steps = scene === "clipboard" ? clipboardSteps : scene === "drop" ? dropSteps : layoutSteps;
  const {mode, step, toggle} = useDemoPlayback({
    host, automatic, steps,
    reset() {
      setPosition(null);
      clearSelection();
      if (props.scene === "layout") { props.layout("rows"); props.panes(50); props.queue(70); }
      else if (props.scene === "drop") { props.resetDrop(); }
      else { props.local(""); props.remote("notes.txt"); }
    },
    clear: () => {setPosition(null); clearSelection(); host.current?.querySelector("[data-auto-drop]")?.removeAttribute("data-auto-drop");},
    apply(next) {
      const target = host.current?.querySelector<HTMLElement>(next.target);
      if (!target) return false;
      if (next.click) target.click();
      if (props.scene === "drop") {
        const list = target.closest(".files-viewport");
        if (list) {
          const bounds = list.getBoundingClientRect(), row = target.getBoundingClientRect();
          if (row.bottom > bounds.bottom) list.scrollTop += row.bottom - bounds.bottom;
          else if (row.top < bounds.top) list.scrollTop -= bounds.top - row.top;
        }
        if (next.file === "pick") target.click();
        target.toggleAttribute("data-auto-drop", next.file === "hover");
        if (next.file === "release") props.submitDrop();
      }
      if (props.scene === "clipboard" && (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
        const write = next.target === local ? props.local : props.remote;
        if (next.shortcut === "A") {
          clearSelection();
          target.setSelectionRange(0, target.value.length);
          target.setAttribute("data-sample-selection", "");
          const context = document.createElement("canvas").getContext("2d");
          if (context) {
            context.font = getComputedStyle(target).font;
            target.style.setProperty("--vnc-selection-width", context.measureText(target.value).width + "px");
          }
        } else if (next.shortcut === "C") {
          clipboard.current = target.value.slice(target.selectionStart ?? 0, target.selectionEnd ?? 0);
        } else {
          clearSelection();
          if (next.shortcut === "V") write(clipboard.current);
          else if (next.text !== undefined) write(next.text);
        }
      }
      if (props.scene === "layout" && next.ratio !== undefined) {
        (next.target === panes ? props.panes : props.queue)(next.ratio);
      }
      return true;
    },
  });

  // Re-measure after React applies the grid ratio, so the pointer follows the handle.
  useLayoutEffect(() => {
    if (!step || (mode !== "playing" && mode !== "paused")) return;
    const root = host.current;
    const target = root?.querySelector<HTMLElement>(step.target);
    if (!root || !target) return;
    const update = () => {
      const rect = target.getBoundingClientRect(), bounds = root.getBoundingClientRect();
      const x = rect.left - bounds.left + Math.min(rect.width / 2, step.text === undefined ? 60 : 18);
      const y = rect.top - bounds.top + Math.min(rect.height / 2, step.text === undefined ? 55 : 24);
      setPosition({x, y});
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(root);
    return () => observer.disconnect();
  }, [host, mode, step]);

  return <div className="panel-walkthrough walkthrough-controls" data-playback={mode}>
    {(mode === "playing" || mode === "paused") && step?.shortcut && <ShortcutHint host={host} target={step.target} keys={platformShortcut(step.shortcut)}/>}
    <DemoPlaybackButton mode={mode} locale={locale} onClick={toggle}/>
    {position && host.current && createPortal(<span className="walkthrough-pointer" aria-hidden="true"
      data-drag={step?.ratio !== undefined} data-pressed={step?.click || step?.ratio !== undefined || step?.file === "pick" || step?.file === "hover"}
      style={{transform: `translate3d(${position.x}px,${position.y}px,0)`}}><MousePointer2 size={21}/>{(step?.file === "pick" || step?.file === "hover") && <FileDragArtwork name="README.md"/>}</span>, host.current)}
  </div>;
}
