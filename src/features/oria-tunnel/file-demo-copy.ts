// Extracted from OriaTunnel's eight files.json resources. GPL-3.0-only.
// Source fingerprints and extraction keys: docs/migration-sources.json.
import type {Locale} from '@/i18n/config'
import en from './locales/files/en.json'
import zhCN from './locales/files/zh-CN.json'
import zhTW from './locales/files/zh-TW.json'
import ja from './locales/files/ja.json'
import ko from './locales/files/ko.json'
import de from './locales/files/de.json'
import fr from './locales/files/fr.json'
import ru from './locales/files/ru.json'

export type FileDemoCopy=typeof en
const copy:Record<Locale,FileDemoCopy>={en,'zh-CN':zhCN,'zh-TW':zhTW,ja,ko,de,fr,ru}
export const getFileDemoCopy=(locale:Locale)=>copy[locale]
