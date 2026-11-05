import test from 'node:test'
import assert from 'node:assert/strict'
import {runInNewContext} from 'node:vm'
import {languageBootstrap, LANGUAGE_STORAGE_KEY} from '../src/i18n/preference'
import {locales} from '../src/i18n/config'

function visit({path='/', saved=null, languages=['en-US'], blocked=false}: {
 path?: string; saved?: string | null; languages?: string[]; blocked?: boolean
} = {}) {
 const url = new URL(path, 'https://oriamade.com')
 let redirected: string | undefined
 runInNewContext(languageBootstrap, {
  location: {pathname:url.pathname, search:url.search, hash:url.hash, replace:(value:string)=>{redirected=value}},
  navigator: {languages, language:languages[0]},
  localStorage: {getItem:(key:string)=>{assert.equal(key, LANGUAGE_STORAGE_KEY); if(blocked)throw new Error('Blocked');return saved}},
 })
 return redirected
}

test('Saved language wins over browser language on every unprefixed entry',()=>{
 for(const saved of locales){
  assert.equal(visit({path:'/oria-theme/docs/api/core?from=home#tokens', saved, languages:['ja-JP']}),
   saved==='en'?undefined:`/${saved}/oria-theme/docs/api/core?from=home#tokens`)
 }
})

test('First visit matches ordered browser languages, regions and Chinese scripts',()=>{
 const cases: [string[], string | undefined][] = [
  [['zh-CN'], '/zh-CN'], [['zh-Hans-SG'], '/zh-CN'], [['zh-Hant'], '/zh-TW'],
  [['zh-HK'], '/zh-TW'], [['zh-MO'], '/zh-TW'], [['zh-Hans-TW'], '/zh-CN'],
  [['es-ES','ja-JP','en-US'], '/ja'], [['en-GB','zh-CN'], undefined],
  [['de-AT'], '/de'], [['fr-CA'], '/fr'], [['ko-KR'], '/ko'], [['ru-RU'], '/ru'],
  [['es-ES'], undefined], [[], undefined],
 ]
 for(const [languages, destination] of cases)assert.equal(visit({languages}), destination)
})

test('Explicit language links keep their language despite saved or browser preferences',()=>{
 for(const locale of locales){
  assert.equal(visit({path:`/${locale}/oria-tab/privacy?from=link#policy`,saved:'ja',languages:['zh-CN']}),undefined)
 }
})

test('Unavailable or invalid storage falls back safely without redirect loops',()=>{
 assert.equal(visit({blocked:true,languages:['zh-TW']}),'/zh-TW')
 assert.equal(visit({saved:'invalid',languages:['fr-FR']}),'/fr')
 const first=visit({path:'/oria-tab?from=home#workspace',languages:['zh-CN']})!
 assert.equal(first,'/zh-CN/oria-tab?from=home#workspace')
 assert.equal(visit({path:first,languages:['zh-CN']}),undefined)
})
