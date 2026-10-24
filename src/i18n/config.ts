export const locales = ['en', 'zh-CN'] as const
export type Locale = typeof locales[number]
export function isLocale(value: string): value is Locale { return (locales as readonly string[]).includes(value) }
export function localizedPath(locale: Locale, path = '/') {
  const clean = '/' + path.replace(/^\/+|\/+$/g, '')
  return locale === 'en' ? clean : '/zh-CN' + (clean === '/' ? '' : clean)
}
export function stripLocale(path: string) { return path.replace(/^\/(en|zh-CN)(?=\/|$)/, '') || '/' }
