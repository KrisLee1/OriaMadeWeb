import {notFound} from 'next/navigation'
import {ArrowUpRight, Fingerprint, HardDrive, Network, ShieldCheck} from 'lucide-react'
import {isLocale} from '@/i18n/config'
import {localize} from '@/i18n/localize'
import {pageMetadata} from '@/lib/seo'
import {content} from '@/features/oria-tab/website/content.mjs'
import {policySections} from '@/features/oria-tab/website/privacy-base.mjs'
import {policies} from '@/features/oria-tab/website/privacy-translations.mjs'
import {websitePrivacy, websiteContact} from '@/features/oria-tab/privacy-copy'
import {site} from '@/features/oria-tab/website/site-config.mjs'
import {TabSubpageHeader, TabSubpageEnd} from '@/features/oria-tab/subpage'

export async function generateMetadata({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params
  return isLocale(locale) ? pageMetadata(locale, '/oria-tab/privacy', content[locale].nav[6], localize(locale, 'How OriaTab handles your data.', '了解 OriaTab 如何处理数据。')) : {}
}
export default async function Page({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params
  if (!isLocale(locale)) notFound()
  const c = content[locale]
  const translatedIds = ['scope', 'data', 'services', 'web-resources', 'permissions', 'control', 'limited-use', 'website', 'glass']
  const sections: string[][] = locale === 'en' || locale === 'zh-CN' ? policySections[locale === 'en' ? 'en' : 'zh'] : policies[locale].map(([title, body]: string[], index: number) => [translatedIds[index], title, '<p>' + body + '</p>'])
  return <main className="tab-subpage tab-privacy-page">
    <TabSubpageHeader locale={locale} eyebrow={c.nav[6]} title={c.privacy[0]} description={c.privacy[1]}/>
    <div className="tab-policy-overview">{[[HardDrive, c.scenes[6][0], c.stage[7]], [Network, c.stage[8], c.stage[9]], [Fingerprint, c.scenes[6][3], 'OriaTab']].map(([Icon, title, note], index) => {const ItemIcon = Icon as typeof HardDrive; return <div key={index}><ItemIcon size={22}/><h2>{title as string}</h2><p>{note as string}</p></div>})}</div>
    <div className="tab-subpage-layout tab-policy-layout">
      <aside className="tab-subpage-sidebar"><nav aria-label={c.nav[6]}><p className="tab-eyebrow">{c.nav[6]}</p>{sections.map(([id, title], index) => <a href={`#${id}`} key={id}><span className="tab-toc-number">{String(index + 1).padStart(2, '0')}</span><span>{title}</span></a>)}</nav><p className="tab-sidebar-note">OriaTab v{site.version}<br/>Chrome / Edge</p></aside>
      <div className="tab-policy-content">{sections.map(([id, title, body], index) => <section className="tab-policy-section" id={id} key={id}><header><span>{String(index + 1).padStart(2, '0')}</span><h2>{title}</h2></header>
        {id === 'website' ? <><p>{websitePrivacy[locale]}</p><a className="tab-text-link" href="https://www.cloudflare.com/privacypolicy/">Cloudflare · {c.nav[6]}<ArrowUpRight size={13}/></a>{locale !== 'en' && locale !== 'zh-CN' && <p className="tab-policy-contact">{websiteContact[locale]}<br/><a href={site.releaseRepository + '/issues'}>{c.footer[2]} · GitHub<ArrowUpRight size={13}/></a></p>}</> : <div dangerouslySetInnerHTML={{__html: body.replaceAll('www.oriatab.cn', 'oriamade.com/oria-tab').replaceAll('https://github.com/KrisLee1/OriaTab/issues', site.releaseRepository + '/issues')}}/>}
      </section>)}<div className="tab-policy-support"><ShieldCheck size={24}/><div><h2>{c.footer[2]}</h2><a className="tab-text-link" href={site.releaseRepository + '/issues'}>GitHub · OriaTab<ArrowUpRight size={14}/></a></div></div></div>
    </div>
    <TabSubpageEnd locale={locale} privacy/>
  </main>
}
