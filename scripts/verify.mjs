// Read-only HTTP smoke check. Run against a production server for release validation.
import assert from 'node:assert/strict'
const origin=process.env.VERIFY_ORIGIN || 'http://127.0.0.1:3100'
const fetchText=async path=>{const response=await fetch(new URL(path,origin),{redirect:'manual'});assert.equal(response.status,200,`${path}: HTTP ${response.status}`);return response.text()}
const sitemap=await fetchText('/sitemap.xml')
const paths=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match=>new URL(match[1]).pathname)
assert.ok(paths.includes('/')&&paths.includes('/zh-CN/oria-theme/editor'))
const assets=new Set(),links=new Set()
for(const path of paths){
 const html=await fetchText(path)
 assert.match(html,/<h1[\s>]/,`${path}: missing heading`)
 if(/\/oria-(theme|tab|tunnel)/.test(path)){
  assert.ok(!html.includes('class="oria-header"'),`${path}: duplicated global header`)
  assert.ok(html.includes('Oria collection')||html.includes('Oria 系列'),`${path}: missing related products`)
 }
 if(/\/oria-tab/.test(path))assert.ok(html.includes('/products/oria-tab/assets/logo.svg'),`${path}: header must use transparent logo`)
 assert.match(html,/<link rel="canonical" href="https:\/\/oriamade.com/,`${path}: missing canonical`)
 const canonical=html.match(/<link rel="canonical" href="([^"]+)"/)?.[1]
 assert.equal(new URL(canonical).pathname,path,`${path}: wrong canonical`)
 assert.ok(html.includes('hrefLang="en"')&&html.includes('hrefLang="zh-CN"'),`${path}: missing hreflang`)
 assert.ok(!html.includes('/assets/products/'),`${path}: duplicated asset prefix`)
 for(const match of html.matchAll(/(?:src|href)="(\/[^"<>]*)"/g)){
  const href=match[1].replaceAll('&amp;','&');
  if(href.startsWith('/_next/')||href.startsWith('/products/'))assets.add(href)
  else links.add(href.split('#')[0].split('?')[0]||path)
 }
}
for(const path of links)if(!paths.includes(path))await fetchText(path)
for(const path of assets){const response=await fetch(new URL(path,origin));assert.equal(response.status,200,`${path}: missing asset`)}
for(const path of ['/not-a-page','/zh-CN/not-a-page','/oria-theme/docs/not-a-page']){
 const response=await fetch(new URL(path,origin));assert.equal(response.status,404,`${path}: expected 404`)
}
await fetchText('/robots.txt')
console.log(`Verified ${paths.length} sitemap pages, ${links.size} internal link targets, ${assets.size} assets, metadata and 404s at ${origin}`)
