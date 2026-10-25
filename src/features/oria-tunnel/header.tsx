'use client'
import {useEffect,useRef,useState} from 'react'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {Popover} from '@base-ui/react/popover'
import {Menu,X} from 'lucide-react'
import {SiteControls} from '@/components/site/controls'
import {GitHubLink} from '@/components/site/github-link'
import {useScrollHeader} from '@/components/site/use-scroll-header'
import {localizedPath} from '@/i18n/config'
import {BrandName} from '@/components/site/brand-name'
import {localize} from '@/i18n/localize'
import {tunnelContent,type TunnelLocale} from './content'
import {downloadCopy} from './download-copy'
export function TunnelHeader({locale}:{locale:TunnelLocale}){
 const c=tunnelContent[locale],anchor=useRef<HTMLElement>(null),[open,setOpen]=useState(false)
 const {floating}=useScrollHeader()
 const pathname=usePathname(),downloadPage=pathname.endsWith('/download')
 const [activeSection,setActiveSection]=useState<string|null>(null)
 useEffect(()=>{
  if(downloadPage)return
  const sections=['workflow','capabilities'].map(id=>document.getElementById(id)).filter((element):element is HTMLElement=>Boolean(element))
  const observer=new IntersectionObserver(()=>{
   const current=sections.filter(section=>section.getBoundingClientRect().top<window.innerHeight*.4).at(-1)
   setActiveSection(current?.id??null)
  },{rootMargin:'-15% 0px -55% 0px',threshold:0})
  sections.forEach(section=>observer.observe(section))
  return()=>observer.disconnect()
 },[downloadPage])
 useEffect(()=>{const wide=matchMedia('(min-width:901px)');const close=()=>{if(wide.matches)setOpen(false)};wide.addEventListener('change',close);return()=>wide.removeEventListener('change',close)},[])
 const links=<><Link href={localizedPath(locale)} onClick={()=>setOpen(false)}>{localize(locale,'Oria home','Oria 首页')}</Link>{c.nav.map(item=><a key={item.id} href={`${localizedPath(locale,'/oria-tunnel')}#${item.id}`} aria-current={!downloadPage&&activeSection===item.id?'location':undefined} onClick={()=>{setActiveSection(item.id);setOpen(false)}}>{item.label}</a>)}<Link href={localizedPath(locale,'/oria-tunnel/download')} aria-current={downloadPage?'page':undefined} onClick={()=>setOpen(false)}>{downloadCopy[locale].download}</Link></>
 return <header ref={anchor} className="tunnel-site-header scroll-reveal-header" data-floating={floating}><div className="tunnel-header-inner">
  <Link className="tunnel-brand" href={localizedPath(locale,'/oria-tunnel')}><img src="/products/oria-tunnel/logo.svg" width={30} height={30} alt=""/><BrandName name="OriaTunnel"/></Link>
  <nav className="tunnel-nav" aria-label={localize(locale,'Page sections','页面章节')}>{links}</nav>
  <div className="tunnel-header-actions"><GitHubLink repository="OriaTunnel"/><SiteControls/></div>
  <GitHubLink repository="OriaTunnel" compact/>
  <Popover.Root open={open} onOpenChange={setOpen}><Popover.Trigger className="tunnel-menu-trigger" aria-label={localize(locale,'Menu','菜单')}>{open?<X size={20}/>:<Menu size={20}/>}</Popover.Trigger><Popover.Portal><Popover.Positioner anchor={anchor} sideOffset={8} align="end" className="tunnel-menu-positioner"><Popover.Popup className="tunnel-mobile-menu floating-surface"><Popover.Title className="sr-only">OriaTunnel</Popover.Title><nav>{links}<GitHubLink repository="OriaTunnel"/></nav><SiteControls/></Popover.Popup></Popover.Positioner></Popover.Portal></Popover.Root>
 </div></header>
}
