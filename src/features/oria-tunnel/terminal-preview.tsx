"use client";

// Terminal workspace layout and targets adapted from OriaTunnel 7c24929 (GPL-3.0-only).
import { useId, useRef, useState } from "react";
import {createPortal} from "react-dom";
import {TerminalDragLabel} from "./native-terminal/drag-label";
import { createInstance } from "i18next";
import { I18nextProvider, useTranslation } from "react-i18next";
import { GripVertical, PanelsTopLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Locale } from "@/i18n/config";
import { terminalUpdateCopy } from "./terminal-update-copy";
import { WorkspacePanel } from "./native-terminal/workspace-panel";
import { useWorkspacePanel } from "./native-terminal/use-workspace-panel";
import {
  SavedCommandsButton,
  SavedCommandsProvider,
} from "./native-terminal/saved-commands";
import { TerminalTargets } from "./native-terminal/terminal-targets";
import type {TerminalScene} from "./native-terminal/walkthrough-steps";
import { SampleSession } from "./native-terminal/sample-session";
import {Modal, ModalActions} from "./native-terminal/library-dialog";
import {Dialog} from "@base-ui/react/dialog";
import {SplitWalkthrough} from "./native-terminal/split-walkthrough";
import {SplitPanels} from "./native-terminal/split-panels";
import {usePaneDrag} from "./native-terminal/use-pane-drag";
import {movePane, paneKeys, reconcileGroups, type PaneDrop, type SplitSide, type TerminalGroup} from "./native-terminal/terminal-splits";
import messages from "./native-terminal/messages.json";

const host = {
  id: "dev",
  name: "dev-workspace",
  address: "dev.example.test",
  port: 22,
  user: "developer",
  diagnostics: [],
};
const targets = [host];
type Session = { id: string; local: boolean; example: boolean };
type Props = {
  locale: Locale;
  open: boolean;
  onClose: () => void;
  standalone?: boolean;
  scene?: TerminalScene | "split";
  initialDock?: "bottom" | "right";
};

