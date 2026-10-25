'use client'

import {useEffect,useRef,useState} from 'react'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {Popover} from '@base-ui/react/popover'
import {Menu, SlidersHorizontal, X} from 'lucide-react'
import {localizedPath,type Locale} from '@/i18n/config'
import {SiteControls} from '@/components/site/controls'
import {GitHubLink} from '@/components/site/github-link'
import {useScrollHeader} from '@/components/site/use-scroll-header'
import {BrandName} from '@/components/site/brand-name'
import {localize} from '@/i18n/localize'
import {getCopy} from './lib/i18n'
import {useEditorPanel} from './components/editor-panel-provider'

export function ThemeNavigation({locale}:{locale:Locale}) {
  const header=useRef<HTMLElement>(null)
  const path=usePathname()
  const {toggleEditor,editorShown}=useEditorPanel()
  const [open,setOpen]=useState(false)
  const {floating}=useScrollHeader()
  useEffect(()=>{
    const wide=matchMedia('(min-width:901px)')
    const close=()=>{if(wide.matches)setOpen(false)}
    wide.addEventListener('change',close)
    return()=>wide.removeEventListener('change',close)
  },[])
  const copy=getCopy(locale)
  const links=<>
    <Link href={localizedPath(locale)} onClick={()=>setOpen(false)}>{localize(locale,'Oria home','Oria 首页')}</Link>
    <Link href={localizedPath(locale,'/oria-theme/docs')} aria-current={path.includes('/docs')?'page':undefined} onClick={()=>setOpen(false)}>{localize(locale,'Documentation','文档')}</Link>
    <Link href={localizedPath(locale,'/oria-theme/editor')} aria-current={path.endsWith('/editor')?'page':undefined} onClick={()=>setOpen(false)}>{copy.nav.editor}</Link>
  </>
  const editorButton=path.endsWith('/editor')&&<button type="button" className="theme-editor-toggle" onClick={()=>{toggleEditor();setOpen(false)}} aria-label={editorShown?copy.header.closeEditor:copy.header.openEditor} aria-expanded={editorShown} aria-controls="theme-editor-panel"><SlidersHorizontal size={17}/></button>
  return <header ref={header} className="theme-site-header scroll-reveal-header" data-floating={floating}>
    <Link className="theme-brand" href={localizedPath(locale,'/oria-theme')}><img src="/products/oria-theme/icons/color-swatch-fan.svg" alt="" width={32} height={32}/><BrandName name="OriaTheme"/></Link>
    <nav className="theme-desktop-nav" aria-label={copy.header.navigation}>{links}</nav>
    <div className="product-header-actions theme-desktop-actions">{editorButton}<GitHubLink repository="OriaTheme"/><SiteControls/></div>
    <GitHubLink repository="OriaTheme" compact/>
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger className="theme-mobile-trigger" aria-label={copy.header.menu}>{open?<X size={20}/>:<Menu size={20}/>}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner anchor={header} align="end" sideOffset={8} className="theme-mobile-positioner">
          <Popover.Popup className="theme-mobile-menu floating-surface">
            <Popover.Title className="sr-only">{copy.header.mobileNavigation}</Popover.Title>
            <nav aria-label={copy.header.navigation}>{links}<GitHubLink repository="OriaTheme"/></nav>
            <div className="theme-mobile-settings"><span>{copy.header.appearance}</span><div className="product-header-actions">{editorButton}<SiteControls/></div></div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  </header>
}
