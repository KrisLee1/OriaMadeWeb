"use client";
import { useState, type ReactNode } from 'react'
import { createInstance } from 'i18next'
import { I18nextProvider } from 'react-i18next'
import {isLocale, type Locale} from './config'
import {localize} from './localize'
import {useTranslation} from 'react-i18next'
const dictionaries = {
 en: { theme: { label: 'Theme', customThemes: 'Your themes', presetThemes: 'Preset themes' }, appAppearance: { label: 'Appearance', system: 'System', light: 'Light', dark: 'Dark' }, language: 'Language' },
 'zh-CN': { theme: { label: '主题', customThemes: '自定义主题', presetThemes: '预设主题' }, appAppearance: { label: '外观模式', system: '跟随系统', light: '浅色', dark: '深色' }, language: '语言' },
}
export function LanguageProvider({locale, children}:{locale:Locale;children:ReactNode}) {
 const [instance] = useState(() => { const i = createInstance(); void i.init({ lng:locale, resources:{[locale]:{translation:localize(locale,dictionaries.en,dictionaries['zh-CN'])}}, fallbackLng:false, initImmediate:false, interpolation:{escapeValue:false} }); return i })
 return <I18nextProvider i18n={instance}>{children}</I18nextProvider>
}

export function useSiteLocale(): Locale {
 const {i18n} = useTranslation()
 return isLocale(i18n.language) ? i18n.language : 'en'
}
