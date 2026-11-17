import {useLayoutEffect, useRef, type RefObject} from "react";
import {createPortal} from "react-dom";

export function platformShortcut(key: string) {
  return (/Mac|iPhone|iPad/i.test(navigator.platform) ? "⌘" : "Ctrl") + " + " + key;
}

export function ShortcutHint({host, target, keys}: {
  host: RefObject<HTMLElement | null>; target: string; keys: string;
}) {
  const badge = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const root = host.current, tag = badge.current;
    if (!root || !tag) return;
    const place = () => {
      const anchor = root.querySelector<HTMLElement>(target);
      if (!anchor) {tag.hidden = true; return;}
      tag.hidden = false;
      const box = anchor.getBoundingClientRect(), bounds = root.getBoundingClientRect();
      let x = box.left, y = box.top, bottom = box.bottom;
      if (anchor instanceof HTMLInputElement || anchor instanceof HTMLTextAreaElement) {
        const style = getComputedStyle(anchor), scale = box.width / anchor.offsetWidth;
        const lines = anchor.value.slice(0, anchor.selectionEnd ?? anchor.value.length).split("\n");
        const measure = document.createElement("canvas").getContext("2d");
        if (measure) measure.font = style.font;
        x += (parseFloat(style.paddingLeft) + (measure?.measureText(lines.at(-1)!).width ?? 0) - anchor.scrollLeft) * scale;
        y += (parseFloat(style.paddingTop) + (lines.length-1)*(parseFloat(style.lineHeight)||16) - anchor.scrollTop) * scale;
        bottom = y + (parseFloat(style.lineHeight)||16) * scale;
      }
      const left = Math.max(3, Math.min(x-bounds.left+9, bounds.width-tag.offsetWidth-3));
      const above = y-bounds.top-tag.offsetHeight-5;
      tag.style.left = left + "px";
      tag.style.top = Math.max(2,Math.min(above >= 2 ? above : bottom-bounds.top+5, bounds.height-tag.offsetHeight-2)) + "px";
    };
    place();
    const resize = new ResizeObserver(place);
    resize.observe(root);
    root.addEventListener("scroll",place,true);
    return () => {resize.disconnect(); root.removeEventListener("scroll",place,true);};
  }, [host, target, keys]);
  return host.current ? createPortal(<kbd ref={badge} className="demo-shortcut-hint" aria-hidden="true">{keys}</kbd>,host.current) : null;
}
