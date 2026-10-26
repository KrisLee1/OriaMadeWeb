import type {Locale} from '@/i18n/config'
import {ArrowUpRight,Boxes,Globe,Network,ShieldCheck} from 'lucide-react'
import {tunnelRelease} from './release'
import {tunnelUpdateCopy} from './updates-copy'
import {ProxyBrowserDemo} from './proxy-browser-demo'

const updateIcons=[Globe,Boxes,Network]

export function TunnelUpdates({locale}:{locale:Locale}) {
 const copy=tunnelUpdateCopy[locale]
 return <section id="release-notes" className="tunnel-section tunnel-updates" aria-label={`${tunnelRelease.version} · ${copy.title}`}>
  <div className="tunnel-release-panel">
   <header className="tunnel-update-heading">
    <p className="tunnel-eyebrow">{copy.releaseNotes}</p>
    <span className="tunnel-update-version">{tunnelRelease.version}</span>
    <h2>{copy.title}</h2>
    <p className="tunnel-update-intro">{copy.availability.replace('{version}',tunnelRelease.version)}</p>
    <a className="tunnel-update-link" href={tunnelRelease.releaseUrl}>{copy.details}<ArrowUpRight size={15} aria-hidden="true"/></a>
   </header>
   <ul className="tunnel-update-list">{copy.changes.map((change,index)=>{
    const Icon=updateIcons[index]
    return <li key={change}><span className="tunnel-update-icon" aria-hidden="true"><Icon size={20}/></span><div><h3>{copy.highlights[index]}</h3><p>{change.replace(/[；;]$/u,'')}</p>{index===0&&<ProxyBrowserDemo locale={locale}/>}</div></li>
   })}</ul>
   <div className="tunnel-update-note"><ShieldCheck size={18} aria-hidden="true"/><p>{copy.proxyNote}</p></div>
  </div>
 </section>
}
