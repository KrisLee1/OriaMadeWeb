import Link from 'next/link'
import {ArrowLeft, ArrowUpRight} from 'lucide-react'
import {localizedPath, type Locale} from '@/i18n/config'
import {content} from './website/content.mjs'

export function TabSubpageHeader({locale, eyebrow, title, description}: {locale: Locale; eyebrow: string; title: string; description: string}) {
  return <header className="tab-subpage-hero"><Link className="tab-back-link" href={localizedPath(locale, '/oria-tab')}><ArrowLeft size={14}/>OriaTab</Link><p className="tab-eyebrow">OriaTab <span/> {eyebrow}</p><h1>{title.split('\n').map(line => <span key={line}>{line}</span>)}</h1><p>{description}</p></header>
}
export function TabSubpageEnd({locale, privacy = false}: {locale: Locale; privacy?: boolean}) {
  const c = content[locale]
  return <div className="tab-subpage-end"><Link href={localizedPath(locale, '/oria-tab')}><ArrowLeft size={14}/>{c.nav[7]}</Link><Link href={localizedPath(locale, privacy ? '/oria-tab/changelog' : '/oria-tab/privacy')}>{privacy ? c.nav[2] : c.nav[6]}<ArrowUpRight size={14}/></Link></div>
}
export function releaseDate(locale: Locale, date: string) {
  return new Intl.DateTimeFormat(locale, {year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'}).format(new Date(date + 'T12:00:00Z'))
}
