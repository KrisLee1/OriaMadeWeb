import { type Settings } from '@/features/oria-tab/shared/lib/model'

type Palette = { swatch: string; light: string; dark: string; tint: string }
export const themeColors: Record<Exclude<Settings['themeColor'], 'custom'>, Palette> = {
  violet: customTheme('#CDB0F4'),
  blue: { swatch: '#5b9be6', light: '#326cad', dark: '#b2d4ff', tint: '#82a9dc' },
  sage: { swatch: '#6dad99', light: '#357563', dark: '#afe0cc', tint: '#8bbbac' },
  rose: { swatch: '#d989ac', light: '#a14c73', dark: '#f5bbd5', tint: '#dba2bd' },
  amber: { swatch: '#dfad62', light: '#886020', dark: '#f4d297', tint: '#dfbd89' },
}
export function luminance(hex: string) {
  const channels = [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16) / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4)
  return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722
}
function readableColor(color: string, foreground: string, toward: number) {
  const channels = [1, 3, 5].map(index => parseInt(color.slice(index, index + 2), 16))
  const foregroundLight = luminance(foreground)
  let next = color
  for (let blend = 0; blend <= 1; blend += .025) {
    next = `#${channels.map(channel => Math.round(channel * (1 - blend) + toward * blend).toString(16).padStart(2, '0')).join('')}`
    const light = luminance(next), contrast = (Math.max(light, foregroundLight) + .05) / (Math.min(light, foregroundLight) + .05)
    if (contrast >= 4.5) break
  }
  return next
}
export function customTheme(color: string): Palette {
  return { swatch: color, tint: color, light: readableColor(color, '#fafaf8', 0), dark: readableColor(color, '#202820', 255) }
}