const keySides: Record<string, SplitSide> = {ArrowLeft: "left", ArrowRight: "right", ArrowUp: "top", ArrowDown: "bottom"};
function Workspace({
  locale,
  open,
  onClose,
  standalone = false,
  scene,
  initialDock = "bottom",
}: Props) {
  const { t } = useTranslation("terminal");
  const container = useRef<HTMLDivElement>(null);
  const panel = useWorkspacePanel({
    open,
    container,
    storageKey: useId(),
    standalone,
    initialDock,
  });
  const samples: Session[] = standalone
    ? [{id: "local", local: true, example: true}, {id: "ssh", local: false, example: true}]
    : [{id: "ssh", local: false, example: true}];
  const [sessions, setSessions] = useState(samples);
  const [active, setActive] = useState(samples[0].id);
  const counter = useRef(0);
  const initialGroups = (items: Session[]) => reconcileGroups([], items.map(item => item.id));
  const demoTarget = sessions.find(s => s.local) ?? sessions[0];
  const demoSource = sessions.find(s => !s.local && s !== demoTarget) ?? sessions.find(s => s !== demoTarget);
  const demoDrop = {scope: "pane", target: demoTarget?.id ?? "local", side: "right"} as const;
  const [groups, setGroups] = useState<TerminalGroup[]>(() => scene === "split"
    ? movePane(initialGroups(samples), "ssh", demoDrop, "example") : initialGroups(samples));
  const [demoPreview, setDemoPreview] = useState<{source: string; drop: PaneDrop} | null>(null);
  const [closing, setClosing] = useState<string[]>([]);
  const [previousScene, setPreviousScene] = useState(scene);
  function prepareScene(combine: boolean) {
    const missing = samples.filter(item => !sessions.some(s => s.id === item.id));
    const items = [...sessions, ...missing.slice(0, 8 - sessions.length)];
    const target = items.find(s => s.local) ?? items[0];
    const source = items.find(s => !s.local && s !== target) ?? items.find(s => s !== target);
    setSessions(items);
    const restored = reconcileGroups(groups, items.map(item => item.id));
    const detached = source ? movePane(movePane(restored, source.id, "tabs", ""), target.id, "tabs", "") : restored;
    setGroups(combine && source ? movePane(detached, source.id, {scope: "pane", target: target.id, side: "right"}, "example") : detached);
    setActive(target.id);
    setDemoPreview(null);
  }
  if (previousScene !== scene) {
    setPreviousScene(scene);
    prepareScene(scene === "split");
  }
  const selectedGroup = groups.find(group => paneKeys(group.tree).includes(active));
  const endpoint = (session: Session) => session.local ? "/bin/zsh" : host.user + "@" + host.address + ":" + host.port;
  const label = (session: Session) => session.local ? t("localTerminal") + " · zsh" : host.name;
  function add(local: boolean) {
    if (sessions.length >= 8) return;
    const id = "session-" + counter.current++;
    setSessions([...sessions, {id, local, example: false}]);
    setGroups([...groups, {tab: id, tree: id}]);
    setActive(id);
  }
  function close(ids: string[]) {
    const remaining = sessions.filter(session => !ids.includes(session.id));
    setSessions(remaining);
    setGroups(reconcileGroups(groups, remaining.map(s => s.id)));
    if (ids.includes(active)) setActive(remaining.at(-1)?.id ?? "");
    setClosing([]);
  }
  function place(source: string, drop: PaneDrop) {
    const splitId = "split-" + counter.current++;
    setGroups(previous => movePane(previous, source, drop, splitId));
    setActive(source);
  }
  const resizeSplit = useRef<((id: string, value: number) => void) | null>(null);
  const list = useRef<HTMLDivElement>(null);
  const drag = usePaneDrag(list, place);
  const preview = drag.preview ?? demoPreview;
  function closeButton(ids: string[], name: string) {
    return <Button type="button" size="icon-sm" variant="ghost" aria-label={name} title={name}
      onClick={() => ids.length > 1 ? setClosing(ids) : close(ids)}><X/></Button>;
  }
  return (
    <div
      ref={container}
      className="terminal-bounds tunnel-terminal-ui"
      data-open={open}
      data-standalone={standalone || undefined}
    >
      <WorkspacePanel
        panel={panel}
        title={t("workspace")}
        onClose={onClose}
        className="terminal-workspace"
        actions={
          <>
            {scene === "split" && open && <SplitWalkthrough locale={locale} name={demoSource ? label(demoSource) : ""}
              resize={(id, value) => resizeSplit.current?.(id, value)} reset={() => prepareScene(false)}
              showPreview={() => demoSource && setDemoPreview({source: demoSource.id, drop: demoDrop})}
              clear={() => setDemoPreview(null)} join={() => {setDemoPreview(null); if (demoSource) place(demoSource.id, demoDrop);}}/>}
            {drag.ghost && createPortal(<span className="terminal-drag-overlay" aria-hidden="true"
              style={{left: drag.ghost.x, top: drag.ghost.y}}><TerminalDragLabel name={drag.ghost.name}/></span>, drag.ghost.workspace)}
            <SavedCommandsButton />
            <TerminalTargets
              menu
              hosts={targets}
              busy={sessions.length >= 8}
              choose={(host) => add(host === null)}
            />
          </>
        }
      >
        {selectedGroup ? (
          <Tabs className="terminal-tabs" value={selectedGroup.tab} onValueChange={id => {
            if (typeof id === "string") setActive(id);
          }}>
            <TabsList ref={list} variant="line" className="terminal-tab-list" aria-label={t("workspace")}
              data-drop={preview?.drop === "tabs" || undefined}>
              {groups.map(group => {
                const members = paneKeys(group.tree);
                const grouped = members.length > 1;
                const session = sessions.find(s => s.id === group.tab)!;
                const canDock = !grouped && group !== selectedGroup;
                const title = grouped ? members.map(id => label(sessions.find(s => s.id === id)!)).join(" · ") : endpoint(session);
                return <div className="terminal-tab-entry" key={group.tab}>
                  <TabsTrigger value={group.tab} title={title} data-split-source={group.tab === demoSource?.id || undefined}
                    className={canDock ? "terminal-draggable-tab" : undefined}
                    {...(canDock && drag.handle(group.tab, false, label(session)))}
                    aria-keyshortcuts={canDock ? "Alt+ArrowLeft Alt+ArrowRight Alt+ArrowUp Alt+ArrowDown" : undefined}
                    onKeyDownCapture={event => {
                      const side = keySides[event.key];
                      if (!canDock || !side || !event.altKey) return;
                      event.preventDefault();
                      event.stopPropagation();
                      place(group.tab, {scope: event.shiftKey ? "group" : "pane", target: event.shiftKey ? selectedGroup.tab : active, side});
                    }}>
                    {grouped ? <PanelsTopLeft/> : <span className="terminal-tab-indicator" data-tone="success"/>}
                    <span className="terminal-tab-label">{grouped ? t("terminalGroup") : label(session)}</span>
                    {grouped && <span>{members.length}</span>}
                  </TabsTrigger>
                  {closeButton(members, grouped ? t("closeGroup") : t("closeTab") + " " + label(session))}
                </div>;
              })}
            </TabsList>
            <div className="terminal-view-area">
              <SplitPanels resizeRef={resizeSplit} groups={groups} preview={preview} resizeLabel={horizontal => t(horizontal ? "resizeWidth" : "resize")}
                renderPane={(id, group) => {
                  const session = sessions.find(s => s.id === id)!;
                  const grouped = typeof group.tree !== "string";
                  const identity = grouped ? (session.local ? "zsh" : host.name) + " · " + endpoint(session) : endpoint(session);
                  const drop = preview?.drop;
                  const walkthrough = (session.example || !sessions.some(s => s.example) && session === demoTarget) && scene !== "split" ? scene : undefined;
                  return <section className={"terminal-session-panel" + (grouped ? " themed-surface workspace-pane-card" : "")}
                    data-terminal-pane={id} data-split-target={id === demoTarget?.id || undefined} data-grouped={grouped} data-active={active === id}
                    data-drop={drop && drop !== "tabs" && drop.scope === "pane" && drop.target === id ? drop.side : undefined}
                    aria-label={label(session)} onPointerDownCapture={() => setActive(id)} onFocusCapture={() => setActive(id)}>
                    <div className="terminal-identity">
                      {grouped && <>
                        <Button variant="ghost" size="icon-xs" className="terminal-pane-grip" {...drag.handle(id, true, label(session))}
                          title={t("detachPane")} aria-label={t("detachPane") + " · " + label(session)} onClick={() => place(id, "tabs")}><GripVertical/></Button>
                        <span className="terminal-tab-indicator" data-tone="success" aria-hidden="true"/>
                      </>}
                      <code title={identity}>{identity}</code><span className="sr-only" role="status">{t("phase.running")}</span>
                      {grouped && closeButton([id], t("closeTab") + " " + label(session))}
                    </div>
                    <SampleSession key={walkthrough} target={session.local ? "local" : "ssh"} scene={walkthrough}
                      example={session.example} visible={open && selectedGroup.tab === group.tab} notice={terminalUpdateCopy[locale].sample}/>
                  </section>;
                }}/>
            </div>
          </Tabs>
        ) : (
          <TerminalTargets
            hosts={targets}
            busy={false}
            choose={(host) => add(host === null)}
          />
        )}
      </WorkspacePanel>
      {closing.length>0 && <Modal title={t("closeGroup")} close={() => setClosing([])}>
        <Dialog.Description>{t("groupCloseHint", {count: closing.length})}</Dialog.Description>
        <ul>{sessions.filter(session => closing.includes(session.id)).map(session =>
          <li key={session.id}>{label(session)} · <code>{endpoint(session)}</code></li>)}</ul>
        <ModalActions><Button variant="outline" onClick={() => setClosing([])}>{t("cancel")}</Button>
          <Button variant="destructive" onClick={() => close(closing)}>{t("closeGroup")}</Button></ModalActions>
      </Modal>}
    </div>
  );
}

