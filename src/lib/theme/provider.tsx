"use client";
import {ThemeActionProvider} from "./actions"
import {websiteThemes} from './liquid-theme'
import type { ReactNode } from 'react'
import { OriaThemeProvider } from '@oriatheme/react'
import { oriaDefaultTheme, oriaPresetThemes } from '@oriatheme/presets'
import type { OriaThemeConfig } from '@oriatheme/runtime-dom'
export const AIDE_THEME_OPTIONS = websiteThemes.map(theme => ({id:theme.id,name:theme.name,theme}))
export const THEME_STORAGE_KEY = 'oria-made-theme'
export const websiteThemeConfig: OriaThemeConfig = {
 presets:websiteThemes, defaultThemeId:oriaDefaultTheme.id, defaultAppearance:'system', storageKey:THEME_STORAGE_KEY,
 transition:{type:'view-transition',duration:360,respectReducedMotion:true},
 attributeAdapter:({root,resolvedMode}) => { root.classList.toggle('dark',resolvedMode === 'dark') },
}
export function ThemeProvider({children}:{children:ReactNode}) { return <OriaThemeProvider config={websiteThemeConfig}><ThemeActionProvider>{children}</ThemeActionProvider></OriaThemeProvider> }
