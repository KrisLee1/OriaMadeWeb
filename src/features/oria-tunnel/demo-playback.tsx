import {useEffect, useLayoutEffect, useRef, useState, type RefObject} from "react";
import {Pause, Play, RotateCcw} from "lucide-react";
import type {Locale} from "@/i18n/config";

const labels = {
  en: ["Pause demo", "Play demo", "Replay demo"],
  "zh-CN": ["暂停演示", "播放演示", "重播演示"],
  "zh-TW": ["暫停示範", "播放示範", "重新播放示範"],
  de: ["Demo pausieren", "Demo abspielen", "Demo wiederholen"],
  fr: ["Mettre en pause", "Lire la démo", "Rejouer la démo"],
  ja: ["デモを一時停止", "デモを再生", "デモをもう一度再生"],
  ko: ["시연 일시 정지", "시연 재생", "시연 다시 재생"],
  ru: ["Приостановить показ", "Начать показ", "Повторить показ"],
};
type Playback = "ready" | "playing" | "paused" | "manual" | "done";

export function useDemoPlayback<T extends {delay: number}>({host, automatic, steps, visible = true, interactionRoot, apply, reset, clear}: {
  host: RefObject<HTMLElement | null>; automatic: RefObject<boolean>; steps: T[]; visible?: boolean;
  interactionRoot?: string; apply: (step: T) => boolean; reset: () => void; clear: () => void;
}) {
  const handlers = useRef({apply, reset, clear});
  useLayoutEffect(() => { handlers.current = {apply, reset, clear}; });
  const [mode, setMode] = useState<Playback>("ready");
  const [inView, setInView] = useState(false);
  const [foreground, setForeground] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [index, setIndex] = useState(-1);
  const step = steps[index];
  const start = () => {
    automatic.current = true;
    handlers.current.reset();
    setIndex(-1);
    setMode("playing");
  };
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motion = () => {
      setReduced(media.matches);
      if (media.matches) setMode(m => m === "playing" ? "paused" : m);
    };
    const visibility = () => setForeground(!document.hidden);
    const observer = new IntersectionObserver(([entry]) => setInView(entry.intersectionRatio >= .12), {threshold: [0, .12]});
    observer.observe(host.current!);
    motion(); visibility();
    media.addEventListener("change", motion);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", motion);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [host]);
  useEffect(() => {
    if (visible && inView && foreground && !reduced && mode === "ready") start();
  }, [visible, inView, foreground, reduced, mode]);
  useEffect(() => {
    if (!visible || !inView || !foreground || mode !== "playing") return;
    const timer = window.setTimeout(() => {
      const next = index + 1;
      if (next < steps.length && automatic.current && handlers.current.apply(steps[next])) {
        setIndex(next);
      } else {
        automatic.current = false;
        handlers.current.clear();
        setMode("done");
      }
    }, step?.delay ?? 680);
    return () => window.clearTimeout(timer);
  }, [visible, inView, foreground, mode, steps, step, index, automatic]);
  useEffect(() => {
    const panel = interactionRoot ? host.current!.closest(interactionRoot)! : host.current!;
    function takeOver(event: Event) {
      if (!event.isTrusted || !(event.target instanceof Element) || event.target.closest(".walkthrough-control")) return;
      automatic.current = false;
      handlers.current.clear();
      setMode("manual");
    }
    panel.addEventListener("pointerdown", takeOver, true);
    panel.addEventListener("keydown", takeOver, true);
    panel.addEventListener("focusin", takeOver, true);
    panel.addEventListener("beforeinput", takeOver, true);
    return () => {
      panel.removeEventListener("pointerdown", takeOver, true);
      panel.removeEventListener("keydown", takeOver, true);
      panel.removeEventListener("focusin", takeOver, true);
      panel.removeEventListener("beforeinput", takeOver, true);
    };
  }, [host, automatic, interactionRoot]);
  function toggle() {
    if (mode === "playing") setMode("paused");
    else if (mode === "paused") setMode("playing");
    else start();
  }
  return {mode, step, toggle};
}

export function DemoPlaybackButton({locale, mode, onClick}: {locale: Locale; mode: Playback; onClick: () => void}) {
  const replay = mode === "done" || mode === "manual";
  const words = labels[locale] ?? labels.en;
  const label = words[mode === "playing" ? 0 : replay ? 2 : 1];
  return <button className="walkthrough-control" type="button" title={label} aria-label={label} onClick={onClick}>
    {mode === "playing" ? <Pause/> : replay ? <RotateCcw/> : <Play/>}
  </button>;
}
