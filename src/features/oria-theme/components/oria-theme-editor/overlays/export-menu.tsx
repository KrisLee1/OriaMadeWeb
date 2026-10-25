import {localize} from "@/i18n/localize";
import {useSiteLocale} from "@/i18n/provider";
import { useRef, useState } from "react";
import type { ReactElement } from "react";
import type { ThemeEditorSession } from "@oriatheme/editor-core";
import { exportThemeCode } from "../export-theme-code";
import { useDetailsDismiss } from "../hooks/use-details-dismiss";

type ExportFormat = "typescript" | "json";
const themeFileName = (id: string, format: ExportFormat): string => `${id}.oria-theme.${format === "typescript" ? "ts" : "json"}`;

export function ExportMenu({ session, disabled }: { readonly session: ThemeEditorSession; readonly disabled: boolean }): ReactElement {
  const locale=useSiteLocale();
  const menu = useRef<HTMLDetailsElement>(null);
  useDetailsDismiss(menu);
  const [copied, setCopied] = useState<"typescript" | "json" | null>(null);
  const copy = async (format: ExportFormat): Promise<void> => {
    const draft = session.getSnapshot().draft;
    await navigator.clipboard.writeText(format === "typescript" ? exportThemeCode(draft) : session.exportJson());
    setCopied(format);
    globalThis.setTimeout(() => setCopied(null), 1500);
  };
  const download = (format: ExportFormat): void => {
    const draft = session.getSnapshot().draft;
    const content = format === "typescript" ? exportThemeCode(draft) : session.exportJson();
    const type = format === "typescript" ? "text/typescript;charset=utf-8" : "application/json";
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement("a");
    link.href = url;
    link.download = themeFileName(draft.id, format);
    link.click();
    URL.revokeObjectURL(url);
  };
  return <details ref={menu} data-oria-editor-menu>
    <summary aria-disabled={disabled} aria-label={copied ? localize(locale,"Theme {format} copied","已复制 {format} 主题").replace("{format}",copied === "typescript" ? "TypeScript" : "JSON") : localize(locale,"Export theme","导出主题")} title={copied ? localize(locale,"Copied","已复制") : localize(locale,"Export","导出")}><svg data-oria-editor-action-icon viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-4-4 4 4 4-4M5 19h14" /></svg><span data-oria-editor-action-label>{copied ? localize(locale,"Copied","已复制") : localize(locale,"Export","导出")}</span></summary>
    <div role="menu"><button role="menuitem" type="button" disabled={disabled} onClick={() => void copy("typescript")}>{localize(locale,"Copy TypeScript","复制 TypeScript")}</button><button role="menuitem" type="button" disabled={disabled} onClick={() => download("typescript")}>{localize(locale,"Download TypeScript","下载 TypeScript")}</button><button role="menuitem" type="button" disabled={disabled} onClick={() => void copy("json")}>{localize(locale,"Copy JSON","复制 JSON")}</button><button role="menuitem" type="button" disabled={disabled} onClick={() => download("json")}>{localize(locale,"Download JSON","下载 JSON")}</button></div>
  </details>;
}
