import {Reveal} from '@/components/ui/reveal'
import {ArrowUpRight,ArrowRightLeft,FileSearch,FolderSync,Layers,Monitor} from 'lucide-react'
import {localizedPath,type Locale} from '@/i18n/config'
import {FileWorkspaceDemo} from './file-demo'
import {fileReleaseId,fileReleaseUrl,fileReleaseVersion,fileUpdateCopy} from './file-update-copy'
import {tunnelRelease} from './release'
import {downloadCopy} from './download-copy'

const icons=[FolderSync,ArrowRightLeft,FileSearch,Layers,Monitor]
export function TunnelFileUpdate({locale,releaseNotes=false}:{locale:Locale;releaseNotes?:boolean}) {
 const copy=fileUpdateCopy[locale]
 return <section id="files" className="tunnel-section tunnel-file-update" aria-labelledby="file-update-title">
  <Reveal><header id={fileReleaseId} className="tunnel-section-heading">
   <p className="tunnel-eyebrow">{releaseNotes?copy.title:copy.eyebrow}</p>
   <h2 id="file-update-title">{releaseNotes?`${downloadCopy[locale].previousReleases} · ${fileReleaseVersion}`:copy.title}</h2>
   <p>{copy.intro}</p>
  </header></Reveal>
  <FileWorkspaceDemo locale={locale}/>
  <div className="file-update-details">{copy.changes.map((change,index)=>{const Icon=icons[index];return <article key={copy.highlights[index]}><Icon size={20}/><h3>{copy.highlights[index]}</h3><p>{change}</p></article>})}</div>
  <div className="file-update-availability"><div className="file-update-links"><a href={releaseNotes?'#platforms':localizedPath(locale,'/oria-tunnel/download')}>{copy.currentDownload} · {tunnelRelease.version}<ArrowUpRight size={14}/></a><a href={fileReleaseUrl}>{downloadCopy[locale].releaseNotes} · {fileReleaseVersion}<ArrowUpRight size={14}/></a>{releaseNotes&&<a href="https://github.com/KrisLee1/OriaTunnel/releases">{downloadCopy[locale].previousReleases} · GitHub<ArrowUpRight size={14}/></a>}</div></div>
 </section>
}
