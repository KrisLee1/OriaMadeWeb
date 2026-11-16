import {Terminal, X} from 'lucide-react'
import type {DemoCopy} from './demo-copy'

export function TerminalDock({copy, onClose, closeLabel, open}: {
  copy: DemoCopy
  onClose: () => void
  closeLabel?: string
  open: boolean
}) {
  return <aside className="demo-terminal workspace-dock" data-open={open} inert={!open}>
    <div><span><Terminal size={13}/>{copy.terminal}</span><span>dev-workspace</span>
      <button type="button" aria-label={closeLabel ?? copy.terminal} onClick={onClose}><X size={15}/></button>
    </div>
    <pre><b>developer@dev-workspace</b>{':~$ ls /srv/demo\nassets  config.json  README.md  src'}<span>{'\n\nSSH · 22'}</span></pre>
  </aside>
}
