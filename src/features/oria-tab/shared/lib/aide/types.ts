export type ModelProtocol = 'openai-completions' | 'openai-responses' | 'anthropic-messages'
export type TranslationProvider = 'model' | 'google' | 'deepl' | 'youdao' | 'baidu' | 'volcengine'
export type TranslationDomain = 'general' | 'information_technology' | 'finance' | 'manufacturing' | 'biomedicine' | 'web_literature' | 'game'
export const webSearchSourceIds = ['bing', 'baidu', 'sogou', 'quark', 'google', 'duckduckgo', 'wikipedia', 'yahoo', '360', 'brave-web'] as const
export type WebSearchSourceId = typeof webSearchSourceIds[number]
export const webSearchApiProtocols = ['tavily', 'exa', 'brave', 'serpapi', 'bocha', 'zhipu', 'aliyun-iqs', 'baidu-qianfan'] as const
export type WebSearchApiProtocol = typeof webSearchApiProtocols[number]
export type SearchProvider = WebSearchSourceId | WebSearchApiProtocol
export interface WebSearchApiPlatform { providerId: string; name: string; protocol: WebSearchApiProtocol; apiAddress: string; presetId?: string; enabled?: boolean; configured?: boolean }
export interface WebSearchConfig { sources: Record<WebSearchSourceId, boolean>; apiPlatforms: WebSearchApiPlatform[] }
export const defaultSearchSources = Object.fromEntries(webSearchSourceIds.map(id => [id, id === 'bing' || id === 'baidu'])) as Record<WebSearchSourceId, boolean>
export function enabledWebSearchSources(search: WebSearchConfig) { return webSearchSourceIds.filter(id => search.sources[id]) }
export function enabledWebSearchPlatforms(search: WebSearchConfig) { return search.apiPlatforms.filter(p => p.enabled !== false && p.configured !== false) }
export function hasWebSearchSources(config: AideConfig) { return enabledWebSearchSources(config.search).length > 0 || enabledWebSearchPlatforms(config.search).length > 0 }
export interface ServiceModel { id: string; platformId: string; name: string; officialId: string; enabled?: boolean; contextWindowTokens?: number; maxOutputTokens?: number | null; supportsVision?: boolean }
export interface ModelPlatform { id: string; name: string; protocol: ModelProtocol; apiAddress: string; model: string; configured?: boolean; enabled?: boolean; presetId?: string; presetCatalogVersion?: string; serviceModels?: ServiceModel[] }
export interface AideConfig {
  quickMode?: boolean;
  translationServices?: Partial<Record<TranslationProvider, { configured: boolean; enabled?: boolean }>>;
  platforms: ModelPlatform[]; activePlatform: string;
  search: WebSearchConfig;
  translation: { provider: TranslationProvider; sourceLanguage: string; targetLanguage: string; domain: TranslationDomain; configured?: boolean };
}
export type Secrets = Record<string, { key: string; secret?: string }>
export const defaultConfig: AideConfig = {
  platforms: [], activePlatform: '',
  search: { sources: defaultSearchSources, apiPlatforms: [] },
  translation: { provider: 'model', sourceLanguage: 'auto', targetLanguage: 'zh-CN', domain: 'general' },
}
export interface SearchSource { title: string; url: string; snippet: string }
export interface TranslationResult { sourceText: string; translatedText: string; sourceLanguage: string; targetLanguage: string; provider: string; modelName?: string }
export interface ToolRecord { id: string; name: string; status: 'running' | 'complete' | 'error'; receivedAt?: number; query?: string; sources?: SearchSource[]; translation?: TranslationResult; error?: string }
export type ContextSummaryStatus = 'started' | 'completed' | 'failed'
export interface ContextCheckpoint { version: 1; content: string; coveredMessageId: string; sourceDigest: string; messageCount: number }
export interface VisionImage { mimeType: string; dataBase64: string }
export interface ImageAttachment extends VisionImage { id: string; name: string; size: number }
export interface ChatMessage { id: string; role: 'user' | 'assistant'; text: string; requestTitle?: boolean; images?: ImageAttachment[]; reasoning?: string; continuationSummary?: string; contextSummaryEvents?: ContextSummaryStatus[]; tools?: ToolRecord[]; error?: string; translation?: TranslationResult; mention?: string; label?: string; createdAt?: number; completedAt?: number; action?: 'translate' | 'explain'; answerStartedAt?: number; cancelled?: boolean }
export interface Conversation { id: string; title: string; updated: number; messages: ChatMessage[]; contextSummary?: ContextCheckpoint }
export type ContextMessage = Pick<ChatMessage, 'role' | 'text' | 'continuationSummary' | 'images' | 'requestTitle'> & { id?: string }
export type AideRequest = ({ kind: 'chat'; messages: ContextMessage[]; language: string; contextSummary?: ContextCheckpoint } | { kind: 'translate'; text: string; sourceLanguage: string; targetLanguage: string; generateTitle?: boolean }) & { pageContextId?: string }
export type AideEvent = { type: 'conversation_title'; title: string } | { type: 'text' | 'reasoning'; text: string } | { type: 'continuation_summary'; content: string } | { type: 'context_summary'; status: ContextSummaryStatus; checkpoint?: ContextCheckpoint } | { type: 'tool'; tool: ToolRecord } | { type: 'translation'; result: TranslationResult } | { type: 'done' } | { type: 'error'; error: string }
export function endpoint(address: string, path: string) {
  const url = new URL(address.trim())
  if (url.username || url.password || url.hash || url.search || !(url.protocol === 'https:' || url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))) throw new Error('aide.invalidEndpoint')
  const base = url.href.replace(/\/$/, '')
  return /\/(chat\/completions|responses|messages|models)$/.test(base) ? base.replace(/\/(chat\/completions|responses|messages|models)$/, `/${path}`) : `${base}/${path}`
}
export function activeModel(config: AideConfig) { return config.platforms.find(p => p.id === config.activePlatform && p.enabled !== false) }
export const domainOptions: Record<TranslationProvider, TranslationDomain[]> = {
  model: ['general'], google: ['general'], deepl: ['general'], volcengine: ['general', 'finance', 'biomedicine', 'web_literature'],
  youdao: ['general', 'information_technology', 'finance', 'biomedicine', 'game'],
  baidu: ['general', 'information_technology', 'finance', 'manufacturing', 'biomedicine', 'web_literature'],
}
export const searchEndpoints: Record<WebSearchApiProtocol, string> = {
  tavily: 'https://api.tavily.com/search', exa: 'https://api.exa.ai/search', brave: 'https://api.search.brave.com/res/v1/web/search', serpapi: 'https://serpapi.com/search.json', bocha: 'https://api.bochaai.com/v1/web-search', zhipu: 'https://open.bigmodel.cn/api/paas/v4/web_search', 'aliyun-iqs': 'https://cloud-iqs.aliyuncs.com/search/unified', 'baidu-qianfan': 'https://qianfan.baidubce.com/v2/ai_search/web_search',
}

/** Convert the previous single-engine config without discarding its saved credentials. */
export function normalizeSearch(saved: any): WebSearchConfig {
  if (saved?.search?.sources) return {
    sources: Object.fromEntries(webSearchSourceIds.map(id => [id, saved.search.sources[id] ?? defaultSearchSources[id]])) as WebSearchConfig['sources'],
    apiPlatforms: Array.isArray(saved.search.apiPlatforms) ? saved.search.apiPlatforms : [],
  }
  if (!saved?.search?.provider) return { sources: { ...defaultSearchSources }, apiPlatforms: [] }
  const provider = saved.search.provider === 'aliyun' ? 'aliyun-iqs' : saved.search.provider === 'qianfan' ? 'baidu-qianfan' : saved.search.provider
  const sources = Object.fromEntries(webSearchSourceIds.map(id => [id, id === provider && saved.webSearch !== false])) as WebSearchConfig['sources']
  return { sources, apiPlatforms: (webSearchApiProtocols as readonly string[]).includes(provider) ? [{ providerId: saved.search.provider, name: provider, protocol: provider, apiAddress: saved.search.apiAddress || searchEndpoints[provider as WebSearchApiProtocol], enabled: saved.webSearch !== false }] : [] }
}
