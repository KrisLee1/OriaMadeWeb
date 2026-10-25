// UI labels extracted from OriaTunnel's existing translations (GPL-3.0-only).
// Provenance: docs/migration-sources.json; original license: docs/licenses/OriaTunnel-GPL-3.0.txt.
import type {Locale} from '@/i18n/config'
import en from './locales/en.json'
import zhCN from './locales/zh-CN.json'
import zhTW from './locales/zh-TW.json'
import ja from './locales/ja.json'
import ko from './locales/ko.json'
import de from './locales/de.json'
import fr from './locales/fr.json'
import ru from './locales/ru.json'

export type DemoCopy = typeof en
const messages: Record<Locale, DemoCopy> = {'en':en, 'zh-CN':zhCN, 'zh-TW':zhTW, 'ja':ja, 'ko':ko, 'de':de, 'fr':fr, 'ru':ru}
export function getDemoCopy(locale: Locale): DemoCopy { return messages[locale] }
