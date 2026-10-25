import {ArrowUpRight} from 'lucide-react'

export function GitHubLink({repository,compact=false}:{repository:'OriaTheme'|'OriaTunnel';compact?:boolean}) {
 return <a href={`https://github.com/KrisLee1/${repository}`} className={`site-github-link${compact?' site-github-compact':''}`} aria-label={`GitHub · ${repository}`}>
  <span className="site-github-icon" aria-hidden="true"/>
  {!compact&&<><span className="site-github-label">GitHub</span><ArrowUpRight size={14} aria-hidden="true"/></>}
 </a>
}
