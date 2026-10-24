import { LIQUID_THEME_ID } from '@/features/oria-tab/shared/lib/theme-preference'
import { defaultHolidayRegion, validHolidayRegion } from '@/features/oria-tab/shared/lib/calendar/regions'
import { browserLanguage, resolveLanguage, type Language } from '@/features/oria-tab/shared/lib/languages'
import { validateTheme, oriaStandardContract, type ThemeDefinition } from '@oriatheme/core'
import { MAX_CUSTOM_THEME_COUNT } from '@/features/oria-tab/shared/lib/theme-import'
import { defaultBackground, validBackground, validSavedBackground, MAX_SAVED_BACKGROUNDS, type BackgroundSettings, type SavedBackground } from '@/features/oria-tab/shared/lib/background'
import { wallpaperRotationPool, validOnlineWallpaper, type WallpaperSourceId } from '@/features/oria-tab/shared/lib/wallpaper-sources'
import { defaultLiquidMaterial, validateLiquidMaterial, type LiquidMaterial } from '@/features/oria-tab/shared/lib/glass/model'
import { readLiquidMaterial } from '@/features/oria-tab/shared/lib/glass/migration'

export type Website = { id: string; title: string; url: string; favicon?: string }
export type Engine = { id: string; name: string; template: string; builtin?: boolean; enabled?: boolean }
export type SavedGroup = { id: string; name: string; sites: Website[]; createdAt: number }
export type DockItem = { id: string; kind: 'site'; site: Website } | { id: string; kind: 'group'; groupId: string } | { id: string; kind: 'aide' }
export const AIDE_DOCK_ID = 'aide'
export type Wallpaper = { id: string; name: string; builtin?: boolean; src?: string; thumbnail?: string; source?: WallpaperSourceId; author?: string; pageUrl?: string; dark?: boolean; date?: string }
export type MaterialOverride = { opacity?: number; blur?: number; themeColor?: Settings['themeColor'] | 'native'; customColor?: string; fontColor?: string }
export const settingsTabs = ['appearance', 'wallpapers', 'search', 'behavior'] as const
export type SettingsTab = typeof settingsTabs[number]
export const wallpaperGalleries = ['builtin', 'custom', 'bing', 'commons', 'nasa'] as const
export type Settings = {
  settingsTab: SettingsTab; wallpaperGallery: typeof wallpaperGalleries[number]; bookmarkFolderId: string;
  language: Language; theme: 'system' | 'light' | 'dark'; themeId: string; engineId: string;
  syncBrowserSearch: boolean; newTab: boolean; nativeGroups: boolean; magnify: boolean; dockSize: number;
  searchHistory: boolean; searchBookmarks: boolean; searchSettings: boolean; searchAskAide: boolean; searchTranslate: boolean;
  hdIcons: boolean; iconPermissionAsked: boolean;
  holidayRegion: string; showLunar: boolean; showHeaderLunar: boolean;
  themeColor: 'sage' | 'blue' | 'violet' | 'rose' | 'amber' | 'custom'; customColor: string; dockPosition: 'bottom' | 'top' | 'left' | 'right';
  opacity: number; colorConcentration: number; refraction: number; bevel: number; blur: number; dispersion: number; rim: number; dim: number; wallpaperBlur: number;
  materialOverrides: Record<string, MaterialOverride>;
  liquidMaterial: LiquidMaterial;
  background: BackgroundSettings;
  reduceMotion: boolean; wallpaperId: string; wallpaperAuto: boolean; bingDaily: boolean; bingDailyCheckedAt: number; wallpaperInterval: number; wallpaperOrder: 'sequential' | 'random'; wallpaperChangedAt: number;
}
export type AppState = { settings: Settings; customThemes: ThemeDefinition[]; savedBackgrounds: SavedBackground[]; engines: Engine[]; dock: DockItem[]; groups: SavedGroup[]; wallpapers: Wallpaper[] }
export type BookmarkNode = { id: string; title: string; url?: string; children?: BookmarkNode[]; folderType?: 'bookmarks-bar' | 'other' | 'mobile' | 'managed' }
export type BrowserTab = { id: number; title: string; url: string; favicon?: string; supported: boolean }
export type Action =
  | { type: 'settings'; patch: Partial<Settings> }
  | { type: 'theme.add'; theme: ThemeDefinition }
  | { type: 'theme.remove'; id: string }
  | { type: 'theme.material'; id: string; patch: MaterialOverride }
  | { type: 'background.save'; background: SavedBackground }
  | { type: 'background.select'; id: string }
  | { type: 'background.remove'; id: string }
  | { type: 'dock.add'; item: DockItem; index?: number }
  | { type: 'dock.remove'; id: string }
  | { type: 'dock.reorder'; ids: string[] }
  | { type: 'dock.update'; id: string; site: Website }
  | { type: 'group.save'; group: SavedGroup; pin?: boolean }
  | { type: 'group.remove'; id: string }
  | { type: 'engine.save'; engine: Engine }
  | { type: 'engine.remove'; id: string }
  | { type: 'engine.toggle'; id: string; enabled: boolean }
  | { type: 'wallpaper.daily'; wallpaper: Wallpaper; language: string; checkedAt: number }
  | { type: 'wallpaper.advance'; now: number }
  | { type: 'wallpaper.add'; wallpaper: Wallpaper }
  | { type: 'wallpaper.catalog'; wallpapers: Wallpaper[] }
  | { type: 'wallpaper.remove'; id: string }

