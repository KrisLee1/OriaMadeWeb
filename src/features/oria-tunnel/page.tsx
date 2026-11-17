import {ArrowUpRight} from 'lucide-react'
import Link from 'next/link'
import {CardArt} from './card-art'
import {tunnelRelease} from './release'
import {Reveal} from '@/components/ui/reveal'
import {localizedPath} from '@/i18n/config'
import {tunnelContent, type TunnelLocale} from './content'
import {WorkspaceTour} from './workspace-tour'
import {TunnelDownloadButton} from './download-button'
import {downloadCopy} from './download-copy'
import {TunnelFileUpdate} from './file-update'
import {TunnelTerminalUpdate} from './terminal-update'
import {terminalUpdateCopy, terminalVersion} from './terminal-update-copy'
import {TunnelVncUpdate} from './vnc-update'

const trustScenes = ['trust', 'credentials', 'export']

export function TunnelPage({locale}: {locale: TunnelLocale}) {
  const c = tunnelContent[locale]
  const downloads = localizedPath(locale, '/oria-tunnel/download')
  return <main className="tunnel-main tunnel-product-page">
    <section id="workspace" tabIndex={-1} className="tunnel-spotlight" aria-labelledby="workspace-title">
    <header className="tunnel-product-intro">
      <Reveal immediate className="tunnel-intro-title">
        <a className="tunnel-preview-link" href={tunnelRelease.releaseUrl}>{terminalVersion} · {terminalUpdateCopy[locale].status}<ArrowUpRight size={13}/></a>
        <h1 id="workspace-title">{c.hero.title.replace('\n','')}</h1>
      </Reveal>
      <div className="tunnel-intro-actions">
        <p>{c.metadata}</p>
        <div className="tunnel-intro-links">
          <TunnelDownloadButton locale={locale}/>
          <Link className="tunnel-text-link" href={downloads}>{downloadCopy[locale].allDownloads}<ArrowUpRight size={15}/></Link>
        </div>
      </div>
    </header>

    <Reveal><WorkspaceTour locale={locale}/></Reveal>
    </section>
    <TunnelTerminalUpdate locale={locale}/>
    <TunnelFileUpdate locale={locale}/>
    <TunnelVncUpdate locale={locale}/>

    <Reveal as="section" className="tunnel-section tunnel-security" aria-labelledby="security-title">
      <header className="tunnel-section-heading">
        <h2 id="security-title">{c.principles.eyebrow}</h2><p>{c.principles.description}</p>
      </header>
      <div className="tunnel-trust-grid">{c.principles.points.map((point, index) => {
        const scene = trustScenes[index]
        return <article className="tunnel-card" key={point.title}><CardArt scene={scene}/><div className="tunnel-card-copy"><h3>{point.title}</h3><p>{point.description}</p></div></article>
      })}</div>
    </Reveal>
  </main>
}
