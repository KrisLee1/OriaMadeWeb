// OriaTunnel 90da190, features/files/time-groups.ts (GPL-3.0-only).
import type {FileDemoCopy} from "./file-demo-copy";

// All relative headings refer to the sample workspace's calendar day.
export const sampleDay = +new Date(2026, 10, 19);
export const sampleTime = (daysAgo: number) => +new Date(2026, 10, 19 - daysAgo, 8, 30);

export type TimeGroup = {
  key:
    | "today"
    | "yesterday"
    | "pastWeek"
    | "thisMonth"
    | "unknownTime"
    | number;
  start: number;
};

export function groupByTime<T>(
  items: T[],
  timestamp: (item: T) => number | null | undefined,
  day: number,
  newest: boolean,
) {
  const today = new Date(day);
  const midnight = (offset: number) =>
    +new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
  const yesterday = midnight(-1);
  const week = midnight(-6);
  const month = +new Date(today.getFullYear(), today.getMonth(), 1);
  const groups = new Map<TimeGroup["key"], { time: TimeGroup; items: T[] }>();
  for (const item of items) {
    const ms = timestamp(item);
    let key: TimeGroup["key"];
    let start: number;
    if (ms == null || !Number.isFinite(ms)) {
      key = "unknownTime";
      start = 0;
    } else if (ms >= day) {
      key = "today";
      start = day;
    } else if (ms >= yesterday) {
      key = "yesterday";
      start = yesterday;
    } else if (ms >= week) {
      key = "pastWeek";
      start = week;
    } else if (ms >= month) {
      key = "thisMonth";
      start = month;
    } else {
      const date = new Date(ms);
      key = start = +new Date(date.getFullYear(), date.getMonth(), 1);
    }
    let group = groups.get(key);
    if (!group) {
      group = { time: { key, start }, items: [] };
      groups.set(key, group);
    }
    group.items.push(item);
  }
  return [...groups.values()].sort(
    (a, b) =>
      Number(a.time.key === "unknownTime") -
        Number(b.time.key === "unknownTime") ||
      (a.time.start - b.time.start) * (newest ? -1 : 1),
  );
}

export function timeGroupLabel(
  group: TimeGroup,
  copy: FileDemoCopy,
  language: string,
  day: number,
) {
  if (typeof group.key === "string") return copy[group.key];
  const date = new Date(group.key);
  return date.toLocaleDateString(language, {
    month: "long",
    year:
      date.getFullYear() === new Date(day).getFullYear()
        ? undefined
        : "numeric",
  });
}
