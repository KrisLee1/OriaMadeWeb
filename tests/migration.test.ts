import {activeDemoCount,demoConnectionVisual,scenarioStatuses,demoScenarios} from '../src/features/oria-tunnel/simulation'
import {getDemoCopy} from '../src/features/oria-tunnel/demo-copy'
import {detectDownloadPlatform,installers,installerAsset,tunnelRelease} from '../src/features/oria-tunnel/release'
import {downloadCopy} from '../src/features/oria-tunnel/download-copy'
import {pageMetadata,pageIdentity} from '../src/lib/seo'
import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {createElement} from 'react'
import {locales} from '../src/i18n/config'
import {localize} from '../src/i18n/localize'
import {getCopy} from '../src/features/oria-theme/lib/i18n'
import {themePath} from '../src/features/oria-theme/lib/paths'

const messages=(locale:string):Record<string,string>=>JSON.parse(readFileSync(new URL(`../src/i18n/messages/${locale}.json`,import.meta.url),'utf8'))
const placeholders=(value:string)=>[...value.matchAll(/\{\w+\}/g)].map(match=>match[0]).sort()

test('Static translations cover the same prose and retain every interpolation token',()=>{
 const keys=Object.keys(messages('ja')).sort()
 assert.ok(keys.length>1000)
 for(const locale of locales.filter(locale=>locale!=='en')){
  const dictionary=messages(locale)
  assert.deepEqual(Object.keys(dictionary).sort(),keys,locale)
  for(const [source,translated] of Object.entries(dictionary)){
   assert.ok(translated.trim(),`${locale}: ${source}`)
   assert.deepEqual(placeholders(translated),placeholders(source),`${locale}: ${source}`)
   assert.ok(!/ZXQ\d+QXZ/i.test(translated),`${locale}: untranslated protection token`)
  }
  assert.ok(!getCopy(locale).home.presets.body.includes('41'))
  assert.equal(themePath(locale),`/${locale}/oria-theme`)
 }
})

test('Localized presentation leaves code, links, class names and preference values intact',()=>{
 const element=createElement('a',{href:'/ja/oria-theme/docs',className:'st-body',id:'docs',children:'Read the docs'})
 const translated=localize('ja',element)
 assert.equal(translated.props.href,element.props.href)
 assert.equal(translated.props.className,element.props.className)
 assert.equal(translated.props.id,element.props.id)
 assert.notEqual(translated.props.children,element.props.children)
 const code=createElement('code',{children:'Read the docs'})
 assert.equal(localize('ja',code).props.children,code.props.children)
 assert.equal(localize('zh-CN','Theme','主题'),'主题')
})

test('Scoped migration CSS retains class names containing body and the document scroll root',()=>{
 const css=readFileSync(new URL('../src/features/oria-tab/migrated.css',import.meta.url),'utf8')
 const themeCss=readFileSync(new URL('../src/features/oria-theme/migrated.css',import.meta.url),'utf8')
 assert.ok(themeCss.includes('.oria-theme .home-section-body {'))
 assert.ok(css.includes('.popup-body >'))
 assert.ok(!css.includes('.st-.oria-tab-runtime'))
 assert.ok(!css.includes('.popup-.oria-tab-runtime'))
 assert.match(css,/html\.st-snapping:has\(\.oria-tab-runtime\)/)
})

test('Native demo covers every visual state without treating failures as live connections',()=>{
 for(const status of ['stopped','failed','authenticationError','configurationError','networkError','hostKeyError'] as const){
  assert.deepEqual(demoConnectionVisual(status,'#4399ff'),{state:'stopped',color:'var(--oria-color-muted-fg)'})
 }
 for(const status of ['connecting','authenticating','verifying-host','reconnecting'] as const){
  assert.deepEqual(demoConnectionVisual(status,'#4399ff'),{state:'connecting',color:'#4399ff'})
 }
 assert.deepEqual(demoConnectionVisual('listening','#4399ff'),{state:'connected',color:'#4399ff'})
 assert.equal(activeDemoCount(scenarioStatuses('mixed')),4)
 assert.equal(activeDemoCount(scenarioStatuses('failed')),0)
 assert.equal(activeDemoCount(scenarioStatuses('listening')),6)
})

