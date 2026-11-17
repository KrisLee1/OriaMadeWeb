// Shell block structure from OriaTunnel terminal-view and archived-command, 7c24929 (GPL-3.0-only).
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import {TerminalWalkthrough} from "./terminal-walkthrough";
import {useWalkthrough} from "./walkthrough-context";
import type {TerminalScene} from "./walkthrough-steps";
import { CommandEditor, CommandHeader } from "./command-editor";
import {
  exceedsPreviewHeight,
  type Prompt,
  type ShellQuery,
} from "./shell-editor";

const homeFor = { local: "/Users/demo", ssh: "/home/developer" };
const projectFiles = ["assets", "config.json", "logs", "README.md", "src"];
const logFiles = Array.from(
  { length: 32 },
  (_, index) => "session-" + String(index + 1).padStart(2, "0") + ".log",
);
function directory(home: string, path: string): string[] {
  if (path === "/") return [home.split("/")[1]];
  if (path === home.slice(0, home.lastIndexOf("/")))
    return [home.split("/").at(-1)!];
  if (path === home) return ["workspace"];
  if (path === home + "/workspace") return projectFiles;
  if (path === home + "/workspace/logs") return logFiles;
  return [];
}
type Block = { id: number; prompt: Prompt; command: string; output: string };
function CommandBlock({
  block,
  older,
  copy,
  focus,
}: {
  block: Block;
  older: boolean;
  copy: (text: string) => Promise<void>;
  focus: () => void;
}) {
  const [folded, setFolded] = useState(false);
  const [limited, setLimited] = useState(false);
  const manual = useRef(false);
  const output = useRef<HTMLPreElement>(null);
  useLayoutEffect(() => {
    const pre = output.current,
      pane = pre?.closest(".shell-transcript");
    if (!older || manual.current || !pre || !pane) return;
    const measure = () => {
      if (pane.clientHeight && !manual.current)
        setLimited(
          exceedsPreviewHeight(
            pre.scrollHeight,
            pane.clientHeight,
            parseFloat(getComputedStyle(pre).lineHeight),
          ),
        );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(pane);
    return () => observer.disconnect();
  }, [older, folded]);
  return (
    <section className="shell-block" data-copy-example={block.command === "ls" || undefined} data-output-folded={limited || undefined}>
      <div className="shell-sticky">
        <CommandHeader
          prompt={block.prompt}
          command={block.command}
          readCopy={() => block}
          copy={copy}
          focus={focus}
          commandFolded={folded}
          toggleCommand={() => setFolded((value) => !value)}
          limited={limited}
          toggleOutput={() => {
            manual.current = true;
            setLimited((value) => !value);
          }}
        />
        {!folded && <pre className="shell-command">$ {block.command}</pre>}
      </div>
      {!folded && block.output && (
        <pre className="shell-output-text scroll-fade" ref={output}>
          {block.output}
        </pre>
      )}
    </section>
  );
}

type SessionProps = {
  target: "local" | "ssh";
  example: boolean;
  visible: boolean;
  notice: string;
  scene?: TerminalScene;
};

export function SampleSession(props: SessionProps) {
  return props.scene ? <TerminalWalkthrough scene={props.scene} visible={props.visible}>
    {run => <SessionSurface key={run} {...props} guided={run > 0}/>}
  </TerminalWalkthrough> : <SessionSurface {...props}/>;
}

function SessionSurface({target, example, visible, notice, scene, guided}: SessionProps & {guided?: boolean}) {
  const guide = useWalkthrough();
  const home = homeFor[target];
  const workspace = home + "/workspace";
  const logs = workspace + "/logs";
  const start = scene === "output" || scene === "directory" ? logs : example ? workspace : home;
  const [cwd, setCwd] = useState(start);
  const [blocks, setBlocks] = useState<Block[]>(() => {
    const block = (id: number, cwd: string, command: string, output = "") =>
      ({ id, prompt: { cwd, home }, command, output });
    if (guided && scene === "output") return [block(0, workspace, "cd logs")];
    if (scene === "output") return [block(0, logs, "ls -1", logFiles.join("\n")), block(1, logs, "pwd", logs)];
    if (scene === "directory") return [block(0, workspace, "cd logs"), block(1, logs, "pwd", logs)];
    if (scene === "library" || scene === "multiline") return [block(0, home, "cd workspace")];
    return example ? [block(0, home, "cd workspace"), block(1, workspace, "ls", projectFiles.join("  "))] : [];
  });
  const initialLine = guided ? "" : scene === "completion" ? "pw" : scene === "library" ? "files" : scene === "multiline" ? "pwd\nls" : "";
  const [copyError, setCopyError] = useState(false);
  const input = useRef<HTMLTextAreaElement>(null);
  const transcript = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const pane = transcript.current;
    const surface = pane?.querySelector(".shell-surface");
    if (!visible || !pane || !surface) return;
    let clipped: HTMLElement | null = null;
    // OriaTunnel terminal-view: preserve the translucent panel by clipping only
    // the strip of output painted beneath the currently pinned command.
    const sync = () => {
      const top = pane.getBoundingClientRect().top;
      const children = surface.children;
      let low = 0, high = children.length;
      while (low < high) {
        const mid = Math.floor((low + high) / 2);
        if (children[mid].getBoundingClientRect().bottom <= top) low = mid + 1;
        else high = mid;
      }
      const header = children[low]?.firstElementChild;
      const output = header?.nextElementSibling;
      const rect = header?.getBoundingClientRect();
      const overlap = rect && output ? rect.bottom - output.getBoundingClientRect().top : 0;
      if (clipped && (clipped !== output || overlap <= 0)) clipped.style.removeProperty("clip-path");
      clipped = overlap > 0 && output instanceof HTMLElement ? output : null;
      if (clipped && rect) {
        const from = Math.max(0, overlap - rect.height);
        clipped.style.clipPath = `polygon(0 0,100% 0,100% ${from}px,0 ${from}px,0 ${overlap}px,100% ${overlap}px,100% 100%,0 100%)`;
      }
    };
    sync();
    const resize = new ResizeObserver(sync);
    resize.observe(pane);
    resize.observe(surface);
    pane.addEventListener("scroll", sync, {passive: true});
    return () => {
      resize.disconnect();
      pane.removeEventListener("scroll", sync);
      clipped?.style.removeProperty("clip-path");
    };
  }, [visible, blocks]);
  const focus = () => { if (!guide?.automatic.current) input.current?.focus({ preventScroll: true }); };
  const query: ShellQuery = useCallback(
    async (operation, value) => {
      if (operation === "cd") return [value];
      if (operation === "list")
        return directory(home, value).filter((name) => !name.includes("."));
      const choices =
        operation === "commands"
          ? ["cd", "ls", "pwd"]
          : directory(home, cwd)
              .filter((name) => operation !== "dirs" || !name.includes("."))
              .map((name) => (name.includes(".") ? name : name + "/"));
      return choices.filter((name) => name.startsWith(value));
    },
    [home, cwd],
  );
  function submit(line: string) {
    const command = line.trim();
    if (!command) return;
    let location = cwd;
    const results = command.split("\n").map(raw => {
      const part = raw.trim();
      const names = directory(home, location);
      if (!part) return "";
      if (part === "pwd") return location;
      if (part === "ls" || part === "ls -1") return names.join(part === "ls" ? "  " : "\n");
      if (part === "cd" || part.startsWith("cd ")) {
        const path = part.slice(2).trim().replace(/\/$/, "");
        if (!path || path === "~") location = home;
        else if (path === "..") location = location.slice(0, location.lastIndexOf("/")) || "/";
        else if (names.includes(path) && !path.includes(".")) location = location.replace(/\/$/, "") + "/" + path;
        else return notice;
        return "";
      }
      return notice;
    });
    setCwd(location);
    const output = results.filter(Boolean).join("\n");
    setBlocks((previous) => [
      ...previous.slice(-199),
      {
        id: (previous.at(-1)?.id ?? -1) + 1,
        prompt: { home, cwd },
        command,
        output,
      },
    ]);
    requestAnimationFrame(() => {
      const pane = transcript.current;
      if (pane) pane.scrollTop = pane.scrollHeight;
    });
  }
  async function copy(text: string) {
    if (scene === "copy" && guide?.automatic.current) {
      guide.clipboard.current = text;
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  }
  return (
    <div className="ssh-terminal-view">
      <div
        className="shell-transcript integrated"
        ref={transcript}
        onClick={(event) => {
          if (
            event.target === event.currentTarget ||
            (event.target as HTMLElement).classList.contains("shell-surface")
          )
            focus();
        }}
      >
        <div className="shell-surface">
          {blocks.map((block, index) => (
            <CommandBlock
              key={block.id}
              block={block}
              older={index < blocks.length - 1}
              copy={copy}
              focus={focus}
            />
          ))}
          <div className="shell-current-block">
            <div className="shell-sticky">
              <CommandHeader
                prompt={{ cwd, home }}
                directory={{ query, changed: setCwd }}
                focus={focus}
                copy={copy}
                readCopy={() => ({
                  command: input.current?.value ?? "",
                  output: "",
                })}
              />
              <CommandEditor
                initialLine={initialLine}
                query={query}
                history={[
                  ...new Set(blocks.map((block) => block.command).reverse()),
                ]}
                submit={submit}
                inputRef={input}
                visible={visible}
                cwd={cwd}
              />
            </div>
          </div>
          {copyError && <small role="status">Ctrl+C / ⌘C</small>}
        </div>
      </div>
    </div>
  );
}
