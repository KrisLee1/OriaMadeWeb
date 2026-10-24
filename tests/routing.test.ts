import test from 'node:test'
import assert from 'node:assert/strict'
import {NextRequest} from 'next/server'
import {proxy} from '../src/proxy'
import {localizedPath,stripLocale} from '../src/i18n/config'
import {acts,rest,actAt,captions} from '../src/features/oria-tab/website/story/acts'

test('English public URLs rewrite once, preserving query parameters',()=>{
 const first=proxy(new NextRequest('https://oriamade.com/oria-theme/docs/getting-started?from=home'))
 assert.equal(first.headers.get('x-middleware-rewrite'),'https://oriamade.com/en/oria-theme/docs/getting-started?from=home')
 const second=proxy(new NextRequest(first.headers.get('x-middleware-rewrite')!))
 assert.equal(second.headers.get('x-middleware-rewrite'),null)
 assert.equal(second.headers.get('location'),null)
 assert.equal(second.headers.get('x-middleware-next'),'1')
})
test('Chinese pages keep their public URL',()=>{
 const response=proxy(new NextRequest('https://oriamade.com/zh-CN/oria-tab'))
 assert.equal(response.headers.get('x-middleware-rewrite'),null)
 assert.equal(response.headers.get('x-middleware-next'),'1')
})
test('Language changes preserve deep links and do not duplicate locale prefixes',()=>{
 for(const path of ['/','/oria-theme/editor','/oria-theme/docs/use/editor','/oria-tab/privacy']){
  assert.equal(localizedPath('en',stripLocale(localizedPath('zh-CN',path))),path)
 }
 assert.equal(stripLocale('/english'),'/english')
 assert.equal(localizedPath('en',stripLocale('/en/oria-tab')),'/oria-tab')
})
test('Each story chapter lands in its own fully readable caption interval',()=>{
 assert.equal(new Set(acts).size,9)
 rest.forEach((time,index)=>{
  assert.equal(actAt(time),index)
  assert.ok(time>=captions[index][1] && time<=captions[index][2])
 })
})
