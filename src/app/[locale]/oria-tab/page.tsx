
import {localize} from '@/i18n/localize'
import Link from 'next/link'
import {notFound} from 'next/navigation'
import {isLocale,localizedPath} from '@/i18n/config'
import {pageMetadata} from '@/lib/seo'
import {content} from '@/features/oria-tab/website/content.mjs'
import {TabStory} from '@/features/oria-tab/story-client'
export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return isLocale(locale)?pageMetadata(locale,'/oria-tab','OriaTab',content[locale].scenes[0][2]):{}}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();const c=content[locale];return <main><h1 className="sr-only">OriaTab — {c.scenes[0][1]}</h1><TabStory key={locale} locale={locale}/><section className="oria-tab-reading"><details><summary>{localize(locale, 'Read the OriaTab story', '阅读 OriaTab 的完整介绍')}</summary>{c.scenes.map((scene:string[]) => <section key={scene[0]}><h2>{scene[1]}</h2><p>{scene[2]}</p></section>)}</details><div className="oria-tab-links"><Link href={localizedPath(locale,'/oria-tab/changelog')}>{c.nav[2]}</Link><Link href={localizedPath(locale,'/oria-tab/privacy')}>{c.nav[6]}</Link></div></section></main>}
