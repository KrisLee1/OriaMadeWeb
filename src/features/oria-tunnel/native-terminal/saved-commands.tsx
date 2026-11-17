// OriaTunnel features/terminal/saved-commands.tsx, 7c24929 (GPL-3.0-only).
import {
  createContext,
  useContext,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { BookText, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Field, Modal, ModalActions } from "./library-dialog";
import { Button } from "@/components/ui/button";
import {
  CommandKeywords,
  selectedKeywords,
  type KeywordDraft,
} from "./command-keywords";
import { Textarea } from "./textarea";
import { SearchInput } from "./search-input";
import {
  type SavedCommand,
  type SavedCommandLibrary,
} from "./saved-command-model";

type Editor = {
  previous: SavedCommand;
  command: string;
  keywords: KeywordDraft;
};
const Context = createContext<{
  entries: SavedCommand[];
  persist: (
    previous: SavedCommand | null,
    next: SavedCommand | null,
  ) => Promise<void>;
  manage: () => void;
} | null>(null);
export const useSavedCommands = () => useContext(Context);
export function SavedCommandsButton() {
  const library = useSavedCommands();
  const { t } = useTranslation("terminal");
  return (
    <Button
      type="button"
      data-saved-commands=""
      variant="ghost"
      size="icon-sm"
      title={t("savedCommands")}
      aria-label={t("savedCommands")}
      onClick={library?.manage}
    >
      <BookText aria-hidden="true" />
    </Button>
  );
}

export function SavedCommandsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { t } = useTranslation("terminal");
  const [library, setLibrary] = useState<SavedCommandLibrary>({
    revision: 0,
    entries: [{ id: "files", command: "ls -1", keywords: ["files"] }, { id: "path", command: "pwd", keywords: ["path"] }],
  });
  const [opened, setOpened] = useState(false);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const invoker = useRef<HTMLElement | null>(null);
  const pending = useRef(false);
  const form = useId();
  const open = () => {
    invoker.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setQuery("");
    setError("");
    setOpened(true);
  };
  const edit = (entry: SavedCommand) => {
    setError("");
    setEditor({
      previous: entry,
      command: entry.command,
      keywords: { tags: entry.keywords, text: "" },
    });
  };
  const close = () => {
    if (pending.current) return;
    if (editor) {
      setEditor(null);
      setError("");
      return;
    }
    setOpened(false);
    setEditor(null);
    requestAnimationFrame(() => {
      if (invoker.current?.isConnected)
        invoker.current.focus({ preventScroll: true });
    });
  };
  const persist = async (
    previous: SavedCommand | null,
    next: SavedCommand | null,
  ) => {
    setLibrary(current => ({
      revision: current.revision + 1,
      entries: [...current.entries.filter(entry => entry.id !== previous?.id), ...(next ? [next] : [])],
    }));
  };
  const change = async (previous: SavedCommand, next: SavedCommand | null) => {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      await persist(previous, next);
      setEditor(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };
  const filtered = library.entries.filter((entry) =>
    [entry.command, ...entry.keywords].some((value) =>
      value.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
    ),
  );
  return (
    <Context.Provider
      value={{
        entries: library.entries,
        manage: () => {
          open();
          setEditor(null);
        },
        persist,
      }}
    >
      {children}
      {opened && (
        <Modal
          key={editor ? "edit" : "list"}
          title={t(editor ? "saveCommand" : "savedCommands")}
          close={close}
        >
          {editor ? (
            <form
              id={form}
              data-command-library-editor=""
              onSubmit={(e) => {
                e.preventDefault();
                const keywords = selectedKeywords(editor.keywords);
                if (!keywords.length || !editor.command.trim()) return;
                void change(editor.previous, {
                  id: editor.previous.id,
                  command: editor.command,
                  keywords,
                });
              }}
            >
              <Field label={t("command")}>
                <Textarea
                  value={editor.command}
                  required
                  onChange={(e) =>
                    setEditor({ ...editor, command: e.target.value })
                  }
                />
              </Field>
              <div
                className="field"
                role="group"
                aria-label={t("commandKeywords")}
              >
                <span>{t("commandKeywords")}</span>
                <CommandKeywords
                  entries={library.entries}
                  draft={editor.keywords}
                  onChange={(keywords) => setEditor({ ...editor, keywords })}
                />
              </div>
              <ModalActions>
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={close}
                >
                  {t("cancel")}
                </Button>
                <Button
                  type="submit"
                  form={form}
                  disabled={
                    busy ||
                    !editor.command.trim() ||
                    !selectedKeywords(editor.keywords).length
                  }
                >
                  {t("save", { ns: "tunnel" })}
                </Button>
              </ModalActions>
            </form>
          ) : (
            <>
              <SearchInput
                autoFocus
                value={query}
                aria-label={t("searchLibrary")}
                placeholder={t("searchLibrary")}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div data-command-library-list="" className="grid gap-2">
                {filtered.map((entry) => (
                  <div
                    className="flex min-w-0 items-center gap-1 border-b border-border py-2"
                    key={entry.id}
                  >
                    <div className="min-w-0 flex-1">
                      <code className="block whitespace-pre-wrap break-all">
                        {entry.command}
                      </code>
                      <span className="text-xs text-muted-foreground">
                        {entry.keywords.join(" · ")}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={busy}
                      aria-label={t("edit", { ns: "tunnel" })}
                      title={t("edit", { ns: "tunnel" })}
                      onClick={() => edit(entry)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={busy}
                      aria-label={t("delete", { ns: "tunnel" })}
                      title={t("delete", { ns: "tunnel" })}
                      onClick={() => void change(entry, null)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))}
                {!filtered.length && !error && (
                  <p className="text-sm text-muted-foreground">
                    {t(query ? "noMatches" : "libraryEmpty")}
                  </p>
                )}
              </div>
            </>
          )}
          {error && (
            <p role="alert" className="terminal-error">
              {t(error)}
            </p>
          )}
        </Modal>
      )}
    </Context.Provider>
  );
}