export const uid = () => crypto.randomUUID()
export function safeUrl(raw: string): string {
  const value = raw.trim()
  const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value}`)
  if (!['https:', 'http:'].includes(url.protocol) || !url.hostname || url.username || url.password) throw new Error('invalidUrl')
  return url.href
}
export function validateTemplate(template: string): string {
  if (template.split('{query}').length !== 2 || !/^https?:\/\//i.test(template)) throw new Error('invalidTemplate')
  safeUrl(template.replace('{query}', 'example'))
  return template.trim()
}
export function searchUrl(engine: Engine, query: string) {
  return validateTemplate(engine.template).replace('{query}', encodeURIComponent(query.trim()))
}
export const builtins: Wallpaper[] = [
  { id: 'dawn', name: 'dawn', builtin: true, src: 'wallpapers/dawn.webp', thumbnail: 'wallpapers/dawn-thumb.webp', dark: true },
  { id: 'dusk', name: 'dusk', builtin: true, src: 'wallpapers/dusk.webp', thumbnail: 'wallpapers/dusk-thumb.webp', dark: true },
  { id: 'coast', name: 'coast', builtin: true, src: 'wallpapers/coast.webp', thumbnail: 'wallpapers/coast-thumb.webp', dark: false },
  { id: 'bloom', name: 'bloom', builtin: true, src: 'wallpapers/bloom.webp', thumbnail: 'wallpapers/bloom-thumb.webp', dark: false },
  { id: 'moonlit', name: 'moonlit', builtin: true, src: 'wallpapers/moonlit.webp', thumbnail: 'wallpapers/moonlit-thumb.webp', dark: true },
  { id: 'aurora', name: 'aurora', builtin: true, src: 'wallpapers/aurora.webp', thumbnail: 'wallpapers/aurora-thumb.webp', dark: true },
  { id: 'dunes', name: 'dunes', builtin: true, src: 'wallpapers/dunes.webp', thumbnail: 'wallpapers/dunes-thumb.webp', dark: false },
  { id: 'mist', name: 'mist', builtin: true, src: 'wallpapers/mist.webp', thumbnail: 'wallpapers/mist-thumb.webp', dark: false },
  { id: 'golden-gate', name: 'goldenGate', builtin: true, src: 'wallpapers/golden-gate.webp', thumbnail: 'wallpapers/golden-gate-thumb.webp', dark: false },
  { id: 'red-square', name: 'redSquare', builtin: true, src: 'wallpapers/red-square.webp', thumbnail: 'wallpapers/red-square-thumb.webp', dark: false },
  { id: 'shanghai', name: 'shanghai', builtin: true, src: 'wallpapers/shanghai.webp', thumbnail: 'wallpapers/shanghai-thumb.webp', dark: true },
  { id: 'giza', name: 'giza', builtin: true, src: 'wallpapers/giza.webp', thumbnail: 'wallpapers/giza-thumb.webp', dark: false },
  { id: 'westminster', name: 'westminster', builtin: true, src: 'wallpapers/westminster.webp', thumbnail: 'wallpapers/westminster-thumb.webp', dark: false },
  { id: 'fuji', name: 'fuji', builtin: true, src: 'wallpapers/fuji.webp', thumbnail: 'wallpapers/fuji-thumb.webp', dark: false },
]
export function initialState(): AppState {
  return {
    settings: { settingsTab: 'appearance', wallpaperGallery: 'builtin', bookmarkFolderId: '', language: resolveLanguage(browserLanguage()), theme: 'dark', themeId: LIQUID_THEME_ID, themeColor: 'violet', customColor: '#CDB0F4', dockPosition: 'bottom', engineId: 'bing', syncBrowserSearch: true, searchHistory: false, searchBookmarks: true, searchSettings: true, searchAskAide: true, searchTranslate: true, holidayRegion: defaultHolidayRegion(typeof navigator !== 'undefined' ? navigator.language : 'en'), showHeaderLunar: true, showLunar: resolveLanguage(typeof navigator !== 'undefined' ? navigator.language : 'en').startsWith('zh'), newTab: false, nativeGroups: true, magnify: true, dockSize: 48, hdIcons: true, iconPermissionAsked: false, materialOverrides: {}, liquidMaterial: {...defaultLiquidMaterial}, background: defaultBackground(), opacity: 50, colorConcentration: 32, refraction: 10, bevel: 8, blur: 4, dispersion: 30, rim: 30, dim: 0, wallpaperBlur: 0, reduceMotion: false, wallpaperId: 'dawn', wallpaperAuto: false, bingDaily: false, bingDailyCheckedAt: 0, wallpaperInterval: 300, wallpaperOrder: 'sequential', wallpaperChangedAt: Date.now() },
    engines: [
      { id: 'bing', name: 'Bing', template: 'https://www.bing.com/search?q={query}', builtin: true },
      { id: 'baidu', name: '百度', template: 'https://www.baidu.com/s?wd={query}', builtin: true },
      { id: 'google', name: 'Google', template: 'https://www.google.com/search?q={query}', builtin: true },
      { id: 'quark', name: '夸克', template: 'https://quark.sm.cn/s?q={query}', builtin: true },
      { id: 'duckduckgo', name: 'DuckDuckGo', template: 'https://duckduckgo.com/?q={query}', builtin: true },
      { id: 'brave', name: 'Brave', template: 'https://search.brave.com/search?q={query}', builtin: true },
      { id: 'sogou', name: '搜狗', template: 'https://www.sogou.com/web?query={query}', builtin: true },
      { id: '360', name: '360 搜索', template: 'https://www.so.com/s?q={query}', builtin: true },
      { id: 'yahoo', name: 'Yahoo', template: 'https://search.yahoo.com/search?p={query}', builtin: true },
    ],
    dock: [{ id: AIDE_DOCK_ID, kind: 'aide' }],
    customThemes: [], savedBackgrounds: [], groups: [], wallpapers: [...builtins],
  }
}
export function reduceState(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'background.save': {
      if (!validSavedBackground(action.background)) throw new Error('invalidColor')
      const background = { ...action.background, name: action.background.name.trim() }
      const exists = state.savedBackgrounds.some(item => item.id === background.id)
      if (!exists && state.savedBackgrounds.length >= MAX_SAVED_BACKGROUNDS) throw new Error('background.limit')
      const savedBackgrounds = exists ? state.savedBackgrounds.map(item => item.id === background.id ? background : item) : [...state.savedBackgrounds, background]
      const select = !exists || (state.settings.background.mode === 'saved' && state.settings.background.savedId === background.id)
      return { ...state, savedBackgrounds, settings: select ? { ...state.settings, background: { ...state.settings.background, mode: 'saved', savedId: background.id, custom: background.paint }, bingDaily: false, wallpaperChangedAt: Date.now() } : state.settings }
    }
    case 'background.select': {
      const background = state.savedBackgrounds.find(item => item.id === action.id)
      if (!background) throw new Error('genericError')
      return { ...state, settings: { ...state.settings, background: { ...state.settings.background, mode: 'saved', savedId: background.id, custom: background.paint }, bingDaily: false, wallpaperChangedAt: Date.now() } }
    }
    case 'background.remove': {
      const background = { ...state.settings.background }
      if (background.savedId === action.id) { delete background.savedId; if (background.mode === 'saved') background.mode = 'theme' }
      return { ...state, savedBackgrounds: state.savedBackgrounds.filter(item => item.id !== action.id), settings: { ...state.settings, background } }
    }
    case 'theme.add': {
      const checked = validateTheme(action.theme, oriaStandardContract)
      if (!checked.ok || checked.value.kind !== 'custom' || !checked.value.id.startsWith('custom-')) throw new Error('themeInvalid')
      if (state.customThemes.length >= MAX_CUSTOM_THEME_COUNT) throw new Error('themeLimit')
      if (state.customThemes.some(theme => theme.id === checked.value.id)) throw new Error('themeDuplicate')
      return { ...state, customThemes: [...state.customThemes, checked.value], settings: { ...state.settings, themeId: checked.value.id, background: { ...state.settings.background, mode: 'theme' }, bingDaily: false, wallpaperChangedAt: Date.now() } }
    }
    case 'theme.material': {
      if (action.id !== LIQUID_THEME_ID && !/^(oria-|custom-)[a-z0-9-]+$/.test(action.id)) throw new Error('genericError')
      if (action.id === LIQUID_THEME_ID && Object.keys(action.patch).some(key => key !== 'fontColor')) throw new Error('genericError')
      for (const key of ['opacity', 'blur'] as const) if (key in action.patch && (typeof action.patch[key] !== 'number' || !Number.isFinite(action.patch[key]) || action.patch[key]! < 0 || action.patch[key]! > (key === 'opacity' ? 100 : 96))) throw new Error('genericError')
      if ('themeColor' in action.patch && !['native', 'sage', 'blue', 'violet', 'rose', 'amber', 'custom'].includes(action.patch.themeColor ?? '')) throw new Error('genericError')
      if ('fontColor' in action.patch && action.patch.fontColor !== 'native' && !/^#[\da-f]{6}$/i.test(action.patch.fontColor ?? '')) throw new Error('genericError')
      if ('customColor' in action.patch && !/^#[\da-f]{6}$/i.test(action.patch.customColor ?? '')) throw new Error('invalidColor')
      return { ...state, settings: { ...state.settings, materialOverrides: { ...state.settings.materialOverrides, [action.id]: { ...state.settings.materialOverrides[action.id], ...action.patch } } } }
    }
    case 'theme.remove': {
      const materialOverrides = { ...state.settings.materialOverrides }; delete materialOverrides[action.id]
      const active = state.settings.themeId === action.id
      return { ...state, customThemes: state.customThemes.filter(theme => theme.id !== action.id), settings: { ...state.settings, materialOverrides, ...(active ? { themeId: LIQUID_THEME_ID, background: { ...state.settings.background, mode: 'theme' as const }, bingDaily: false, wallpaperChangedAt: Date.now() } : {}) } }
    }

    case 'settings': {
      if ('liquidMaterial' in action.patch) validateLiquidMaterial(action.patch.liquidMaterial!)
      if ('colorConcentration' in action.patch && (typeof action.patch.colorConcentration !== 'number' || !Number.isFinite(action.patch.colorConcentration) || action.patch.colorConcentration < 0 || action.patch.colorConcentration > 100)) throw new Error('genericError')
      for (const key of ['syncBrowserSearch', 'searchHistory', 'searchBookmarks', 'searchSettings', 'searchAskAide', 'searchTranslate', 'bingDaily', 'showLunar', 'showHeaderLunar'] as const) {
        if (key in action.patch && typeof action.patch[key] !== 'boolean') throw new Error('genericError')
      }
      if ('holidayRegion' in action.patch && !validHolidayRegion(action.patch.holidayRegion)) throw new Error('genericError')
      if ('settingsTab' in action.patch && !settingsTabs.includes(action.patch.settingsTab!)) throw new Error('genericError')
      if ('wallpaperGallery' in action.patch && !wallpaperGalleries.includes(action.patch.wallpaperGallery!)) throw new Error('genericError')
      if ('bookmarkFolderId' in action.patch && typeof action.patch.bookmarkFolderId !== 'string') throw new Error('genericError')
      if ('background' in action.patch && !validBackground(action.patch.background)) throw new Error('invalidColor')
      if ('customColor' in action.patch && !/^#[\da-f]{6}$/i.test(action.patch.customColor ?? '')) throw new Error('invalidColor')
      const settings = { ...state.settings, ...action.patch }
      if (action.patch.engineId && !state.engines.some(e => e.id === action.patch.engineId && e.enabled !== false)) throw new Error('engineDisabled')
      if (action.patch.wallpaperId || action.patch.background || action.patch.wallpaperAuto === true) settings.bingDaily = false
      if (action.patch.bingDaily === true) { settings.wallpaperAuto = false; settings.bingDailyCheckedAt = 0; settings.background = { ...settings.background, mode: 'image' } }
      if (action.patch.wallpaperId) settings.background = { ...settings.background, mode: 'image' }
      if (['background', 'wallpaperId', 'wallpaperAuto', 'wallpaperInterval', 'wallpaperOrder'].some(key => key in action.patch)) settings.wallpaperChangedAt = Date.now()
      if (action.patch.themeId && action.patch.themeId !== state.settings.themeId) {
        settings.background = { ...settings.background, mode: 'theme' }
        settings.bingDaily = false
        settings.wallpaperChangedAt = Date.now()
      }
      return { ...state, settings }
    }
    case 'dock.add': {
      const item = action.item
      if (item.kind === 'site') safeUrl(item.site.url)
      if (item.kind === 'group' && !state.groups.some(g => g.id === item.groupId)) throw new Error('missingGroup')
      const exists = state.dock.some(d => d.kind === 'aide' && item.kind === 'aide' || d.id === item.id || (d.kind === 'site' && item.kind === 'site' && d.site.url === item.site.url) || (d.kind === 'group' && item.kind === 'group' && d.groupId === item.groupId))
      if (exists) throw new Error('alreadyPinned')
      const dock = [...state.dock]
      dock.splice(Math.max(0, Math.min(dock.length, action.index ?? dock.length)), 0, item)
      return { ...state, dock }
    }
    case 'dock.remove': return { ...state, dock: state.dock.filter(d => d.kind === 'aide' || d.id !== action.id) }
    case 'dock.update': {
      safeUrl(action.site.url)
      return { ...state, dock: state.dock.map(d => d.id === action.id && d.kind === 'site' ? { ...d, site: action.site } : d) }
    }
    case 'dock.reorder': {
      const byId = new Map(state.dock.map(d => [d.id, d]))
      const ids = [...new Set(action.ids)]
      const ordered = ids.flatMap(id => byId.has(id) ? [byId.get(id)!] : [])
      return { ...state, dock: [...ordered, ...state.dock.filter(d => !ids.includes(d.id))] }
    }
    case 'group.save': {
      if (!action.group.name.trim() || (!action.group.sites.length && !state.groups.some(group => group.id === action.group.id))) throw new Error('groupRequired')
      action.group.sites.forEach(s => safeUrl(s.url))
      const groups = state.groups.some(g => g.id === action.group.id) ? state.groups.map(g => g.id === action.group.id ? action.group : g) : [...state.groups, action.group]
      const pinned = state.dock.some(d => d.kind === 'group' && d.groupId === action.group.id)
      return { ...state, groups, dock: action.pin && !pinned ? [...state.dock, { id: uid(), kind: 'group', groupId: action.group.id }] : state.dock }
    }
    case 'group.remove': return { ...state, groups: state.groups.filter(g => g.id !== action.id), dock: state.dock.filter(d => !(d.kind === 'group' && d.groupId === action.id)) }
    case 'engine.save': {
      validateTemplate(action.engine.template)
      if (!action.engine.name.trim()) throw new Error('nameRequired')
      if (state.engines.some(e => e.id === action.engine.id && e.builtin)) throw new Error('builtinProtected')
      return { ...state, engines: [...state.engines.filter(e => e.id !== action.engine.id), action.engine] }
    }
    case 'engine.toggle': {
      const engines = state.engines.map(e => e.id === action.id ? { ...e, enabled: action.enabled } : e)
      if (!engines.some(e => e.enabled !== false)) throw new Error('lastEngine')
      const engineId = engines.some(e => e.id === state.settings.engineId && e.enabled !== false) ? state.settings.engineId : engines.find(e => e.enabled !== false)!.id
      return { ...state, engines, settings: { ...state.settings, engineId } }
    }
    case 'engine.remove': {
      if (state.engines.some(e => e.id === action.id && e.builtin)) throw new Error('builtinProtected')
      const engines = state.engines.filter(e => e.id !== action.id)
      if (!engines.some(e => e.enabled !== false)) throw new Error('lastEngine')
      return { ...state, engines, settings: { ...state.settings, engineId: state.settings.engineId === action.id ? engines.find(e => e.enabled !== false)!.id : state.settings.engineId } }
    }
    case 'wallpaper.daily': {
      if (!state.settings.bingDaily || state.settings.background.mode !== 'image' || state.settings.language !== action.language) return state
      if (action.wallpaper.source !== 'bing' || !validOnlineWallpaper(action.wallpaper) || !action.wallpaper.date || !Number.isFinite(action.checkedAt)) throw new Error('genericError')
      const current = state.wallpapers.find(item => item.id === state.settings.wallpaperId)
      if (current?.source === 'bing' && current.date && current.date > action.wallpaper.date) return state
      const catalog = reduceState(state, { type: 'wallpaper.catalog', wallpapers: [action.wallpaper] })
      return { ...catalog, settings: { ...catalog.settings, wallpaperId: action.wallpaper.id, bingDailyCheckedAt: action.checkedAt, wallpaperChangedAt: current?.id === action.wallpaper.id ? state.settings.wallpaperChangedAt : action.checkedAt } }
    }
    case 'wallpaper.advance': {
      const { settings } = state, wallpapers = wallpaperRotationPool(state.wallpapers, settings.wallpaperId)
      if (settings.background.mode !== 'image' || !settings.wallpaperAuto || wallpapers.length < 2 || action.now < settings.wallpaperChangedAt + settings.wallpaperInterval * 1000) return state
      return { ...state, settings: { ...settings, wallpaperId: nextWallpaper(wallpapers, settings.wallpaperId, settings.wallpaperOrder), wallpaperChangedAt: action.now } }
    }
    case 'wallpaper.catalog': {
      if (action.wallpapers.length > 24 || action.wallpapers.some(item => !validOnlineWallpaper(item))) throw new Error('genericError')
      const online = new Map(state.wallpapers.filter(item => item.source).map(item => [item.id, item]))
      for (const item of action.wallpapers) online.set(item.id, item)
      const selected = online.get(state.settings.wallpaperId), recent = [...online.values()].filter(item => item.id !== selected?.id).slice(-199)
      return { ...state, wallpapers: [...state.wallpapers.filter(item => !item.source), ...recent, ...(selected ? [selected] : [])] }
    }
    case 'wallpaper.add': {
      if (action.wallpaper.source && !validOnlineWallpaper(action.wallpaper)) throw new Error('genericError')
      return { ...state, wallpapers: [...state.wallpapers.filter(w => w.id !== action.wallpaper.id), action.wallpaper], settings: { ...state.settings, wallpaperId: action.wallpaper.id, background: { ...state.settings.background, mode: 'image' }, bingDaily: false, wallpaperChangedAt: Date.now() } }
    }
    case 'wallpaper.remove': {
      if (state.wallpapers.some(w => w.id === action.id && w.builtin)) throw new Error('builtinProtected')
      return { ...state, wallpapers: state.wallpapers.filter(w => w.id !== action.id), settings: { ...state.settings, wallpaperId: state.settings.wallpaperId === action.id ? 'dawn' : state.settings.wallpaperId, wallpaperChangedAt: Date.now() } }
    }
  }
}
export function flattenBookmarks(nodes: BookmarkNode[], path: string[] = []): (Website & { path: string })[] {
  return nodes.flatMap(node => node.url ? [{ id: node.id, title: node.title || new URL(node.url).hostname, url: node.url, path: path.join(' / ') }] : flattenBookmarks(node.children ?? [], node.title ? [...path, node.title] : path))
}
export function reorder<T>(items: T[], from: number, to: number): T[] {
  const next = [...items]
  if (from < 0 || to < 0 || from >= items.length || to >= items.length) return next
  const [item] = next.splice(from, 1); next.splice(to, 0, item); return next
}

/** Chrome permanent containers organise storage, while user folders organise the Launchpad. */
export function bookmarkGroups(nodes: BookmarkNode[]): BookmarkNode[] {
  return nodes.flatMap(node => {
    if (node.url) return []
    if (!node.title || node.id === '0' || node.folderType || ['1', '2', '3'].includes(node.id)) return bookmarkGroups(node.children ?? [])
    return [node]
  })
}

/** Resolve a saved folder against the current tree, including renamed/moved parents. */
export function bookmarkFolderPath(folders: BookmarkNode[], id: string): BookmarkNode[] {
  if (!id) return []
  for (const folder of folders) {
    if (folder.url) continue
    if (folder.id === id) return [folder]
    const nested = bookmarkFolderPath(folder.children ?? [], id)
    if (nested.length) return [folder, ...nested]
  }
  return []
}

/** Fill new preference fields when an existing browser profile upgrades. */
export function hydrateState(saved?: Partial<Omit<AppState, 'settings'>> & { settings?: Partial<Settings> } | null): AppState {
  const defaults = initialState()
  const legacySites: Record<string, string> = { github: 'https://github.com/', youtube: 'https://www.youtube.com/', notion: 'https://www.notion.so/', figma: 'https://www.figma.com/' }
  let foundAide = false
  const dock = (saved?.dock ?? defaults.dock).filter(item => {
    if (item.kind === 'site' && legacySites[item.id] === item.site.url && item.site.id === item.id) return false
    if (item.kind === 'aide') { if (foundAide) return false; foundAide = true }
    return true
  }).map(item => item.kind === 'aide' ? { id: AIDE_DOCK_ID, kind: 'aide' as const } : item)
  if (!foundAide) dock.unshift({ id: AIDE_DOCK_ID, kind: 'aide' })
  const settings = { ...defaults.settings, ...saved?.settings }
  settings.liquidMaterial=readLiquidMaterial(saved?.settings?.liquidMaterial,saved?.settings)
  if (typeof settings.colorConcentration !== 'number' || !Number.isFinite(settings.colorConcentration) || settings.colorConcentration < 0 || settings.colorConcentration > 100) settings.colorConcentration = defaults.settings.colorConcentration
  if (!validBackground(settings.background)) settings.background = defaultBackground()
  const overrides = settings.materialOverrides
  settings.materialOverrides = {}
  if (overrides && typeof overrides === 'object') for (const [id, value] of Object.entries(overrides).slice(0, 100)) {
    if ((id !== LIQUID_THEME_ID && !/^(oria-|custom-)[a-z0-9-]+$/.test(id)) || !value || typeof value !== 'object') continue
    const patch: MaterialOverride = {}
    if (typeof value.fontColor === 'string' && (value.fontColor === 'native' || /^#[\da-f]{6}$/i.test(value.fontColor))) patch.fontColor = value.fontColor
    if (id === LIQUID_THEME_ID) { if (patch.fontColor) settings.materialOverrides[id] = patch; continue }
    for (const key of ['opacity', 'blur'] as const) if (typeof value[key] === 'number' && Number.isFinite(value[key]) && value[key]! >= 0 && value[key]! <= (key === 'opacity' ? 100 : 96)) patch[key] = value[key]
    if (value.themeColor && ['native', 'sage', 'blue', 'violet', 'rose', 'amber', 'custom'].includes(value.themeColor)) patch.themeColor = value.themeColor
    if (typeof value.customColor === 'string' && /^#[\da-f]{6}$/i.test(value.customColor)) patch.customColor = value.customColor
    if (Object.keys(patch).length) settings.materialOverrides[id] = patch
  }
  for (const key of ['syncBrowserSearch', 'searchHistory', 'searchBookmarks', 'searchSettings', 'searchAskAide', 'searchTranslate', 'bingDaily', 'showLunar', 'showHeaderLunar'] as const) {
    if (typeof settings[key] !== 'boolean') settings[key] = defaults.settings[key]
  }
  if (!Number.isFinite(settings.bingDailyCheckedAt) || settings.bingDailyCheckedAt < 0) settings.bingDailyCheckedAt = 0
  if (settings.bingDaily) settings.wallpaperAuto = false
  if (!validHolidayRegion(settings.holidayRegion)) settings.holidayRegion = defaults.settings.holidayRegion
  settings.language = resolveLanguage(settings.language)
  if (!settingsTabs.includes(settings.settingsTab)) settings.settingsTab = defaults.settings.settingsTab
  if (!wallpaperGalleries.includes(settings.wallpaperGallery)) settings.wallpaperGallery = defaults.settings.wallpaperGallery
  if (typeof settings.bookmarkFolderId !== 'string') settings.bookmarkFolderId = ''
  const savedBackgrounds: SavedBackground[] = []
  for (const candidate of Array.isArray(saved?.savedBackgrounds) ? saved.savedBackgrounds.slice(0, MAX_SAVED_BACKGROUNDS) : []) {
    if (validSavedBackground(candidate) && !savedBackgrounds.some(item => item.id === candidate.id)) savedBackgrounds.push({ ...candidate, name: candidate.name.trim() })
  }
  if (settings.background.mode === 'saved') {
    const selected = savedBackgrounds.find(item => item.id === settings.background.savedId)
    settings.background = selected ? { ...settings.background, custom: selected.paint } : { ...settings.background, mode: 'theme', savedId: undefined }
  }
  if (!['system', 'light', 'dark'].includes(settings.theme)) settings.theme = defaults.settings.theme
  if (typeof settings.themeId !== 'string' || !settings.themeId) settings.themeId = LIQUID_THEME_ID
  if (!/^#[\da-f]{6}$/i.test(settings.customColor)) settings.customColor = defaults.settings.customColor
  // Retire the old material choice; older profiles also receive the narrow edge default.
  delete (settings as Settings & { glass?: string }).glass
  if (saved?.settings && !('themeColor' in saved.settings)) settings.bevel = defaults.settings.bevel
  const engines = [...(saved?.engines ?? defaults.engines)]
  for (const engine of defaults.engines) if (!engines.some(e => e.id === engine.id)) engines.push(engine)
  if (!engines.some(e => e.enabled !== false)) engines[0] = { ...engines[0], enabled: true }
  if (!engines.some(e => e.id === settings.engineId && e.enabled !== false)) settings.engineId = engines.find(e => e.enabled !== false)!.id
  const customThemes: ThemeDefinition[] = []
  for (const candidate of Array.isArray(saved?.customThemes) ? saved.customThemes.slice(0, MAX_CUSTOM_THEME_COUNT) : []) {
    const checked = validateTheme(candidate, oriaStandardContract)
    if (checked.ok && checked.value.kind === 'custom' && checked.value.id.startsWith('custom-') && !customThemes.some(theme => theme.id === checked.value.id)) customThemes.push(checked.value)
  }
  // Refresh packaged artwork/metadata and add new built-ins to existing profiles.
  // The unreleased Liberty study was replaced by Red Square; keep existing selections usable.
  const retiredLiberty = saved?.wallpapers?.some(item => item.builtin && item.id === 'liberty')
  if (retiredLiberty && settings.wallpaperId === 'liberty') settings.wallpaperId = 'red-square'
  const wallpapers = [...builtins, ...(saved?.wallpapers ?? []).filter(item => !(item.builtin && item.id === 'liberty') && !builtins.some(builtin => builtin.id === item.id) && (!item.source || validOnlineWallpaper(item)))]
  if (!wallpapers.some(item => item.id === settings.wallpaperId)) settings.wallpaperId = defaults.settings.wallpaperId
  return { ...defaults, ...saved, dock, settings, engines, customThemes, savedBackgrounds, wallpapers }
}

export function nextWallpaper(wallpapers: Wallpaper[], current: string, order: Settings['wallpaperOrder'], random = Math.random): string {
  if (wallpapers.length < 2) return wallpapers[0]?.id ?? current
  if (order === 'random') { const candidates = wallpapers.filter(w => w.id !== current); return candidates[Math.floor(random() * candidates.length)].id }
  return wallpapers[(wallpapers.findIndex(w => w.id === current) + 1) % wallpapers.length].id
}
