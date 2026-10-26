'use client'

import {useEffect, useRef, useState} from 'react'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {Popover} from '@base-ui/react/popover'
import {Menu, X} from 'lucide-react'
import {BrandName} from '@/components/site/brand-name'
import {GitHubLink} from '@/components/site/github-link'
import {SiteControls} from '@/components/site/controls'
import {useScrollHeader} from '@/components/site/use-scroll-header'
import {localize} from '@/i18n/localize'
import {localizedPath, type Locale} from '@/i18n/config'
import {WebsiteStateProvider} from './website/state'
import {content} from './website/content.mjs'

export function TabShell({locale, children}: {locale: Locale; children: React.ReactNode}) {
  const c = content[locale], anchor = useRef<HTMLElement>(null)
  const [open, setOpen] = useState(false), [active, setActive] = useState<string | null>(null)
  const {floating} = useScrollHeader(), pathname = usePathname()
  const home = pathname.endsWith('/oria-tab')
  useEffect(() => {
    setOpen(false)
    if (!home) return
    const sections = ['workflow', 'appearance', 'get'].map(id => document.getElementById(id)).filter((el): el is HTMLElement => Boolean(el))
    const observer = new IntersectionObserver(() => {
      setActive(sections.filter(el => el.getBoundingClientRect().top < innerHeight * .4).at(-1)?.id ?? null)
    }, {rootMargin: '-15% 0px -55% 0px'})
    sections.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [home, pathname])
  useEffect(() => {
    const wide = matchMedia('(min-width: 1101px)')
    const close = () => { if (wide.matches) setOpen(false) }
    wide.addEventListener('change', close)
    return () => wide.removeEventListener('change', close)
  }, [])
  const links = <>
    <Link href={localizedPath(locale)} onClick={() => setOpen(false)}>{localize(locale, 'Oria home', 'Oria 首页')}</Link>
    {[['workflow', c.nav[0]], ['appearance', c.nav[1]], ['get', c.nav[4]]].map(([id, label]) => <a key={id} href={`${localizedPath(locale, '/oria-tab')}#${id}`} aria-current={home && active === id ? 'location' : undefined} onClick={() => {setActive(id); setOpen(false)}}>{label}</a>)}
    <Link href={localizedPath(locale, '/oria-tab/changelog')} aria-current={pathname.endsWith('/changelog') ? 'page' : undefined} onClick={() => setOpen(false)}>{c.nav[2]}</Link>
  </>
  return <WebsiteStateProvider locale={locale}><div className="oria-tab-shell">
    <header ref={anchor} className="tab-site-header scroll-reveal-header" data-floating={floating}>
      <div className="tab-header-inner">
        <Link className="tab-brand" href={localizedPath(locale, '/oria-tab')}><img src="/products/oria-tab/assets/logo.svg" alt="" width={30} height={30}/><BrandName name="OriaTab"/></Link>
        <nav className="tab-nav" aria-label={localize(locale, 'Page sections', '页面章节')}>{links}</nav>
        <div className="tab-header-actions"><GitHubLink repository="OriaTab-Releases"/><SiteControls/></div>
        <GitHubLink repository="OriaTab-Releases" compact/>
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger className="tab-menu-trigger" aria-label={localize(locale, 'Menu', '菜单')}>{open ? <X size={20}/> : <Menu size={20}/>}</Popover.Trigger>
          <Popover.Portal><Popover.Positioner anchor={anchor} sideOffset={8} align="end" className="tab-menu-positioner"><Popover.Popup className="tab-mobile-menu floating-surface">
            <Popover.Title className="sr-only">OriaTab</Popover.Title><nav>{links}<GitHubLink repository="OriaTab-Releases"/></nav><SiteControls/>
          </Popover.Popup></Popover.Positioner></Popover.Portal>
        </Popover.Root>
      </div>
    </header>
    {children}
  </div></WebsiteStateProvider>
}
