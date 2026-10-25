import {ArrowUpRight,Download,Monitor,Network,Server,ShieldCheck,Terminal,Waypoints} from 'lucide-react'
import {localizedPath,type Locale} from '@/i18n/config'
import {tunnelContent} from './content'
import {downloadCopy} from './download-copy'
import {TunnelDownloadButton} from './download-button'
import {fileSize,installerAsset,installers,tunnelRelease} from './release'

export function TunnelDownloadPage({locale}:{locale:Locale}) {
 const c=downloadCopy[locale],product=tunnelContent[locale]
 const features=[...product.story.chapters.map(chapter=>({title:chapter.title,description:chapter.description})),product.capabilities.cards[2],{title:product.principles.title,description:product.principles.description}]
 const icons=[Server,Network,Waypoints,Monitor,Terminal,ShieldCheck]
 return <main className="tunnel-main tunnel-download-page">
  <section className="tunnel-download-hero">
   <div className="tunnel-hero-haze" aria-hidden="true"/>
   <img src="/products/oria-tunnel/logo.svg" alt="" width={64} height={64}/>
   <p className="tunnel-eyebrow">OriaTunnel <i/>{tunnelRelease.version}</p>
   <h1>{c.title}</h1><p className="tunnel-download-intro">{c.intro}</p>
   <div className="tunnel-hero-actions"><TunnelDownloadButton locale={locale}/><a className="tunnel-button tunnel-button-quiet" href="#platforms">{c.allDownloads}</a></div>
   <a className="tunnel-release-link" href={tunnelRelease.releaseUrl}>{tunnelRelease.version} · {c.releaseNotes}<ArrowUpRight size={13}/></a>
  </section>
  <section id="platforms" className="tunnel-download-platforms">
   <header className="tunnel-section-heading"><h2>{c.choose}</h2><p>{c.chooseNote}</p></header>
   {(['macos','windows'] as const).map(os=><div key={os} id={os} className="tunnel-platform-group">
    <div className="tunnel-platform-heading"><h3>{os==='macos'?'macOS':'Windows'}</h3><p>{os==='macos'?c.macNote:c.winNote}</p></div>
    <div className="tunnel-installer-grid">{installers.filter(item=>item.os===os).map(item=>{
     const asset=installerAsset(item)
     return <article className="tunnel-installer" key={item.id}>
      <div className="tunnel-installer-heading"><h4>{item.architecture}</h4><span>{tunnelRelease.version}</span></div>
      <p className="tunnel-installer-file">{item.file}</p>
      <div className="tunnel-installer-meta"><span>{fileSize(asset.size)}</span><span>{os==='macos'?'DMG':'EXE · NSIS'}</span></div>
      <a className="tunnel-button tunnel-button-primary" href={asset.url} aria-label={`${c.installer} · ${item.label}`}><Download size={16}/>{c.installer}</a>
      {'zip' in item&&<a className="tunnel-zip-link" href={tunnelRelease.assets[item.zip].url}>{c.zip}<ArrowUpRight size={13}/></a>}
     </article>
    })}</div>
   </div>)}
  </section>
  <section className="tunnel-download-install"><h2>{c.installTitle}</h2><div><article><span>01 / macOS</span><p>{c.macInstall}</p></article><article><span>02 / Windows</span><p>{c.winInstall}</p></article></div><a href={locale==='zh-CN'?'https://github.com/KrisLee1/OriaTunnel#快速上手':`https://github.com/KrisLee1/OriaTunnel/blob/main/docs/readme/README.${locale}.md`}>{c.guide}<ArrowUpRight size={15}/></a></section>
  <section className="tunnel-download-features"><header className="tunnel-section-heading"><h2>{c.featuresTitle}</h2><p>{c.featuresIntro}</p></header><div>{features.map((feature,index)=>{const Icon=icons[index];return <article key={feature.title}><Icon size={23}/><h3>{feature.title}</h3><p>{feature.description}</p></article>})}</div><a className="tunnel-button tunnel-button-quiet" href={localizedPath(locale,'/oria-tunnel')}>{product.hero.primary}<ArrowUpRight size={16}/></a></section>
 </main>
}
