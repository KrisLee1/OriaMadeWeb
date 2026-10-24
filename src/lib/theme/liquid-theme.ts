import {oriaDefaultTheme,oriaPresetThemes} from '@oriatheme/presets'
import type {ThemeDefinition,ThemeTokenSet} from '@oriatheme/core'
export const LIQUID_THEME_ID = 'oriatab-liquid'
export const liquidTheme: ThemeDefinition = {
  ...oriaDefaultTheme, id: LIQUID_THEME_ID, name: 'Liquid glass',
  modes: {
    light: { ...oriaDefaultTheme.modes.light,
      'color.bg': '#f7f6fb', 'color.fg': '#37334a', 'color.surface': '#faf9fd', 'color.surface.fg': '#37334a',
      'color.overlay': '#f8f7fc', 'color.overlay.fg': '#37334a', 'color.primary': '#7b6a92', 'color.primary.fg': '#fafaf8',
      'color.secondary': '#ece9f4', 'color.secondary.fg': '#37334a', 'color.muted': '#eeecf4', 'color.muted.fg': '#6d687f',
      'color.accent': '#eae5f6', 'color.accent.fg': '#37334a', 'color.border': '#9386b633', 'color.ring': '#CDB0F4',
    } as ThemeTokenSet,
    dark: { ...oriaDefaultTheme.modes.dark,
      'color.bg': '#242628', 'color.fg': '#eceef0', 'color.surface': '#303236', 'color.surface.fg': '#eceef0',
      'color.overlay': '#2c2e30', 'color.overlay.fg': '#eceef0', 'color.primary': '#cdb0f4', 'color.primary.fg': '#202225',
      'color.secondary': '#383b3f', 'color.secondary.fg': '#eceef0', 'color.muted': '#33363a', 'color.muted.fg': '#bec2c7',
      'color.accent': '#403c50', 'color.accent.fg': '#eceef0', 'color.border': '#d1d5dc24', 'color.ring': '#cdb0f4',
    } as ThemeTokenSet,
  },
}
export const websiteThemes = [...oriaPresetThemes, liquidTheme]