test('Native UI translations retain every state and icon label in all eight locales',()=>{
 const keys=Object.keys(getDemoCopy('en')).sort()
 for(const locale of locales){
  const copy=getDemoCopy(locale)
  assert.deepEqual(Object.keys(copy).sort(),keys)
  for(const scenario of demoScenarios)if(scenario!=='mixed')assert.ok(copy[scenario].trim())
  assert.ok(copy.activeCount.includes('{{count}}'))
 }
})

// Browser hints may be absent or reduced; never guess a Mac CPU from “Intel Mac OS X”.
test('Download selection handles architecture hints, reduced user agents and mobile devices',()=>{
 assert.equal(detectDownloadPlatform({platform:'Windows',architecture:'arm',bitness:'64',userAgent:'Windows NT 10.0; Win64; x64'}).installer?.id,'windows-arm64')
 assert.equal(detectDownloadPlatform({platform:'Windows',architecture:'x86',bitness:'64'}).installer?.id,'windows-x64')
 assert.equal(detectDownloadPlatform({platform:'Win32',userAgent:'Windows NT 10.0; Win64; x64'}).installer?.id,'windows-x64')
 assert.equal(detectDownloadPlatform({platform:'macOS',architecture:'arm',bitness:'64'}).installer?.id,'mac-arm64')
 assert.equal(detectDownloadPlatform({platform:'macOS',architecture:'x86',bitness:'64'}).installer?.id,'mac-x64')
 assert.deepEqual(detectDownloadPlatform({platform:'MacIntel',userAgent:'Macintosh; Intel Mac OS X 10_15_7'}),{os:'macos',installer:null})
 assert.equal(detectDownloadPlatform({platform:'Windows',architecture:'x86',bitness:'32'}).installer,null)
 assert.deepEqual(detectDownloadPlatform({platform:'MacIntel',maxTouchPoints:5}),{os:null,installer:null})
 for(const info of [{platform:'Linux'},{platform:'Android',mobile:true},{userAgent:'iPhone'}])assert.equal(detectDownloadPlatform(info).installer,null)
})

test('All installer links point to the verified release and download copy covers eight languages',()=>{
 assert.equal(tunnelRelease.version,'v0.1.0')
 assert.equal(installers.length,4)
 for(const installer of installers){
  const asset=installerAsset(installer)
  assert.equal(asset.url,`https://github.com/KrisLee1/OriaTunnel/releases/download/v0.1.0/${installer.file}`)
  assert.ok(asset.size>8_000_000)
  assert.match(asset.sha256,/^[a-f0-9]{64}$/)
  assert.match(installer.file,/\.(dmg|exe)$/)
 }
 for(const locale of locales){
  assert.deepEqual(Object.keys(downloadCopy[locale]),Object.keys(downloadCopy.en))
  assert.ok(downloadCopy[locale].downloadFor.includes('{platform}'))
 }
})

test('Browser titles and favicons follow the product across locales and nested pages',()=>{
 for(const locale of locales){
  assert.deepEqual(pageMetadata(locale,'/','Oria','').title,{absolute:'Oria'})
  for(const [path,brand] of [['/oria-theme','OriaTheme'],['/oria-tab','OriaTab'],['/oria-tunnel','OriaTunnel']] as const){
   const home=pageMetadata(locale,path,brand,'')
   assert.deepEqual(home.title,{absolute:brand})
   assert.ok(JSON.stringify(home.icons).includes(pageIdentity(path).icon))
   const child=pageMetadata(locale,`${path}/details`,'Details','')
   assert.deepEqual(child.title,{absolute:`Details · ${brand}`})
   assert.deepEqual(child.icons,home.icons)
  }
  assert.deepEqual(pageMetadata(locale,'/oria-tunnel/download',downloadCopy[locale].download,'').title,{absolute:`${downloadCopy[locale].download} · OriaTunnel`})
 }
})
