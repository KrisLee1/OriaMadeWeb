import type { Wallpaper } from '@/features/oria-tab/shared/lib/model'

export const wallpaperSources = [
  { id: 'bing', name: 'Bing Wallpaper', label: 'Bing', url: 'https://www.bing.com/', license: 'Wallpaper use only', licenseUrl: 'https://www.microsoft.com/servicesagreement' },
  { id: 'commons', name: 'Wikimedia Commons', label: 'Wikimedia', url: 'https://commons.wikimedia.org/', license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/' },
  { id: 'nasa', name: 'NASA Image Library', label: 'NASA', url: 'https://images.nasa.gov/', license: 'NASA media guidelines', licenseUrl: 'https://www.nasa.gov/nasa-brand-center/images-and-media/' },
] as const
export type WallpaperSourceId = typeof wallpaperSources[number]['id']
export type WallpaperPage = { items: Wallpaper[]; next?: number }
type CommonsInfo = { url?: string; thumburl?: string; width?: number; height?: number; mime?: string; extmetadata?: Record<string, { value?: string }> }
type CommonsResponse = { batchcomplete?: boolean; error?: unknown; continue?: { gsroffset?: number }; query?: { pages?: { pageid: number; title: string; index?: number; imageinfo?: CommonsInfo[] }[] } }
type NasaLink = { href?: string; render?: string; width?: number; height?: number; size?: number }
type NasaResponse = { collection?: { items?: { data?: { nasa_id?: string; title?: string; center?: string; photographer?: string; secondary_creator?: string; description?: string; media_type?: string }[]; links?: NasaLink[] }[]; links?: { rel: string }[] } }
type BingResponse = { images?: { startdate?: string; url?: string; urlbase?: string; title?: string; copyright?: string; copyrightlink?: string; wp?: boolean }[] }
export function wallpaperSourceLabel(source: typeof wallpaperSources[number], translate: (key: string) => string) { return source.id === 'bing' ? translate('engine.bing') : source.label }
export function wallpaperSourceLicense(source: typeof wallpaperSources[number], translate: (key: string) => string) { return source.id === 'bing' ? translate('wallpaper.bingUsage') : source.license }
export function bingMarket(language: string) { return ({ 'zh-CN': 'zh-CN', 'zh-TW': 'zh-TW', en: 'en-US', ja: 'ja-JP', ko: 'ko-KR', de: 'de-DE', fr: 'fr-FR', ru: 'ru-RU' } as Record<string, string>)[language] ?? 'en-US' }
export function bingWallpaperApi(market: string, cursor = 0) { return 'https://www.bing.com/HPImageArchive.aspx?' + new URLSearchParams({ format: 'js', idx: cursor === 0 ? '0' : '7', n: '8', uhd: '1', mkt: market }) }
function text(value = '') { return value.replace(/<[^>]*>/g, '').replace(/&(?:amp|quot|apos|lt|gt);/g, entity => ({ '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' })[entity]!).trim().slice(0, 240) }
function imageUrl(value: unknown, source: WallpaperSourceId) {
  try { const url = source === 'bing' ? new URL(String(value), 'https://www.bing.com/') : new URL(String(value)); if (typeof value !== 'string' || url.protocol !== 'https:' || url.username || url.password || url.port) return undefined
    if (source === 'bing') {
      const id = url.searchParams.get('id') ?? ''
      if (url.hostname !== 'www.bing.com' || url.pathname !== '/th' || !/^OHR\.[\w-]+_(?:UHD|\d{3,4}x\d{3,4})\.jpg$/.test(id) || id.length > 200) return undefined
      const parameters = new URLSearchParams({ id })
      for (const key of ['w', 'h']) { const size = url.searchParams.get(key); if (size && /^\d{1,4}$/.test(size) && Number(size) >= 100 && Number(size) <= 4096) parameters.set(key, size) }
      if (parameters.has('w') && parameters.has('h')) parameters.set('c', '4')
      url.search = parameters.toString(); url.hash = ''; return url.href
    }
    if (!(source === 'commons' ? ['upload.wikimedia.org', 'thumb.wikimedia.org'] : ['images-assets.nasa.gov']).includes(url.hostname)) return undefined
    url.search = ''; return url.href
  } catch { return undefined }
}
export function parseBingPage(data: BingResponse): WallpaperPage {
  if (!Array.isArray(data.images)) throw new Error('wallpaper.catalogError')
  const items: Wallpaper[] = []
  for (const image of data.images.slice(0, 8)) {
    if (image.wp !== true || !/^\d{8}$/.test(image.startdate ?? '') || !image.copyright || !image.urlbase) continue
    let base: URL, page: URL
    try { base = new URL(image.urlbase, 'https://www.bing.com/'); page = new URL(image.copyrightlink ?? '') } catch { continue }
    const baseId = base.searchParams.get('id') ?? ''
    if (base.origin !== 'https://www.bing.com' || base.pathname !== '/th' || !/^OHR\.[\w-]+$/.test(baseId) || baseId.length > 170 || page.origin !== 'https://www.bing.com' || page.pathname !== '/search' || page.username || page.password) continue
    const full = imageUrl(image.url, 'bing')
    if (!full) continue
    const srcUrl = new URL(full); srcUrl.searchParams.delete('w'); srcUrl.searchParams.delete('h'); srcUrl.searchParams.delete('c')
    if (!srcUrl.searchParams.get('id')?.startsWith(baseId + '_')) continue
    const thumb = new URL(srcUrl); thumb.searchParams.set('w', '640'); thumb.searchParams.set('h', '360'); thumb.searchParams.set('c', '4')
    const author = text(image.copyright), name = text(image.title) || author
    const item: Wallpaper = { id: 'bing-' + baseId.slice(4), name, source: 'bing', src: srcUrl.href, thumbnail: thumb.href, author, pageUrl: page.href, date: image.startdate }
    if (validOnlineWallpaper(item) && !items.some(previous => previous.id === item.id)) items.push(item)
  }
  return { items }
}
export function validOnlineWallpaper(value: Wallpaper) {
  if (!value || typeof value.id !== 'string' || typeof value.name !== 'string' || typeof value.pageUrl !== 'string' || typeof value.author !== 'string') return false
  const source = wallpaperSources.find(item => item.id === value.source)
  return Boolean(source && (value.date === undefined || /^\d{8}$/.test(value.date)) && value.id.startsWith(source.id + '-') && value.id.length <= 180 && typeof value.name === 'string' && value.name.length <= 240 && imageUrl(value.src, source.id) && imageUrl(value.thumbnail, source.id) && value.pageUrl?.startsWith(source.url) && value.author && value.author.length <= 240)
}
export function parseCommonsPage(data: CommonsResponse): WallpaperPage {
  if (data.error || (!data.query && data.batchcomplete !== true)) throw new Error('wallpaper.catalogError')
  const items: Wallpaper[] = []
  for (const page of [...(data.query?.pages ?? [])].sort((a, b) => (a.index ?? 0) - (b.index ?? 0))) {
    const info = page.imageinfo?.[0], metadata = info?.extmetadata
    if (!info || !metadata || text(metadata.LicenseShortName?.value) !== 'CC0' || text(metadata.Restrictions?.value) || !['image/jpeg', 'image/png', 'image/webp'].includes(info.mime ?? '') || (info.width ?? 0) < 1280 || (info.width ?? 0) < (info.height ?? Infinity) * 1.2) continue
    const thumbnail = imageUrl(info.thumburl, 'commons'), original = imageUrl(info.url, 'commons')
    if (!thumbnail || !original) continue
    const src = (info.width ?? 0) > 3840 ? thumbnail.replace(/\/\d+px-([^/]+)$/, '/3840px-$1') : original
    const item: Wallpaper = { id: 'commons-' + page.pageid, source: 'commons', name: text(page.title.replace(/^File:/, '').replace(/\.[^.]+$/, '').replaceAll('_', ' ')), src, thumbnail, author: text(metadata.Artist?.value) || 'Wikimedia contributor', pageUrl: 'https://commons.wikimedia.org/wiki/' + encodeURIComponent(page.title) }
    if (validOnlineWallpaper(item)) items.push(item)
  }
  return { items, next: data.continue?.gsroffset }
}
export function parseNasaPage(data: NasaResponse, page: number): WallpaperPage {
  if (!data.collection?.items) throw new Error('wallpaper.catalogError')
  const items: Wallpaper[] = []
  for (const entry of data.collection.items) {
    const info = entry.data?.[0]
    // NASA-owned JSC imagery; omit identified third-party/copyright-restricted records.
    if (!info?.nasa_id || info.media_type !== 'image' || info.center !== 'JSC' || /copyright|©|Getty|Reuters|\bESA\b|\bESO\b/i.test((info.description ?? '') + ' ' + (info.secondary_creator ?? '')) || (info.photographer && !/^NASA\b/i.test(info.photographer))) continue
    const links = (entry.links ?? []).filter(link => link.render === 'image' && imageUrl(link.href, 'nasa') && (link.width ?? 0) >= (link.height ?? Infinity) * 1.2).sort((a, b) => (a.width ?? 0) - (b.width ?? 0))
    const preview = links.find(link => (link.width ?? 0) >= 320), full = links.filter(link => (link.width ?? 0) >= 1280 && (link.width ?? Infinity) <= 4096 && (link.size ?? Infinity) <= 12 * 1024 * 1024).at(-1)
    if (!preview || !full) continue
    const item: Wallpaper = { id: 'nasa-' + info.nasa_id, name: text(info.title) || info.nasa_id, source: 'nasa', src: imageUrl(full.href, 'nasa'), thumbnail: imageUrl(preview.href, 'nasa'), author: text(info.photographer || 'NASA / ' + info.center), pageUrl: 'https://images.nasa.gov/details/' + encodeURIComponent(info.nasa_id) }
    if (validOnlineWallpaper(item)) items.push(item)
  }
  return { items, next: data.collection.links?.some(link => link.rel === 'next') ? page + 1 : undefined }
}
export function findWallpaper(local: Wallpaper[], id: string) { return local.find(item => item.id === id) }
export function wallpaperRotationPool(local: Wallpaper[], id: string) {
  const selected = findWallpaper(local, id)
  return local.filter(item => selected?.source ? item.source === selected.source : !item.source)
}
