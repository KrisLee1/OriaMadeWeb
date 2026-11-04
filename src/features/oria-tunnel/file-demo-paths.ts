// Pure OriaTunnel display helpers, GPL-3.0-only.
export function displayPath(path: string) {
  return path.startsWith("\\\\?\\UNC\\")
    ? "\\\\" + path.slice(8)
    : path.startsWith("\\\\?\\")
      ? path.slice(4)
      : path;
}
export function breadcrumbs(path: string, remote: boolean) {
  if (path === ":computer:") return [];
  if (remote) {
    const parts = path.split("/").filter(Boolean);
    return [
      { label: "/", path: "/" },
      ...parts.map((label, i) => ({
        label,
        path: "/" + parts.slice(0, i + 1).join("/"),
      })),
    ];
  }
  const clean = path.replace(/^\\\\\?\\UNC\\/, "\\\\").replace(/^\\\\\?\\/, "");
  if (clean.startsWith("\\\\")) {
    const parts = clean.slice(2).split("\\").filter(Boolean);
    return parts
      .map((label, i) => ({
        label: i === 1 ? "\\\\" + parts[0] + "\\" + label : label,
        path: "\\\\" + parts.slice(0, i + 1).join("\\"),
      }))
      .filter((_, i) => i !== 0);
  }
  const sep = clean.includes("\\") ? "\\" : "/";
  const parts = clean.split(sep).filter(Boolean);
  return [
    ...(clean.startsWith("/") ? [{ label: "/", path: "/" }] : []),
    ...parts.map((label, i) => ({
      label,
      path:
        (clean.startsWith("/") ? "/" : "") +
        parts.slice(0, i + 1).join(sep) +
        (i === 0 && sep === "\\" ? "\\" : ""),
    })),
  ];
}
