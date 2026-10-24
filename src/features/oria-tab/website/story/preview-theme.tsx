import { useLayoutEffect, useMemo, type ReactNode } from 'react'
import { OriaThemeProvider, useOriaTheme } from '@oriatheme/react'
import { createOriaThemeRuntime, type OriaThemeConfig, type OriaThemeRuntime } from '@oriatheme/runtime-dom'
import { appThemes } from '@/features/oria-tab/shared/lib/theme-provider'
import { LIQUID_THEME_ID } from '@/features/oria-tab/shared/lib/theme-preference'
import { materialShadows } from '@/features/oria-tab/shared/lib/material'

// The story previews presets on the demo screen only. A second runtime resolves the preset
// without touching the document; its variables are written onto the screen element, and shared
// components below it read the preview through their usual OriaTheme hooks.
const picks = ['oria-ocean', 'oria-neo-brutalism', 'oria-paper', 'oria-cyberpunk', 'oria-soft-clay', 'oria-retro-terminal']
export const previewNames = new Map(appThemes.map(theme => [theme.id, theme.name]))

export type PreviewController = { sequence: string[]; set: (index: number | null) => void; name: (index: number) => string }

function detachedTarget() {
  const host = document.createElement('div')
  return host.attachShadow({ mode: 'open' })
}
export function usePreviewRuntime() {
  return useMemo(() => {
    const config: OriaThemeConfig = { presets: appThemes, defaultThemeId: LIQUID_THEME_ID, storage: false, transition: false, target: detachedTarget(), attributeAdapter: () => {} }
    return { config, runtime: createOriaThemeRuntime(config) }
  }, [])
}

type Global = { themeId: string; dark: boolean }
export function PreviewThemeScope({ preview, global, children, onReady }: { preview: { config: OriaThemeConfig; runtime: OriaThemeRuntime }; global: Global; children: ReactNode; onReady: (controller: PreviewController) => void }) {
  return <OriaThemeProvider config={preview.config} runtime={preview.runtime}><Bridge runtime={preview.runtime} global={global} onReady={onReady}>{children}</Bridge></OriaThemeProvider>
}

function Bridge({ runtime, global, children, onReady }: { runtime: OriaThemeRuntime; global: Global; children: ReactNode; onReady: (controller: PreviewController) => void }) {
  useOriaTheme()
  useLayoutEffect(() => {
    let index: number | null = null
    const sequence = [global.themeId, ...picks.filter(id => id !== global.themeId), global.themeId]
    const scope = () => document.querySelector<HTMLElement>('[data-preview-scope]')
    const clear = (el: HTMLElement) => { el.removeAttribute('data-material'); el.removeAttribute('style'); el.removeAttribute('data-preview-theme') }
    const apply = () => {
      const el = scope(); if (!el) return
      const id = index === null ? global.themeId : sequence[index]
      runtime.setAppearance(global.dark ? 'dark' : 'light')
      runtime.setTheme(id)
      if (id === global.themeId) { clear(el); return }
      const variables = runtime.getSnapshot().resolvedTheme.variables
      el.removeAttribute('style')
      for (const [name, value] of Object.entries(variables)) el.style.setProperty(name, value)
      for (const size of ['sm', 'md', 'lg'] as const) el.style.setProperty(`--material-shadow-${size}`, materialShadows(variables, size).outer)
      el.style.setProperty('--interface-opacity', String(Number(variables['--oria-opacity-overlay']) || 1))
      el.dataset.material = 'theme'
      el.dataset.previewTheme = id
    }
    apply()
    onReady({ sequence, name: i => previewNames.get(sequence[i]) || '', set: next => { if (next === index) return; index = next; apply() } })
    return () => { const el = scope(); if (el) clear(el) }
  }, [runtime, global.themeId, global.dark, onReady])
  return children
}
