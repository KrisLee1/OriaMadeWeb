import {Reveal} from '@/components/ui/reveal'
import {ArrowUpRight, Download, Laptop, Monitor} from 'lucide-react'
import {localizedPath, type Locale} from '@/i18n/config'
import {downloadCopy} from './download-copy'
import {CardArt} from './card-art'
import {TunnelDownloadButton} from './download-button'
import {fileSize, installerAsset, installers, tunnelRelease} from './release'
import {terminalUpdateCopy, terminalVersion} from './terminal-update-copy'

export function TunnelDownloadPage({locale}: {locale: Locale}) {
  const c = downloadCopy[locale]
  const terminal = terminalUpdateCopy[locale]
  const guideUrl = locale === 'zh-CN'
    ? 'https://github.com/KrisLee1/OriaTunnel#快速上手'
    : `https://github.com/KrisLee1/OriaTunnel/blob/master/docs/readme/README.${locale}.md`

  return <main className="tunnel-main tunnel-download-page">
    <Reveal as="header" immediate className="tunnel-download-heading">
      <div>
        <p className="tunnel-release-version">{tunnelRelease.version} · macOS / Windows</p>
        <h1>{c.title}</h1>
        <p className="tunnel-download-summary">{c.chooseNote}</p>
      </div>
      <TunnelDownloadButton locale={locale}/>
    </Reveal>
    <section id="platforms" tabIndex={-1} aria-labelledby="platforms-title">
      <h2 id="platforms-title">{c.choose}</h2>
      <div className="tunnel-platforms">{(['macos', 'windows'] as const).map(os => {
        const mac = os === 'macos'
        const Icon = mac ? Laptop : Monitor
        return <Reveal as="section" key={os} id={os} tabIndex={-1} className="tunnel-platform tunnel-card" aria-labelledby={os + '-title'}>
          <CardArt scene={os}/><div className="tunnel-card-copy">
          <header><Icon size={24} aria-hidden="true"/><h3 id={os + '-title'}>{mac ? 'macOS' : 'Windows'}</h3></header>
          <p className="tunnel-platform-note">{mac ? c.macNote : c.winNote}</p>
          <ul>{installers.filter(item => item.os === os).map(item => {
            const asset = installerAsset(item)
            return <li key={item.id}>
              <div className="tunnel-package-architecture">
                <img src={`/products/oria-tunnel/chips/${item.id}.svg`} width={64} height={64} alt=""/>
                <div><h4>{item.architecture}</h4><small>{mac ? 'DMG' : 'EXE'} · {fileSize(asset.size)}</small></div>
              </div>
              <a className="tunnel-button tunnel-button-primary tunnel-download-action" href={asset.url} aria-label={`${c.installer} · ${item.label}`}><Download size={15}/>{c.installer}</a>
            </li>
          })}</ul>
          <div className="tunnel-install-note"><h4>{c.installTitle}</h4><p>{mac ? c.macInstall : c.winInstall}</p></div>
        </div></Reveal>
      })}</div>
    </section>
    <Reveal as="section" id="release-notes" className="tunnel-download-resources" aria-labelledby="release-title">
      <h2 id="release-title">{c.releaseNotes}</h2>
      <div>
        <a className="tunnel-card" href={tunnelRelease.releaseUrl}>{tunnelRelease.version} · {c.releaseNotes}<ArrowUpRight size={15}/></a>
        <a className="tunnel-card" href="https://github.com/KrisLee1/OriaTunnel/releases">{c.previousReleases}<ArrowUpRight size={15}/></a>
        <a className="tunnel-card" href={guideUrl}>{c.guide}<ArrowUpRight size={15}/></a>
        <a className="tunnel-card" href={localizedPath(locale, '/oria-tunnel') + '#terminal'}>{terminalVersion} · {terminal.title}<ArrowUpRight size={15}/></a>
      </div>
    </Reveal>
  </main>
}
