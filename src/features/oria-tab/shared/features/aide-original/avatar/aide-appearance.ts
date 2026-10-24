export const AIDE_DEFAULT_BASE_COLOR = "#CDB0F4"

export const AIDE_BASE_COLOR_PRESETS = [
  AIDE_DEFAULT_BASE_COLOR,
  "#72C7D5",
  "#F0B56A",
  "#E89CB7",
  "#94C9A4",
] as const

export function normalizeAideBaseColor(value: unknown): string | null {
  if (typeof value !== "string" || !/^#[0-9a-f]{6}$/i.test(value)) return null
  return value.toUpperCase()
}

export function resolveAideBaseColor(value: unknown): string {
  return normalizeAideBaseColor(value) ?? AIDE_DEFAULT_BASE_COLOR
}
