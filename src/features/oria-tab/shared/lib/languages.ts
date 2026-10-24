export const languageList = [
  { code: 'zh-CN', label: '简体中文' }, { code: 'zh-TW', label: '繁體中文' },
  { code: 'en', label: 'English' }, { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' }, { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' }, { code: 'ru', label: 'Русский' },
] as const
export type Language = typeof languageList[number]['code']
export function resolveLanguage(value: string | null | undefined): Language {
  const normalized = value?.trim().replaceAll('_', '-').toLowerCase() ?? ''
  if (/^zh-(tw|hk|mo|hant)/.test(normalized)) return 'zh-TW'
  if (normalized.startsWith('zh')) return 'zh-CN'
  return languageList.find(lang => normalized === lang.code || normalized.startsWith(`${lang.code}-`))?.code ?? 'en'
}

export function browserLanguage(): string { return typeof document !== 'undefined' ? document.documentElement.lang : 'en' }
