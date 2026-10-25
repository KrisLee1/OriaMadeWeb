import Link from 'next/link'
import {notFound} from 'next/navigation'
import {isLocale,localizedPath} from '@/i18n/config'
import {localize} from '@/i18n/localize'
import {pageMetadata} from '@/lib/seo'
import {content} from '@/features/oria-tab/website/content.mjs'
import {policySections} from '@/features/oria-tab/website/privacy-base.mjs'
import {policies} from '@/features/oria-tab/website/privacy-translations.mjs'
const websiteEn='This site stores theme, appearance and language preferences in browser localStorage. Clear site data to remove them. It does not read extension data, run analytics or advertising trackers, or call AI, search or browser extension services in demonstrations. Hosting and infrastructure data handling details will be added when the site is deployed.'
const websiteZh='本站在浏览器 localStorage 中保存所选主题、外观模式和语言偏好，可通过清除本站数据删除。本站不读取扩展数据，不运行分析或广告追踪脚本，不在官网演示中调用 AI、搜索或浏览器扩展服务。正式托管与基础设施的数据处理说明将在部署时补充。'
export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return isLocale(locale)?pageMetadata(locale,'/oria-tab/privacy',content[locale].nav[6],localize(locale,'How OriaTab handles your data.','了解 OriaTab 如何处理数据。')):{}}
export default async function Page({params}:{params:Promise<{locale:string}>}) {
 const {locale}=await params;if(!isLocale(locale))notFound()
 const sections=locale==='en'||locale==='zh-CN'?policySections[locale==='en'?'en':'zh']:policies[locale].map(([title,body]:string[],i:number)=>[i===7?'website':'policy-'+i,title,'<p>'+body+'</p>'])
 const website=localize(locale,websiteEn,websiteZh)
 return <main className="oria-article"><Link href={localizedPath(locale,'/oria-tab')}>← OriaTab</Link><h1>{content[locale].nav[6]}</h1>{sections.map(([id,title,body]:string[])=><section id={id} key={id}><h2>{title}</h2>{id==='website'?<p>{website}</p>:<div dangerouslySetInnerHTML={{__html:body.replaceAll('www.oriatab.cn','oriamade.com/oria-tab').replaceAll('https://github.com/KrisLee1/OriaTab/issues','https://github.com/KrisLee1/OriaTab-Releases/issues')}}/>}</section>)}</main>
}
