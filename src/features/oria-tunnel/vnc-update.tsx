import {ArrowUpRight, Clipboard, Terminal} from 'lucide-react'
import type {Locale} from '@/i18n/config'
import {VncDesktopDemo} from './vnc-desktop-demo'
import {downloadCopy} from './download-copy'
import {tunnelRelease} from './release'
import {vncUpdateCopy, vncVersion} from './vnc-update-copy'

const icons = [Clipboard, Terminal]

export function TunnelVncUpdate({locale}: {locale: Locale}) {
  const copy = vncUpdateCopy[locale]
  return (
    <section id="vnc" className="tunnel-section tunnel-vnc-update">
      <header className="tunnel-section-heading">
        <p className="tunnel-eyebrow">{vncVersion} · {copy.status}</p>
        <h2 id="release-notes">{copy.title}</h2>
        <p>{copy.intro}</p>
      </header>
      <VncDesktopDemo locale={locale} copy={copy.demo}/>
      <div className="file-update-details">
        {copy.details.map(({title, description}, index) => {
          const Icon = icons[index]
          return (
            <article key={title}>
              <Icon size={20} aria-hidden="true"/>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          )
        })}
      </div>
      <div className="file-update-availability">
        <a href={tunnelRelease.releaseUrl}>{downloadCopy[locale].releaseNotes} · GitHub <ArrowUpRight size={14} aria-hidden="true"/></a>
      </div>
    </section>
  )
}
