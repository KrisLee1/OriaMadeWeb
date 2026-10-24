export const gradientTypes = ['linear', 'radial', 'conic', 'repeating-linear', 'repeating-radial'] as const
export type BackgroundPaint = {
  type: 'solid' | typeof gradientTypes[number]
  color: string
  angle: number
  position: { x: number; y: number }
  stops: { color: string; position: number }[]
}
export type BackgroundSettings = { mode: 'image' | 'theme' | 'preset' | 'custom' | 'saved'; preset: string; custom: BackgroundPaint; savedId?: string }
export type SavedBackground = { id: string; name: string; paint: BackgroundPaint }
export const MAX_SAVED_BACKGROUNDS = 100
export function validSavedBackground(value: unknown): value is SavedBackground {
  if (!value || typeof value !== 'object') return false
  const v = value as SavedBackground
  return typeof v.id === 'string' && /^[a-z0-9-]{1,80}$/i.test(v.id) && typeof v.name === 'string' && !!v.name.trim() && v.name.length <= 60 && validPaint(v.paint)
}
export const defaultPaint: BackgroundPaint = { type: 'linear', color: '#dce7e2', angle: 135, position: { x: 50, y: 50 }, stops: [{ color: '#4ac5ff', position: 0 }, { color: '#a79cf4', position: 100 }] }
const solid = (color: string): BackgroundPaint => ({ ...defaultPaint, type: 'solid', color })
const linear = (colors: string[], angle = 135): BackgroundPaint => ({ ...defaultPaint, type: 'linear', angle, stops: colors.map((color, i) => ({ color, position: i * 100 / (colors.length - 1) })) })
export const backgroundPresets = [
  { id: 'ivory', name: 'background.ivory', paint: solid('#f3f1e9') },
  { id: 'mist', name: 'background.mist', paint: solid('#dce7e2') },
  { id: 'slate', name: 'background.slate', paint: solid('#263544') },
  { id: 'sunrise', name: 'background.sunrise', paint: linear(['#f6d6bd', '#efd4df', '#c9d9ea']) },
  { id: 'sea', name: 'background.sea', paint: linear(['#d9eceb', '#94c6d1', '#7a9cbd'], 160) },
  { id: 'aurora', name: 'background.aurora', paint: linear(['#203d50', '#527b78', '#9887b7']) },
] as const
export const defaultBackground = (): BackgroundSettings => ({ mode: 'image', preset: 'mist', custom: structuredClone(defaultPaint) })
export const validBackgroundColor = (value: unknown): value is string => typeof value === 'string' && /^#[\da-f]{6}(?:[\da-f]{2})?$/i.test(value)
const bounded = (value: unknown, max: number): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= max
export function validPaint(value: unknown): value is BackgroundPaint {
  if (!value || typeof value !== 'object') return false
  const v = value as BackgroundPaint
  return ['solid', ...gradientTypes].includes(v.type) && validBackgroundColor(v.color) && bounded(v.angle, 360)
    && !!v.position && bounded(v.position.x, 100) && bounded(v.position.y, 100)
    && Array.isArray(v.stops) && v.stops.length >= 2 && v.stops.length <= 8
    && v.stops.every((stop, i) => stop && validBackgroundColor(stop.color) && bounded(stop.position, 100) && (i === 0 || stop.position >= v.stops[i - 1].position))
}
export function validBackground(value: unknown): value is BackgroundSettings {
  if (!value || typeof value !== 'object') return false
  const v = value as BackgroundSettings
  return ['image', 'theme', 'preset', 'custom', 'saved'].includes(v.mode) && backgroundPresets.some(p => p.id === v.preset) && validPaint(v.custom)
    && (v.savedId === undefined || (typeof v.savedId === 'string' && /^[a-z0-9-]{1,80}$/i.test(v.savedId))) && (v.mode !== 'saved' || !!v.savedId)
}
export function paintCss(paint: BackgroundPaint): string {
  if (paint.type === 'solid') return paint.color
  const stops = paint.stops.map(stop => `${stop.color} ${stop.position}%`).join(', ')
  const origin = `${paint.position.x}% ${paint.position.y}%`
  if (paint.type === 'conic') return `conic-gradient(from ${paint.angle}deg at ${origin}, ${stops})`
  if (paint.type.endsWith('radial')) return `${paint.type}-gradient(circle at ${origin}, ${stops})`
  return `${paint.type}-gradient(${paint.angle}deg, ${stops})`
}
export function themeBackgroundCss(variables: Readonly<Record<string, string>>): string {
  // Compiled patterns include size/repeat/position, so use the background shorthand.
  const layers = [variables['--oria-pattern-bg'], variables['--oria-gradient-bg']].filter(v => v?.trim() && v.trim() !== 'none')
  return `${layers.length ? `${layers.join(', ')}, ` : ''}${variables['--oria-color-bg'] || '#f5f5ed'}`
}
export function backgroundPaint(background: BackgroundSettings): BackgroundPaint {
  return background.mode === 'preset' ? backgroundPresets.find(p => p.id === background.preset)!.paint : background.custom
}
export function backgroundCss(background: BackgroundSettings, variables: Readonly<Record<string, string>>): string {
  return background.mode === 'theme' ? themeBackgroundCss(variables) : paintCss(backgroundPaint(background))
}
export function paintIsDark(paint: BackgroundPaint, dim: number): boolean {
  const colors = paint.type === 'solid' ? [paint.color] : paint.stops.map(stop => stop.color)
  const lightness = colors.reduce((sum, color) => sum + [.2126, .7152, .0722].reduce((total, weight, i) => total + weight * parseInt(color.slice(1 + i * 2, 3 + i * 2), 16) / 255, 0), 0) / colors.length
  return lightness * (1 - dim) < .58
}
// Like the OriaTheme editor, insert in the widest existing interval.
export function addGradientStop(paint: BackgroundPaint): BackgroundPaint {
  if (paint.stops.length >= 8) return paint
  let start = 0, end = 100, largest = -1
  for (let i = 0; i < paint.stops.length - 1; i++) {
    const gap = paint.stops[i + 1].position - paint.stops[i].position
    if (gap > largest) { largest = gap; start = paint.stops[i].position; end = paint.stops[i + 1].position }
  }
  return { ...paint, stops: [...paint.stops, { color: '#ffffff', position: Math.round((start + end) / 2) }].sort((a, b) => a.position - b.position) }
}
