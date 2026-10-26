import Link from 'next/link'
import {notFound} from 'next/navigation'
import {ArrowDown, ArrowUpRight, Check, Languages, LayoutGrid, MessageCircle, Palette, Search, Sparkles} from 'lucide-react'
import {isLocale, localizedPath} from '@/i18n/config'
import {pageMetadata} from '@/lib/seo'
import {content} from '@/features/oria-tab/website/content.mjs'
import {site} from '@/features/oria-tab/website/site-config.mjs'
import {TabSubpageHeader, TabSubpageEnd, releaseDate} from '@/features/oria-tab/subpage'

export async function generateMetadata({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params
  return isLocale(locale) ? pageMetadata(locale, '/oria-tab/changelog', content[locale].nav[2], content[locale].journal[1]) : {}
}
export default async function Page({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params
  if (!isLocale(locale)) notFound()
  const c = content[locale], icons = [Search, LayoutGrid, MessageCircle, Sparkles, Palette]
  const releases = [{version: site.version, date: site.releaseDate}, ...site.previousReleases, site.initialRelease]
  return <main className="tab-subpage tab-journal-page">
    <TabSubpageHeader locale={locale} eyebrow={c.journal[4]} title={c.journal[0]} description={c.journal[1]}/>
    <div className="tab-subpage-layout">
      <aside className="tab-subpage-sidebar"><nav aria-label={c.journal[4]}><p className="tab-eyebrow">{c.journal[4]}</p>{releases.map(release => <a key={release.version} href={`#v${release.version}`}><span>v{release.version}</span><time dateTime={release.date}>{release.date}</time></a>)}</nav><Link className="tab-button tab-button-primary" href={localizedPath(locale, '/oria-tab') + '#get'}>{c.nav[4]}<ArrowDown size={14}/></Link><p className="tab-sidebar-note">{c.journal[8]}</p></aside>
      <div className="tab-release-timeline">
        <article id={`v${site.version}`} className="tab-release-entry tab-release-latest">
          <header className="tab-release-header"><div><p className="tab-eyebrow"><span className="tab-release-dot"/>{c.journal[6]}</p><h2>v{site.version}</h2></div><time dateTime={site.releaseDate}>{releaseDate(locale, site.releaseDate)}</time></header>
          <div className="tab-release-body"><div className="tab-release-change"><Sparkles size={20}/><div>{c.journalUpdate.map((text: string) => <p key={text}>{text}</p>)}</div></div>
            <div className="tab-release-wallpapers" aria-hidden="true">{['dawn', 'aurora', 'bloom'].map(wall => <img key={wall} src={`/products/oria-tab/assets/wallpapers/${wall}.svg`} alt=""/>)}</div>
            <div className="tab-release-tags"><span><Palette size={13}/>{c.settings[2]}</span><span><Languages size={13}/>{c.stage[5]}</span></div>
          </div>
        </article>
        {site.previousReleases.map((release: {version: string; date: string}, index: number) => <article id={`v${release.version}`} className="tab-release-entry" key={release.version}>
          <header className="tab-release-header"><h2>v{release.version}</h2><time dateTime={release.date}>{releaseDate(locale, release.date)}</time></header><div className="tab-release-body"><p className="tab-release-small-change"><Check size={17}/>{c.journalPreviousUpdates[index]}</p></div>
        </article>)}
        <article id={`v${site.initialRelease.version}`} className="tab-release-entry">
          <header className="tab-release-header"><div><p className="tab-eyebrow">{c.journal[2]}</p><h2>v{site.initialRelease.version}</h2></div><time dateTime={site.initialRelease.date}>{releaseDate(locale, site.initialRelease.date)}</time></header>
          <div className="tab-release-body"><p className="tab-release-intro">{c.journal[3]}</p><h3 className="tab-release-features-title">{c.journal[7]}</h3><div className="tab-release-features">{c.journalFeatures.map(([title, body]: string[], index: number) => {const Icon = icons[index]; return <section key={title}><Icon size={19}/><div><h4>{title}</h4><p>{body}</p></div></section>})}</div></div>
        </article>
        <a className="tab-text-link tab-release-all" href={site.releaseRepository + '/releases'}>{c.download[9]}<ArrowUpRight size={14}/></a>
      </div>
    </div>
    <TabSubpageEnd locale={locale}/>
  </main>
}
