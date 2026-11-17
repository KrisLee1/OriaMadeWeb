"use client";

// Terminal workspace layout and targets adapted from OriaTunnel 7c24929 (GPL-3.0-only).
import { useId, useRef, useState } from "react";
import { createInstance } from "i18next";
import { I18nextProvider, useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
type Session = { id: number; local: boolean; example: boolean };
type Props = {
  locale: Locale;
  open: boolean;
  onClose: () => void;
  standalone?: boolean;
  scene?: TerminalScene;
  initialDock?: "bottom" | "right";
};

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
  const [sessions, setSessions] = useState<Session[]>(
    standalone
      ? [
          { id: 0, local: true, example: true },
          { id: 1, local: false, example: true },
        ]
      : [{ id: 0, local: false, example: true }],
  );
  const [active, setActive] = useState(0);
  const nextId = useRef(standalone ? 2 : 1);
  const [previousScene, setPreviousScene] = useState(scene);
  if (scene !== previousScene) {
    setPreviousScene(scene);
    const sample = sessions.find(session => session.example && session.id === active) ?? sessions.find(session => session.example);
    if (sample) setActive(sample.id);
    else {
      const id = nextId.current++;
      setSessions([{id, local: true, example: true}, ...sessions.slice(0, 7)]);
      setActive(id);
    }
  }
  const selected = sessions.find((session) => session.id === active);
  const endpoint = (session: Session) =>
    session.local
      ? "/bin/zsh"
      : host.user + "@" + host.address + ":" + host.port;
  const label = (session: Session) =>
    session.local ? t("localTerminal") + " · zsh" : host.name;
  function add(isLocal: boolean) {
    if (sessions.length >= 8) return;
    const id = nextId.current++;
    setSessions((previous) => [
      ...previous,
      { id, local: isLocal, example: false },
    ]);
    setActive(id);
  }
  function closeTab(id: number) {
    const remaining = sessions.filter((session) => session.id !== id);
    setSessions(remaining);
    if (id === active) setActive(remaining.at(-1)?.id ?? -1);
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
        {selected ? (
          <Tabs
            className="terminal-tabs"
            value={active}
            onValueChange={(id) => {
              if (typeof id === "number") setActive(id);
            }}
          >
            <TabsList
              activateOnFocus
              variant="line"
              className="terminal-tab-list"
              aria-label={t("workspace")}
            >
              {sessions.map((session) => (
                <div className="terminal-tab-entry" key={session.id}>
                  <TabsTrigger
                    value={session.id}
                    title={endpoint(session) + " · " + t("phase.running")}
                    aria-label={label(session) + " · " + t("phase.running")}
                  >
                    <span
                      className="terminal-tab-indicator"
                      data-tone="success"
                      aria-hidden="true"
                    />
                    <span className="terminal-tab-label">{label(session)}</span>
                  </TabsTrigger>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label={t("closeTab") + " " + label(session)}
                    onClick={() => closeTab(session.id)}
                  >
                    <X />
                  </Button>
                </div>
              ))}
            </TabsList>
            <div className="terminal-identity">
              <code title={endpoint(selected)}>{endpoint(selected)}</code>
              <span className="sr-only" role="status">
                {t("phase.running")}
              </span>
            </div>
            <div className="terminal-view-area">
              {sessions.map((session) => (
                <TabsContent
                  keepMounted
                  className="terminal-session-panel"
                  value={session.id}
                  key={session.id}
                >
                  <SampleSession
                    key={session.example ? scene : undefined}
                    target={session.local ? "local" : "ssh"}
                    scene={session.example ? scene : undefined}
                    example={session.example}
                    visible={open && active === session.id}
                    notice={terminalUpdateCopy[locale].sample}
                  />
                </TabsContent>
              ))}
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

export function StandaloneTerminal({ locale, scene }: { locale: Locale; scene: TerminalScene }) {
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
