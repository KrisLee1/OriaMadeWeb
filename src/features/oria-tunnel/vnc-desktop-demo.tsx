'use client'

// Viewer chrome and display controls adapted from OriaTunnel v0.3.0 VncHeader,
// WindowHeader and WindowControl (GPL-3.0-only). The guest is page-local sample content.
import {useEffect, useRef, useState, type CSSProperties} from 'react'
import {scroll} from 'motion/react'
import {ChevronsLeftRight, ChevronsRightLeft, Ellipsis, FileText, FolderSync, Gauge, ImageIcon, Keyboard, Minus, MousePointer2Off, Scan, Wallpaper, X, ZoomIn, ZoomOut} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger} from '@/components/ui/dropdown-menu'
import type {Locale} from '@/i18n/config'
import {getDemoCopy} from './demo-copy'
import {FileWorkspaceDemo} from './file-demo'
import {getFileDemoCopy} from './file-demo-copy'
import {NativeTerminalIcon} from './native-icons'
import {TerminalDock} from './terminal-dock'
import type {vncUpdateCopy} from './vnc-update-copy'
import './vnc-desktop-demo.css'

const zoomLevels = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4]
type Panel = 'files' | 'terminal' | null

export function VncDesktopDemo({locale, copy}: {locale: Locale; copy: typeof vncUpdateCopy.en.demo}) {
  const labels = getDemoCopy(locale), files = getFileDemoCopy(locale)
  const viewport = useRef<HTMLDivElement>(null)
  const filesButton = useRef<HTMLButtonElement>(null), terminalButton = useRef<HTMLButtonElement>(null)
  const moreButton = useRef<HTMLButtonElement>(null), restoreButton = useRef<HTMLButtonElement>(null)
  const scrollRange = useRef<HTMLDivElement>(null)
  const scrollStage = useRef<Panel>(null)
  const [windowState, setWindowState] = useState<'open' | 'closed' | 'minimized'>('open')
  const [size, setSize] = useState({width: 1056, height: 594})
  const [zoom, setZoom] = useState<number | 'fit'>('fit')
  const [expanded, setExpanded] = useState(false), [panel, setPanel] = useState<Panel>(null)
  const [filesMounted, setFilesMounted] = useState(false)
  const [mode, setMode] = useState('quality'), [hideCursor, setHideCursor] = useState(false)
  const [specialKeys, setSpecialKeys] = useState(false)
  const [note, setNote] = useState('coast.svg\n2560 × 1440\n\n~/Pictures/exports/')
  const compact = size.width < 768
  const portrait = compact && size.height > size.width
  const guestWidth = portrait ? 480 : 1056
  const guestHeight = portrait ? Math.round(guestWidth * size.height / size.width) : 594
  const fit = Math.min(size.width / guestWidth, size.height / guestHeight)
  const scale = zoom === 'fit' ? fit : zoom

  useEffect(() => {
    const el = viewport.current
    if (!el) return
    const observer = new ResizeObserver(([{contentRect}]) => {
      if (!contentRect.width || !contentRect.height) return
      setSize({width: contentRect.width, height: contentRect.height})
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    const target = scrollRange.current
    if (!target || expanded || windowState !== 'open') return
    // Change panels only at stage boundaries so manual choices survive small scrolls.
    return scroll(progress => {
      const next = progress < 0.14 || progress >= 0.96 ? null : progress < 0.55 ? 'files' : 'terminal'
      if (next === scrollStage.current) return
      scrollStage.current = next
      if (next === 'files') setFilesMounted(true)
      if (document.activeElement?.closest('.vnc-window .workspace-dock')) moreButton.current?.focus({preventScroll: true})
      setPanel(next)
    }, {target, offset: ['start 84px', 'end 84px']})
  }, [expanded, windowState])
  useEffect(() => {
    if (!specialKeys) return
    const timer = setTimeout(() => setSpecialKeys(false), 1400)
    return () => clearTimeout(timer)
  }, [specialKeys])
  useEffect(() => {
    if (!expanded) return
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape' && !event.defaultPrevented && !document.querySelector('[role="menu"], [role="dialog"]')) setExpanded(false) }
    const exit = () => { if (!document.fullscreenElement) setExpanded(false) }
    document.addEventListener('keydown', escape)
    document.addEventListener('fullscreenchange', exit)
    return () => { document.removeEventListener('keydown', escape); document.removeEventListener('fullscreenchange', exit); if (document.fullscreenElement === document.documentElement) void document.exitFullscreen().catch(() => {}) }
  }, [expanded])
  async function fullscreen() {
    if (expanded) {
      setExpanded(false)
      if (document.fullscreenElement) await document.exitFullscreen().catch(() => {})
    } else {
      setExpanded(true)
      if (document.fullscreenEnabled) await document.documentElement.requestFullscreen().catch(() => {})
    }
  }
  function openPanel(next: Exclude<Panel, null>) {
    if (next === 'files') setFilesMounted(true)
    setPanel(next)
  }
  function closePanel() {
    const trigger = panel === 'files' ? filesButton.current : terminalButton.current
    setPanel(null)
    const activeTrigger = trigger?.offsetWidth ? trigger : moreButton.current
    activeTrigger?.focus({preventScroll: true})
  }
  function dismiss(state: 'minimized' | 'closed') {
    if (expanded) void fullscreen()
    if (state === 'closed') { setPanel(null); setZoom('fit') }
    setWindowState(state)
    requestAnimationFrame(() => restoreButton.current?.focus())
  }
  const specialLabel = copy.sendCtrlAltDel.replace(/<\/?(?:keys|cap)>/g, '')

  return <div className="vnc-story" data-window-state={windowState}>
    <div className="vnc-scroll-range" ref={scrollRange} aria-hidden="true"/>
    <figure className="vnc-demo">
      <figcaption>{copy.caption}</figcaption>
      {windowState !== 'open' && <Button ref={restoreButton} variant="outline" onClick={() => {setWindowState('open'); requestAnimationFrame(() => moreButton.current?.focus())}}>{windowState === 'closed' ? copy.openVnc : copy.restore}</Button>}
      <div className="vnc-window" hidden={windowState !== 'open'} data-expanded={expanded}>
        <header className="vnc-bar">
          <div className="vnc-lights vnc-capsule">
            <button type="button" aria-label={copy.close} title={copy.close} onClick={() => dismiss('closed')}><X/></button>
            <button type="button" aria-label={copy.minimize} title={copy.minimize} onClick={() => dismiss('minimized')}><Minus/></button>
            <button type="button" aria-label={expanded ? copy.restore : copy.fullscreen} title={expanded ? copy.restore : copy.fullscreen} onClick={fullscreen}>{expanded ? <ChevronsRightLeft/> : <ChevronsLeftRight/>}</button>
          </div>
          <div className="vnc-header-center"><span className="vnc-endpoint vnc-capsule" title="127.0.0.1:5900">127.0.0.1:5900</span></div>
          <div className="vnc-header-right">
            <div className="vnc-tools vnc-capsule">
              <Button variant="ghost" size="icon-sm" aria-label={labels.zoomOut} title={labels.zoomOut} disabled={zoom === 0.25} onClick={() => setZoom(zoomLevels.findLast(n => n < scale - 0.001) ?? 0.25)}><ZoomOut/></Button>
              <Button variant="ghost" size="icon-sm" aria-label={copy.fit} title={copy.fit} aria-pressed={zoom === 'fit'} onClick={() => setZoom('fit')}><Scan/></Button>
              <Button variant="ghost" size="icon-sm" aria-label={labels.zoomIn} title={labels.zoomIn} disabled={zoom === 4} onClick={() => setZoom(zoomLevels.find(n => n > scale + 0.001) ?? 4)}><ZoomIn/></Button>
            </div>
            <div className="vnc-tools vnc-capsule">
              {!compact && <><Button ref={filesButton} variant="ghost" size="icon-sm" aria-label={files.title} title={files.title} aria-expanded={panel === 'files'} onClick={() => panel === 'files' ? closePanel() : openPanel('files')}><FolderSync/></Button>
              <Button ref={terminalButton} variant="ghost" size="icon-sm" aria-label={labels.terminal} title={labels.terminal} aria-expanded={panel === 'terminal'} onClick={() => panel === 'terminal' ? closePanel() : openPanel('terminal')}><NativeTerminalIcon/></Button></>}
              <DropdownMenu>
                <DropdownMenuTrigger ref={moreButton} aria-label={files.more} title={files.more} render={<Button variant="ghost" size="icon-sm"/>}><Ellipsis/></DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="vnc-options">
                  <DropdownMenuRadioGroup value={mode} onValueChange={setMode} aria-label={copy.renderMode}>
                    <DropdownMenuRadioItem value="quality" closeOnClick><Wallpaper/>{copy.qualityMode}</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="smooth" closeOnClick><Gauge/>{copy.smoothMode}</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                  <DropdownMenuCheckboxItem checked={hideCursor} onCheckedChange={setHideCursor}><MousePointer2Off/>{copy.hideLocalCursor}</DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator/>
                  {compact && <><DropdownMenuItem onClick={() => openPanel('files')}><FolderSync/>{files.title}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openPanel('terminal')}><NativeTerminalIcon/>{labels.terminal}</DropdownMenuItem><DropdownMenuSeparator/></>}
                  <DropdownMenuItem onClick={() => setSpecialKeys(true)}><Keyboard/>{copy.sendCtrlAltDel.split(/<\/?keys>/).map((part,index) => index === 1 ? <span key={index}>{part.split(/<\/?cap>/).map((key,i) => i % 2 ? <kbd key={i}>{key}</kbd> : key)}</span> : part)}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        <div className="vnc-viewport" ref={viewport} tabIndex={0} role="region" aria-label={copy.desktop} data-hide-cursor={hideCursor} data-mode={mode}>
          <div className="vnc-screen-size" style={{width: guestWidth * scale, height: guestHeight * scale, '--vnc-scale': scale} as CSSProperties}>
            <div className="vnc-screen" data-portrait={portrait} style={{width: guestWidth, height: guestHeight}}>
              <div className="vnc-photo"><div className="vnc-app-title"><ImageIcon size={14}/>coast.svg</div><img src="/products/oria-tab/assets/wallpapers/coast.svg" alt="" width="2560" height="1440" loading="lazy"/></div>
              <div className="vnc-note"><label><span className="vnc-app-title"><FileText size={14}/>notes.txt</span><textarea spellCheck={false} value={note} onChange={event => setNote(event.target.value)}/></label></div>
            </div>
          </div>
        </div>
        {specialKeys && <output className="vnc-key-feedback">{specialLabel}</output>}
        <div className="workspace-dock vnc-panel vnc-files" data-open={panel === 'files'} inert={panel !== 'files'}>
          {filesMounted && <FileWorkspaceDemo locale={locale} onClose={closePanel}/>}
        </div>
        <TerminalDock open={panel === 'terminal'} copy={labels} closeLabel={files.close} onClose={closePanel}/>
      </div>
    </figure>
  </div>
}
