import {ArrowUpRight,ArrowRightLeft,FileSearch,FolderSync,Layers,Monitor} from 'lucide-react'
import {localizedPath,type Locale} from '@/i18n/config'
import {FileWorkspaceDemo} from './file-demo'
import {fileUpdateCopy} from './file-update-copy'
import {tunnelRelease} from './release'
import {downloadCopy} from './download-copy'

const icons=[FolderSync,ArrowRightLeft,FileSearch,Layers,Monitor]
export function TunnelFileUpdate({locale}:{locale:Locale}) {
 const copy=fileUpdateCopy[locale]
 return <section id="files" className="tunnel-section tunnel-file-update" aria-labelledby="file-update-title">
  <header id="release-notes" className="tunnel-section-heading"><p className="tunnel-eyebrow">{copy.eyebrow}</p><div className="file-update-version"><span>{tunnelRelease.version}</span><span>{copy.status}</span></div><h2 id="file-update-title">{copy.title}</h2><p>{copy.intro}</p></header>
  <FileWorkspaceDemo locale={locale}/>
  <div className="file-update-details">{copy.changes.map((change,index)=>{const Icon=icons[index];return <article key={copy.highlights[index]}><Icon size={20}/><h3>{copy.highlights[index]}</h3><p>{change}</p></article>})}</div>
  <div className="file-update-availability"><p>{copy.downloadNotice}</p><div className="file-update-links"><a href={localizedPath(locale,'/oria-tunnel/download')}>{copy.currentDownload} · {tunnelRelease.version}<ArrowUpRight size={14}/></a><a href={tunnelRelease.releaseUrl}>{downloadCopy[locale].releaseNotes}<ArrowUpRight size={14}/></a></div></div>
 </section>
}
