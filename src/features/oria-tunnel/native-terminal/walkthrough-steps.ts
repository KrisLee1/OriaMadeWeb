// Each action operates on the website's in-memory terminal session.
export const terminalScenes = ["completion", "directory", "library", "multiline", "output", "copy"] as const;
export type TerminalScene = typeof terminalScenes[number];

const current = ".shell-current-block";
const input = current + " textarea";
const path = current + " .shell-path";
const save = "[data-save-command-popover]";

export type Step =
  | { action: "selectNote" | "pasteNote"; delay: number }
  | { action: "hold"; delay: number }
  | { action: "draft"; value: string; cursor?: number; delay: number; badge?: string }
  | { action: "key"; key: string; delay: number }
  | { action: "point" | "click"; target: string; delay: number; offset?: number }
  | { action: "caret"; offset: number; delay: number }
  | { action: "tag"; value: string; delay: number };

const draft = (value: string, delay = 340, cursor?: number, badge?: string): Step =>
  ({action: "draft", value, cursor, badge, delay});
function insert(line: string, offset: number, text: string): Step[] {
  return Array.from(text, (_, i) => {
    const typed = text.slice(0, i + 1);
    return draft(line.slice(0, offset) + typed + line.slice(offset), 185, offset + typed.length);
  });
}
const type = (text: string) => insert("", 0, text);
const key = (key: string, delay = 940): Step => ({action: "key", key, delay});
const click = (target: string): Step[] => [
  {action: "point", target, delay: 650},
  {action: "click", target, delay: 850},
];
const position = (offset: number): Step[] => [
  {action: "point", target: input, offset, delay: 780},
  {action: "caret", offset, delay: 1100},
];

export const walkthroughSteps: Record<TerminalScene, Step[]> = {
  copy: (["command", "output", "all"] as const).flatMap(kind => [
    ...click('.shell-block[data-copy-example] .shell-block-more'),
    ...click('[data-copy="' + kind + '"]'),
    {action: "point" as const, target: ".sample-paste-window textarea", delay: 650},
    {action: "selectNote" as const, delay: 650},
    {action: "pasteNote" as const, delay: 1300},
    {action: "hold" as const, delay: 800},
  ]),
  completion: [
    ...type("pw"), draft("pw", 850), key("ArrowRight"), key("Enter"),
    ...type("cd "), key("Tab", 1450), key("ArrowDown"), key("Escape"),
    draft(""), key("ArrowUp", 1300), key("ArrowUp", 1150), key("Enter"),
  ],
  directory: [
    ...type("ls"), ...click(path + ' button[title$="/workspace"]'),
    ...click(path + ' button[aria-current="location"]'),
    ...click('.shell-directory [data-directory-name="logs"]'),
  ],
  library: [
    ...type("cd logs"), key("ArrowDown", 1050),
    ...Array.from("logdir", (_, i): Step => ({action: "tag", value: "logdir".slice(0, i + 1), delay: 185})),
    ...click(save + ' button[type="submit"]'), draft(""), ...type("logdir"),
    ...click(current + ' [data-mode="saved"] [role="option"]'), key("Enter"),
  ],
  multiline: [
    ...type("cd lgs"), draft("cd lgs\n", 850, 7, "Shift + Enter"),
    ...insert("cd lgs\n", 7, "ls"), ...position(4),
    draft("cd logs\nls", 1050, 5), ...position(10),
    ...insert("cd logs\nls", 10, " -1"), key("Enter", 1500),
  ],
  output: [
    ...type("pwd"), draft("pwd\n", 650, 4, "Shift + Enter"),
    ...insert("pwd\n", 4, "ls -1"),
    draft("pwd\nls -1\n", 650, 10, "Shift + Enter"),
    ...insert("pwd\nls -1\n", 10, "pwd"), key("Enter", 1100),
    ...type("pwd"), key("Enter", 1200),
    ...click(".shell-block[data-output-folded] .shell-fold"),
    ...click('.shell-block .shell-fold[aria-expanded="false"]'),
    ...click(".shell-block[data-output-folded] .shell-fold"),
  ],
};
