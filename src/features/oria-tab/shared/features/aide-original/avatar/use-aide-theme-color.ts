import { useMemo } from 'react'
import { useThemeSnapshot } from '@oriatheme/react'
import { useApp } from '@/features/oria-tab/website/state'
import { themeColors } from '@/features/oria-tab/shared/lib/theme'
import { LIQUID_THEME_ID } from '@/features/oria-tab/shared/lib/theme-preference'

// The original avatar accepts a hex base color; theme tokens may use any CSS color.
export function useAideThemeColor() {
  const { state } = useApp()
  const themeId = useThemeSnapshot(snapshot => snapshot.preference.activeThemeId)
  const primary = useThemeSnapshot(snapshot => snapshot.resolvedTheme.variables['--oria-color-primary'])
  const override = state.settings.materialOverrides[themeId]
  const liquid = themeId === LIQUID_THEME_ID
  const choice = liquid ? state.settings.themeColor : override?.themeColor
  const color = choice && choice !== 'native'
    ? choice === 'custom' ? (liquid ? state.settings.customColor : override?.customColor) : themeColors[choice].tint
    : primary
  return useMemo(() => {
    if (color && /^#[0-9a-f]{6}$/i.test(color)) return color
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1
    const context = canvas.getContext('2d')!
    context.fillStyle = color || themeColors.violet.tint
    context.fillRect(0, 0, 1, 1)
    return '#' + [...context.getImageData(0, 0, 1, 1).data].slice(0, 3).map(channel => channel.toString(16).padStart(2, '0')).join('')
  }, [color])
}
