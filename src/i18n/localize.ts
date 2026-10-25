import {cloneElement, isValidElement, type ReactElement} from 'react'
import type {Locale} from './config'
import zhCN from './messages/zh-CN.json'
import zhTW from './messages/zh-TW.json'
import ja from './messages/ja.json'
import ko from './messages/ko.json'
import de from './messages/de.json'
import fr from './messages/fr.json'
import ru from './messages/ru.json'

const messages: Partial<Record<Locale, Record<string, string>>> = {'zh-CN':zhCN, 'zh-TW':zhTW, ja, ko, de, fr, ru}
// Translate only authored presentation values. Identifiers, URLs, code and user data
// never enter the dictionary and retain their exact spelling.
const technicalProps = new Set(['key', 'ref', 'id', 'slug', 'group', 'href', 'src', 'style', 'className', 'code', 'command', 'value', 'htmlFor', 'lang', 'language', 'name', 'number', 'type'])
export function localize<T>(locale: string, english: T, chinese?: unknown): T {
  if (locale === 'zh-CN' && chinese !== undefined) return chinese as T
  const dictionary = messages[locale as Locale]
  if (!dictionary) return english
  const translate = (value: unknown): unknown => {
    if (typeof value === 'string') return dictionary[value] ?? value
    if (Array.isArray(value)) return value.map(translate)
    if (isValidElement(value)) {
      const element = value as ReactElement<Record<string, unknown>>
      if (element.type === 'code' || element.type === 'pre') return element
      const props = Object.fromEntries(Object.entries(element.props).map(([key, entry]) => [key, technicalProps.has(key) || key.startsWith('data-') ? entry : translate(entry)]))
      return cloneElement(element, props)
    }
    if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
      return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, ['id','slug','group','href','src','code','signature','command','path'].includes(key) ? entry : translate(entry)]))
    }
    return value
  }
  return translate(english) as T
}
