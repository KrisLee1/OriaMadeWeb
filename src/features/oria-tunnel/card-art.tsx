import {ArrowLeft, ArrowRight, Check, ChevronRight, Clipboard, CalendarDays, Code2, Database, FileKey, FileText, Fingerprint, Folder, MousePointer2, KeyRound, Laptop, LockKeyhole, Monitor, Network, Server, SquareTerminal} from 'lucide-react'

function Keys({keys}: {keys: string[]}) {
  return <span className="art-keys">{keys.map(key => <kbd key={key}>{key}</kbd>)}</span>
}

function Panes({stack = false}: {stack?: boolean}) {
  return <span className="art-panes" data-stack={stack}><i/><i/><i/></span>
}

function Illustration({scene}: {scene: string}) {
  switch (scene) {
    case 'map': case 'trust': return <><Laptop/><i className="art-route"/>{scene === 'trust' ? <Fingerprint/> : <Network/>}<i className="art-route"/><Server/></>
    case 'forwards': return <><code>:5900</code><ArrowRight/><code>VNC</code></>
    case 'services': return <><Server/><i className="art-route"/><Database/></>
    case 'hosts': return <><Server/><code>home-lab</code></>
    case 'logs': return <><span className="art-lines"><i/><i/><i/></span><Check/></>
    case 'split': return <><SquareTerminal/><MousePointer2/><Panes/></>
    case 'completion': return <><code>git <em>status</em></code><Keys keys={['→']}/></>
    case 'directory': return <><ArrowLeft/><Folder/><code>~/src</code></>
    case 'library': return <><FileText/><code>git pull</code></>
    case 'multiline': return <><code>❯ ▏</code><Keys keys={['⇧','↵']}/></>
    case 'output': return <><span className="art-lines"><i/><i/><i/></span><code>···</code></>
    case 'copy': return <><SquareTerminal/><ArrowRight/><Clipboard/></>
    case 'dates': return <><CalendarDays/><Folder/></>
    case 'browse': return <><Folder/><i className="art-route"/><Folder/></>
    case 'queue': return <><span className="art-progress"><i/><i/></span><Check/></>
    case 'preview': return <><FileText/><code>.md</code></>
    case 'layout': case 'files': return <Panes stack={scene === 'files'}/>
    case 'drop': return <><FileText/><MousePointer2/><i className="art-route"/><Folder/></>
    case 'desktop': return <Monitor className="art-display"/>
    case 'clipboard': return <><Keys keys={['⌘','C']}/><ArrowRight/><Keys keys={['V']}/></>
    case 'terminal': return <><Monitor/><ChevronRight/><SquareTerminal/></>
    case 'credentials': return <><KeyRound/><i className="art-route"/><LockKeyhole/></>
    case 'export': return <><FileKey/><code>••••••</code></>
    case 'macos': return <svg className="platform-mark platform-mark-apple" viewBox="27 17 42 42" fill="currentColor" focusable="false">
      <path d="M49 29c-.6-4.9 3.7-9.5 8.3-10.2.5 4.7-3.6 9.7-8.3 10.2Zm13 19.2c-1 3.4-4.3 9.3-7.6 9.3-2.4 0-3.6-1.5-6.3-1.5s-4.1 1.5-6.2 1.5c-3.9 0-10.1-9.6-10.1-17.1 0-6.3 3.8-10.5 8.9-10.5 2.9 0 5 1.7 7.3 1.7 2.1 0 4.7-1.9 7.8-1.8 2.8.1 5 1.3 6.7 3.6-6 3.7-6.7 11  -.5 14.8Z"/>
    </svg>
    case 'windows': return <svg className="platform-mark platform-mark-windows" viewBox="0 0 48 48" fill="currentColor" focusable="false">
      <rect x="2" y="2" width="21" height="21" color="#f25022"/>
      <rect x="25" y="2" width="21" height="21" color="#7fba00"/>
      <rect x="2" y="25" width="21" height="21" color="#00a4ef"/>
      <rect x="25" y="25" width="21" height="21" color="#ffb900"/>
    </svg>
    case 'footer': return <><Laptop/><i className="art-route"/><img src="/products/oria-tunnel/logo.svg" width="42" height="42" alt=""/><i className="art-route"/><Monitor/></>
    default: return <Code2/>
  }
}

export function CardArt({scene}: {scene: string}) {
  return <span className="tunnel-card-art" aria-hidden="true"><Illustration scene={scene}/></span>
}
