import {ArrowDown,ArrowUpRight,CodeXml,Fingerprint,KeyRound,Network,ShieldCheck,Terminal,Waypoints} from 'lucide-react'
import {tunnelContent,type TunnelLocale} from './content'
import {WorkspaceDemo,type DemoView} from './demo'
import {TunnelDownloadButton} from './download-button'
import {downloadCopy} from './download-copy'
import {localizedPath} from '@/i18n/config'
const scenes:DemoView[]=['hosts','forwards','services','logs']
const capabilityIcons=[Network,Waypoints,Terminal,CodeXml]
const trustIcons=[Fingerprint,KeyRound,ShieldCheck]
export function TunnelPage({locale}:{locale:TunnelLocale}){
 const c=tunnelContent[locale]
 return <main className="tunnel-main">
  <section className="tunnel-hero">
   <div className="tunnel-hero-haze" aria-hidden="true"/>
   <div className="tunnel-hero-copy"><p className="tunnel-eyebrow"><span/>OriaTunnel <i/> {c.hero.eyebrow.split('·').slice(1).join('·').trim()}</p>
    <h1><span>{c.hero.line1}</span><span>{c.hero.line2}</span></h1>
    <p className="tunnel-hero-description">{c.hero.description}</p>
    <div className="tunnel-hero-actions"><TunnelDownloadButton locale={locale}/><a className="tunnel-button tunnel-button-quiet" href="#workspace">{c.hero.primary}<ArrowDown size={16}/></a></div>
    <a className="tunnel-all-downloads" href={localizedPath(locale,'/oria-tunnel/download')}>{downloadCopy[locale].allDownloads}<ArrowUpRight size={13}/></a>
   </div>
   <div id="workspace" className="tunnel-hero-workspace"><div className="tunnel-demo-meta"><span><i/>{c.hero.demo}</span><span>macOS · Windows</span></div><WorkspaceDemo locale={locale}/><p className="tunnel-demo-disclosure">{c.cta.note}</p></div>
  </section>
  <section id="workflow" className="tunnel-section tunnel-workflow">
   <header className="tunnel-section-heading"><p className="tunnel-eyebrow">{c.story.eyebrow}</p><h2>{c.story.title}</h2><p>{c.story.description}</p></header>
   <div className="tunnel-feature-grid">{c.story.chapters.map((chapter,index)=><article className="tunnel-feature" key={chapter.number}><div className="tunnel-feature-copy"><p className="tunnel-eyebrow"><span>{chapter.number}</span>{chapter.kicker}</p><h3>{chapter.title}</h3><p>{chapter.description}</p></div><div className="tunnel-feature-window"><WorkspaceDemo locale={locale} initialView={scenes[index]} compact/></div><p className="tunnel-feature-note">{chapter.note}</p></article>)}</div>
  </section>
  <section id="capabilities" className="tunnel-section tunnel-capabilities"><header className="tunnel-section-heading"><p className="tunnel-eyebrow">{c.capabilities.eyebrow}</p><h2>{c.capabilities.title}</h2><p>{c.capabilities.description}</p></header><div className="tunnel-detail-grid">{c.capabilities.cards.map((card,index)=>{const Icon=capabilityIcons[index];return <article key={card.kicker}><span className="tunnel-detail-icon"><Icon size={22}/></span><p className="tunnel-eyebrow">{card.kicker}</p><h3>{card.title}</h3><p>{card.description}</p></article>})}</div></section>
  <section id="principles" className="tunnel-section tunnel-principles"><header className="tunnel-section-heading"><p className="tunnel-eyebrow">{c.principles.eyebrow}</p><h2>{c.principles.title}</h2><p>{c.principles.description}</p></header><div className="tunnel-trust-grid">{c.principles.points.map((point,index)=>{const Icon=trustIcons[index];return <article key={point.title}><Icon size={24}/><h3>{point.title}</h3><p>{point.description}</p></article>})}</div><div className="tunnel-direct"><span><ShieldCheck size={16}/>{c.principles.local}</span><i/><span>{c.principles.direct}</span><i/><span><Network size={16}/>SSH</span><small>{c.principles.cloud}</small></div></section>
  <section className="tunnel-final-cta"><img src="/products/oria-tunnel/logo.svg" width={64} height={64} alt=""/><p className="tunnel-eyebrow">{c.cta.eyebrow}</p><h2>{c.cta.title}</h2><p>{downloadCopy[locale].intro}</p><TunnelDownloadButton locale={locale}/><a className="tunnel-all-downloads" href={localizedPath(locale,'/oria-tunnel/download')}>{downloadCopy[locale].allDownloads}<ArrowUpRight size={13}/></a></section>
 </main>
}
