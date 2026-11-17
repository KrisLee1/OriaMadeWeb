// OriaTunnel features/terminal/shell-editor.ts, 7c24929 (GPL-3.0-only).
export type ShellQuery = (
  operation: string,
  value: string,
) => Promise<string[]>;

export type Prompt = { cwd: string; home: string; environments?: string[] };
export type TerminalCopyText = { command: string; output: string };
// CSS applies min(18lh, 46cqh) to the preview's border box.
export function exceedsPreviewHeight(
  height: number,
  paneHeight: number,
  lineHeight: number,
) {
  return height > Math.round(Math.min(18 * lineHeight, paneHeight * 0.46));
}

const boundary = /[\s|;&()<>]/u;
export function completionWord(line: string, cursor: number) {
  let start = 0,
    quote = "",
    escaped = false;
  const spans: Array<[number, number]> = [];
  for (let i = 0; i <= line.length; i++) {
    const c = line[i];
    if (!c || (!escaped && !quote && boundary.test(c))) {
      if (i > start) spans.push([start, i]);
      start = i + 1;
    } else if (escaped) escaped = false;
    else if (c === "\\" && quote !== "'") escaped = true;
    else if (quote) {
      if (c === quote) quote = "";
    } else if (c === '"' || c === "'") quote = c;
  }
  const [from, to] = spans.find(([a, b]) => cursor >= a && cursor <= b) || [
    cursor,
    cursor,
  ];
  const before = line.slice(0, from);
  let prefix = "";
  quote = "";
  const typed = line.slice(from, cursor);
  for (let i = 0; i < typed.length; i++) {
    const c = typed[i],
      next = typed[i + 1];
    if (!quote && (c === "'" || c === '"')) quote = c;
    else if (quote && c === quote) quote = "";
    else if (
      c === "\\" &&
      next &&
      (!quote || (quote === '"' && /["$`\\\n]/u.test(next)))
    ) {
      prefix += next;
      i++;
    } else prefix += c;
  }
  const command = !before.trim() || /[|;&(]\s*$/u.test(before);
  const kind =
    command && !prefix.includes("/")
      ? "commands"
      : /(?:^|[|;&])\s*(?:builtin\s+)?cd\s+$/u.test(before)
        ? "dirs"
        : "files";
  return { from, to, prefix, kind };
}

export function insertCandidate(
  line: string,
  word: ReturnType<typeof completionWord>,
  name: string,
) {
  const slash = word.kind === "commands" ? -1 : word.prefix.lastIndexOf("/");
  const value = word.prefix.slice(0, slash + 1) + name;
  const escaped = /[\n\r]/u.test(value)
    ? "'" + value.replaceAll("'", "'\\''") + "'"
    : value
        .replace(/[^\p{L}\p{N}\-_.~/:]/gu, (c) => "\\" + c)
        .replace(
          /^~/u,
          slash >= 0 && word.prefix.startsWith("~/") ? "~" : "\\~",
        );
  return {
    line: line.slice(0, word.from) + escaped + line.slice(word.to),
    cursor: word.from + escaped.length,
  };
}
