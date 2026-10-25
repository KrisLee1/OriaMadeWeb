"use client";

import {useEffect,useRef,useState} from 'react'
import {Popover} from '@base-ui/react/popover'
import {Menu,X} from 'lucide-react'
import {BrandName} from '@/components/site/brand-name'
import {localize} from '@/i18n/localize'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {SiteControls} from '@/components/site/controls'
import {useScrollHeader} from '@/components/site/use-scroll-header'
import {localizedPath,type Locale} from '@/i18n/config'
import {products} from '@/content/products'

export function SiteHeader({locale}:{locale:Locale}) {
 const pathname=usePathname(),anchor=useRef<HTMLElement>(null)
 const [open,setOpen]=useState(false)
 const {floating}=useScrollHeader()
 useEffect(()=>{
  const wide=matchMedia('(min-width:901px)')
  const close=()=>{if(wide.matches)setOpen(false)}
  wide.addEventListener('change',close)
  return()=>wide.removeEventListener('change',close)
 },[])
 const productLinks=products.map(p=><Link key={p.slug} href={localizedPath(locale,'/'+p.slug)} aria-current={pathname.includes('/'+p.slug)?'page':undefined} onClick={()=>setOpen(false)}>{p.name}</Link>)
 const links=<><Link href={localizedPath(locale)} aria-current="page" onClick={()=>setOpen(false)}>{localize(locale,'Oria home','Oria 首页')}</Link>{productLinks}</>
 return <header ref={anchor} className="oria-header scroll-reveal-header" data-floating={floating}><div className="oria-header-inner">
  <Link href={localizedPath(locale)} className="oria-wordmark" aria-label={localize(locale,'Oria home','Oria 首页')}><span className="oria-symbol" aria-hidden="true"/><BrandName/></Link>
  <nav className="oria-product-nav" aria-label={localize(locale,'Products','产品')}>{links}</nav>
  <div className="oria-desktop-controls"><SiteControls/></div>
  <Popover.Root open={open} onOpenChange={setOpen}>
   <Popover.Trigger className="oria-mobile-trigger" aria-label={localize(locale,'Menu','菜单')}>{open?<X size={20}/>:<Menu size={20}/>}</Popover.Trigger>
   <Popover.Portal><Popover.Positioner anchor={anchor} align="end" sideOffset={8} className="theme-mobile-positioner"><Popover.Popup className="theme-mobile-menu floating-surface">
    <Popover.Title className="sr-only">Oria</Popover.Title>
    <nav aria-label={localize(locale,'Products','产品')}>{links}</nav>
    <div className="theme-mobile-settings"><span>{localize(locale,'Appearance','外观')}</span><SiteControls/></div>
   </Popover.Popup></Popover.Positioner></Popover.Portal>
  </Popover.Root>
 </div></header>
}