export function TerminalPreview(props: Props) {
  const [i18n] = useState(() => {
    const instance = createInstance();
    void instance.init({
      lng: props.locale,
      resources: { [props.locale]: messages[props.locale] },
      fallbackLng: false,
      initImmediate: false,
      interpolation: { escapeValue: false },
    });
    return instance;
  });
  return (
    <I18nextProvider i18n={i18n}>
      <SavedCommandsProvider>
        <Workspace {...props} />
      </SavedCommandsProvider>
    </I18nextProvider>
  );
}

export function StandaloneTerminal({ locale, scene }: { locale: Locale; scene: TerminalScene | "split" }) {
  const [open, setOpen] = useState(true);
  const [previousScene, setPreviousScene] = useState(scene);
  if (previousScene !== scene) { setPreviousScene(scene); setOpen(true); }
  const restore = useRef<HTMLButtonElement>(null);
  return (
    <>
      {!open && (
        <Button
          type="button"
          ref={restore}
          variant="ghost"
          aria-expanded={false}
          onClick={() => setOpen(true)}
        >
          {messages[locale].terminal.workspace}
        </Button>
      )}
      <TerminalPreview
        locale={locale}
        standalone
        scene={scene}
        open={open}
        onClose={() => {
          setOpen(false);
          requestAnimationFrame(() =>
            restore.current?.focus({ preventScroll: true }),
          );
        }}
      />
    </>
  );
}
