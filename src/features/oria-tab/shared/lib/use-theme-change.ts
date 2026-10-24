import { useOriaTheme } from '@oriatheme/react'
import type { AppearanceMode } from '@oriatheme/core'
import { useApp } from '@/features/oria-tab/website/state'

export const themeChangeIntent: { themeId?: string; appearance?: AppearanceMode; themeRevision: number; appearanceRevision: number } = { themeRevision: 0, appearanceRevision: 0 }

export function useThemeChange() {
  const { runtime } = useOriaTheme(), { state, act } = useApp()
  function options(element?: Element | null) {
    const rect = (element ?? document.activeElement)?.getBoundingClientRect()
    return { animate: !state.settings.reduceMotion, origin: rect && rect.width && rect.height ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : undefined }
  }
  return {
    changeTheme(themeId: string, element?: Element | null) {
      const previous = runtime.getSnapshot().preference.activeThemeId
      if (previous === themeId) return
      const revision = ++themeChangeIntent.themeRevision
      themeChangeIntent.themeId = themeId
      runtime.setTheme(themeId, options(element))
      void act({ type: 'settings', patch: { themeId } }).then(saved => {
        if (themeChangeIntent.themeRevision !== revision) return
        themeChangeIntent.themeId = undefined
        if (!saved) runtime.setTheme(previous)
      })
    },
    changeAppearance(theme: AppearanceMode, element?: Element | null) {
      const previous = runtime.getSnapshot().preference.appearance
      if (previous === theme) return
      const revision = ++themeChangeIntent.appearanceRevision
      themeChangeIntent.appearance = theme
      runtime.setAppearance(theme, options(element))
      void act({ type: 'settings', patch: { theme } }).then(saved => {
        if (themeChangeIntent.appearanceRevision !== revision) return
        themeChangeIntent.appearance = undefined
        if (!saved) runtime.setAppearance(previous)
      })
    },
  }
}
