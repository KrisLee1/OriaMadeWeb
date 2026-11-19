import {createPortal} from "react-dom";
import {useLayoutEffect, useMemo, useRef, useState, type ReactNode} from "react";
import {FileText, MousePointer2, TextCursor} from "lucide-react";
import {useTranslation} from "react-i18next";
import {walkthroughSteps, type Step, type TerminalScene} from "./walkthrough-steps";
import type {Locale} from "@/i18n/config";
import {ShortcutHint, platformShortcut} from "../shortcut-hint";
import {DemoPlaybackButton, useDemoPlayback} from "../demo-playback";
import {WalkthroughContext, type WalkthroughBindings} from "./walkthrough-context";

const keyNames: Record<string, string> = {ArrowRight: "→", ArrowUp: "↑", ArrowDown: "↓", Escape: "Esc"};
type Pointer = {x: number; y: number; pressed: boolean; text: boolean};


// Use the terminal's own wrapping and font metrics to aim at a character, including on mobile.
function targetPoint(target: HTMLElement, offset?: number) {
  if (offset !== undefined) {
    const mirror = target.parentElement?.querySelector(".shell-mirror");
    if (mirror) {
      const text = document.createTextNode((target as HTMLTextAreaElement).value);
      const probe = mirror.cloneNode(false) as HTMLElement;
      probe.append(text);
      mirror.after(probe);
      const range = document.createRange();
      range.setStart(text, offset);
      range.collapse(true);
      const rect = range.getBoundingClientRect();
      probe.remove();
      return {x: rect.left, y: rect.top + rect.height / 2};
    }
  }
  const rect = target.getBoundingClientRect();
  return {x: rect.left + Math.min(rect.width / 2, 48), y: rect.top + rect.height / 2};
}

function act(step: Step, guide: WalkthroughBindings, point: (p: Pointer | null) => void) {
  const host = guide.surface.current!;
  const input = host.querySelector<HTMLTextAreaElement>(".shell-edit textarea");
  if (!input) return false;
  if (step.action === "selectNote" || step.action === "pasteNote") return true;
  if (step.action === "hold") {point(null); return true;}
  if (step.action === "draft") {
    guide.draft.current?.(step.value, step.cursor ?? step.value.length);
    point(null);
  } else if (step.action === "key") {
    input.dispatchEvent(new KeyboardEvent("keydown", {key: step.key, bubbles: true, cancelable: true}));
    point(null);
  } else if (step.action === "tag") {
    if (!guide.tag.current) return false;
    guide.tag.current(step.value);
  } else {
    if (!("target" in step) && step.action !== "caret") return false;
    const target = step.action === "caret" ? input : host.querySelector<HTMLElement>(step.target);
    if (!target) return false;
    const pane = host.querySelector<HTMLElement>(".shell-transcript")!;
    // Scroll only the sample transcript. The reader keeps their place on the page.
    if (pane.contains(target)) {
      const rect = target.getBoundingClientRect(), bounds = pane.getBoundingClientRect();
      if (rect.top < bounds.top + 4) pane.scrollTop += rect.top - bounds.top - 4;
      else if (rect.bottom > bounds.bottom - 8) pane.scrollTop += rect.bottom - bounds.bottom + 8;
    }
    const pos = targetPoint(target, step.offset);
    const origin = host.getBoundingClientRect();
    point({x: pos.x - origin.left, y: pos.y - origin.top, pressed: step.action !== "point", text: target === input});
    if (step.action === "click") target.click();
    if (step.action === "caret") guide.draft.current?.(input.value, step.offset);
  }
  return true;
}

export function TerminalWalkthrough({scene, visible, children}: {
  scene: TerminalScene; visible: boolean; children: (run: number) => ReactNode;
}) {
  const {i18n} = useTranslation();
  const host = useRef<HTMLDivElement>(null);
  const automatic = useRef(false);
  const draft = useRef<WalkthroughBindings["draft"]["current"]>(null);
  const tag = useRef<WalkthroughBindings["tag"]["current"]>(null);
  const clipboard = useRef("");
  const note = useRef<HTMLTextAreaElement>(null);
  const [pasted, setPasted] = useState("");
  const guide = useMemo(() => ({surface: host, automatic, draft, tag, clipboard, copyScene: scene === "copy"}), [scene]);
  const [run, setRun] = useState(0);
  const [controls, setControls] = useState<Element | null>(null);
  useLayoutEffect(() => {
    setControls(visible ? host.current?.closest(".terminal-session-panel")?.querySelector(".terminal-identity") ?? null : null);
  }, [visible]);
  const [pointer, setPointer] = useState<Pointer | null>(null);
  const {mode, step, toggle} = useDemoPlayback({
    host, automatic, visible, steps: walkthroughSteps[scene], interactionRoot: ".terminal-workspace",
    apply: step => {
      if (step.action === "selectNote") note.current?.setSelectionRange(0,note.current.value.length);
      if (step.action === "pasteNote") setPasted(clipboard.current);
      return act(step, guide, setPointer);
    },
    reset: () => {setPasted(""); setPointer(null); setRun(n => n + 1);},
    clear: () => setPointer(null),
  });
  const playing = mode === "playing";
  const noteKey = step?.action === "pasteNote" ? "V" : step?.action === "selectNote" ? "A" : undefined;
  const badge = (playing || mode === "paused") && (noteKey ? platformShortcut(noteKey) :
    step?.action === "key" ? keyNames[step.key] ?? step.key : step?.action === "draft" ? step.badge : undefined);
  return <WalkthroughContext.Provider value={guide}>
    <div className="walkthrough-host" data-playback={mode} data-scene={scene} ref={host}>
      {children(run)}
      {scene === "copy" && <aside className="sample-paste-window" aria-label="clipboard.txt">
        <label><span><FileText size={14}/>clipboard.txt</span><textarea ref={note} aria-label="clipboard.txt" value={pasted}
          data-selected={step?.action === "selectNote" || undefined} spellCheck={false} onChange={e=>setPasted(e.target.value)}/></label>
      </aside>}
      {badge && <ShortcutHint host={host} target={noteKey ? ".sample-paste-window textarea" : ".shell-caret-anchor"} keys={badge}/>}
      {pointer && <span className="walkthrough-pointer" aria-hidden="true" data-pressed={pointer.pressed} data-text={pointer.text}
        style={{transform: `translate3d(${pointer.x}px,${pointer.y}px,0)`}}>{pointer.text ? <TextCursor size={17}/> : <MousePointer2 size={21}/>}</span>}
      {visible && controls && createPortal(<div className="walkthrough-controls">
        <DemoPlaybackButton locale={i18n.language as Locale} mode={mode} onClick={toggle}/>
      </div>, controls)}
    </div>
  </WalkthroughContext.Provider>;
}
