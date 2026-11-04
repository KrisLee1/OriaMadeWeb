import type {Locale} from '@/i18n/config'
import {ArrowUpRight,Boxes,Globe,Network,ShieldCheck} from 'lucide-react'
import {downloadCopy} from './download-copy'
import {tunnelUpdateCopy} from './updates-copy'
import {ProxyBrowserDemo} from './proxy-browser-demo'

const updateIcons=[Globe,Boxes,Network]
const proxyBrowserRelease={version:'v0.1.1',releaseUrl:'https://github.com/KrisLee1/OriaTunnel/releases/tag/v0.1.1'}

export function TunnelPreviousUpdate({locale}:{locale:Locale}) {
 const copy=tunnelUpdateCopy[locale]
 return <section id="release-v0-1-1" className="tunnel-section tunnel-updates" aria-label={`${proxyBrowserRelease.version} · ${downloadCopy[locale].previousReleases}`}>
  <div className="tunnel-release-panel">
   <header className="tunnel-update-heading">
    <p className="tunnel-eyebrow">{copy.releaseNotes}</p>
    <span className="tunnel-update-version">{proxyBrowserRelease.version}</span>
    <h2>{downloadCopy[locale].previousReleases}</h2>
    <p className="tunnel-update-intro">{copy.availability.replace('{version}',proxyBrowserRelease.version)}</p>
    <a className="tunnel-update-link" href={proxyBrowserRelease.releaseUrl}>{copy.details}<ArrowUpRight size={15} aria-hidden="true"/></a>
   </header>
   <ul className="tunnel-update-list">{copy.changes.map((change,index)=>{
    const Icon=updateIcons[index]
    return <li key={change}><span className="tunnel-update-icon" aria-hidden="true"><Icon size={20}/></span><div><h3>{copy.highlights[index]}</h3><p>{change.replace(/[；;]$/u,'')}</p>{index===0&&<ProxyBrowserDemo locale={locale}/>}</div></li>
   })}</ul>
   <div className="tunnel-update-note"><ShieldCheck size={18} aria-hidden="true"/><p>{copy.proxyNote}</p></div>
  </div>
 </section>
}
