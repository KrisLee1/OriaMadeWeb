
import {localize} from '@/i18n/localize'
import Link from 'next/link'
import {notFound} from 'next/navigation'
import {isLocale,localizedPath} from '@/i18n/config'
import {pageMetadata} from '@/lib/seo'
import {content} from '@/features/oria-tab/website/content.mjs'
import {site} from '@/features/oria-tab/website/site-config.mjs'
export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return isLocale(locale)?pageMetadata(locale,'/oria-tab/changelog',content[locale].nav[2],content[locale].journal[1]):{}}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();const c=content[locale];return <main className="oria-article"><Link href={localizedPath(locale,'/oria-tab')}>← OriaTab</Link><p className="oria-eyebrow">{c.journal[4]}</p><h1>{c.journal[0]}</h1><p>{c.journal[1]}</p><section><h2>{site.version} · {c.journal[6]}</h2><time>{site.releaseDate}</time>{c.journalUpdate.map((text:string)=><p key={text}>{text}</p>)}</section>{site.previousReleases.map((release:{version:string;date:string},i:number)=><section key={release.version}><h2>{release.version}</h2><time>{release.date}</time><p>{c.journalPreviousUpdates[i]}</p></section>)}<section><h2>{site.initialRelease.version} · {c.journal[2]}</h2><time>{site.initialRelease.date}</time><p>{c.journal[3]}</p>{c.journalFeatures.map(([title,body]:string[])=><section key={title}><h3>{title}</h3><p>{body}</p></section>)}</section><a href={site.releaseRepository+'/releases'}>{c.download[9]} ↗</a></main>}
