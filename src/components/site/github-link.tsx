export function GitHubLink({repository,compact=false}:{repository:'OriaTheme'|'OriaTunnel'|'OriaTab-Releases';compact?:boolean}) {
 return <a href={`https://github.com/KrisLee1/${repository}`} className={`site-github-link${compact?' site-github-compact':''}`} aria-label={`GitHub · ${repository}`} title={`GitHub · ${repository}`}>
  <span className="site-github-icon" aria-hidden="true"/>
 </a>
}
