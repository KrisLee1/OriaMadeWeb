type BrowserNavigator = { userAgent?: string; userAgentData?: { brands?: readonly { brand: string; version: string }[] } }

// Edge exposes the same chrome.* extension APIs, but owns different internal URLs.
// Navigator is also available in the extension service worker.
export function browserInternalUrl(page: 'searchSettings' | 'extensionShortcuts', browser: BrowserNavigator = typeof navigator === 'undefined' ? {} : navigator) {
  const edge = browser.userAgentData?.brands?.some(item => item.brand === 'Microsoft Edge') || /\bEdg\//.test(browser.userAgent || '')
  return `${edge ? 'edge' : 'chrome'}://${page === 'searchSettings' ? 'settings/search' : 'extensions/shortcuts'}`
}

export function isBrowserNewTab(url: string | undefined) {
  return /^(?:chrome|edge):\/\/newtab\/?$/.test(url || '')
}
