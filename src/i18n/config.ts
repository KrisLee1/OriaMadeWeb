export const languageList = [
  {code: 'en', label: 'English'}, {code: 'zh-CN', label: '简体中文'},
  {code: 'zh-TW', label: '繁體中文'}, {code: 'ja', label: '日本語'},
  {code: 'ko', label: '한국어'}, {code: 'de', label: 'Deutsch'},
  {code: 'fr', label: 'Français'}, {code: 'ru', label: 'Русский'},
] as const
export type Locale = typeof languageList[number]['code']
export const locales: readonly Locale[] = languageList.map(item => item.code)
export function isLocale(value: string): value is Locale { return locales.some(locale => locale === value) }
export function localizedPath(locale: Locale, path = '/') {
  const clean = '/' + stripLocale(path).replace(/^\/+|\/+$/g, '')
  return locale === 'en' ? clean : '/' + locale + (clean === '/' ? '' : clean)
}
export function stripLocale(path: string) {
  const [prefix] = path.slice(1).split('/')
  return isLocale(prefix) ? path.slice(prefix.length + 1) || '/' : path
}
