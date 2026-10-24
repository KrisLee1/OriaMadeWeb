import { useLayoutEffect, type RefObject } from 'react'
import { useReducedMotion } from 'motion/react'
import { useThemeSnapshot } from '@oriatheme/react'
import { useApp } from '@/features/oria-tab/website/state'
import { LIQUID_THEME_ID } from '@/features/oria-tab/shared/lib/theme-preference'
import { customTheme, themeColors } from '@/features/oria-tab/shared/lib/theme'

// Shared root variables for the new tab and the same Aide popup on web pages.
export function useAppAppearance(scope: RefObject<HTMLElement | null>) {
  const { state } = useApp()
  const dark = useThemeSnapshot(snapshot => snapshot.resolvedMode === 'dark'), liquid = useThemeSnapshot(snapshot => snapshot.preference.activeThemeId === LIQUID_THEME_ID), systemReduced = useReducedMotion()
  const materialColor = state.settings.materialOverrides[state.settings.themeId]
  const fontColor = materialColor?.fontColor && materialColor.fontColor !== 'native' ? materialColor.fontColor : undefined
  useLayoutEffect(() => {
    const root = scope.current
    if (!root) return
    root.dataset.fontColor = fontColor ? 'custom' : 'native'
    for (const property of ['--foreground', '--card-foreground', '--popover-foreground', '--secondary-foreground', '--accent-foreground', '--muted-foreground', '--user-font-color']) {
      if (fontColor) root.style.setProperty(property, fontColor); else root.style.removeProperty(property)
    }
  }, [fontColor, scope])
  const themeOpacity = useThemeSnapshot(snapshot => snapshot.resolvedTheme.variables['--oria-opacity-overlay'])
  useLayoutEffect(() => {
    const root = scope.current
    if (!root) return
    const choice = liquid ? state.settings.themeColor : materialColor?.themeColor
    const material=state.settings.liquidMaterial
    root.style.setProperty('--glass-opacity',String(material.tintOpacity))
    root.style.setProperty('--glass-rim',String(material.edgeHighlight/2))
    root.style.setProperty('--glass-brightness',String(material.brightness))
    root.style.setProperty('--glass-blur',`${material.roughness*12}px`)
    root.style.setProperty('--interface-opacity', String(liquid ? .45+.55*material.tintOpacity : materialColor?.opacity !== undefined ? materialColor.opacity / 100 : Number(themeOpacity)))
    // Keep the existing restrained dark tint while allowing independent color strength.
    root.style.setProperty('--glass-color-concentration', `${material.colorConcentration*100}%`)
    root.dataset.dockPosition = state.settings.dockPosition
    root.dataset.reduceMotion = String(Boolean(systemReduced || state.settings.reduceMotion))
    if (!choice || choice === 'native') {
      for (const property of ['--primary', '--primary-foreground', '--theme-color', '--ring', '--accent']) root.style.removeProperty(property)
      return
    }
    const color = choice === 'custom' ? customTheme(liquid ? state.settings.customColor : materialColor?.customColor ?? themeColors.violet.swatch) : themeColors[choice]
    root.style.setProperty('--primary', dark ? color.dark : color.light)
    root.style.setProperty('--primary-foreground', dark ? '#202225' : '#fafaf8')
    root.style.setProperty('--theme-color', color.tint)
    root.style.setProperty('--ring', dark ? color.dark : color.swatch)
    root.style.setProperty('--accent', `color-mix(in srgb, ${color.tint} ${dark ? 35 : 18}%, ${liquid ? dark ? '#2c2e30' : '#f7f6fb' : 'var(--oria-color-surface)'})`)
  }, [dark, liquid, materialColor, themeOpacity, state.settings.liquidMaterial, state.settings.themeColor, state.settings.customColor, state.settings.reduceMotion, state.settings.dockPosition, systemReduced, scope])
  return { dark, liquid, fontColor, reduced: Boolean(systemReduced || state.settings.reduceMotion) }
}
