import {localizedPath} from '@/i18n/config'
import type {Locale} from './i18n'
export function themePath(locale:Locale){return localizedPath(locale==='zh'?'zh-CN':'en','/oria-theme')}
