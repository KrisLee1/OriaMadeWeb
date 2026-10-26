'use client'

import {useEffect,useRef,useState} from 'react'
import type {Locale} from '@/i18n/config'
import {RuleContent} from './demo'
import {getDemoCopy} from './demo-copy'
import type {DemoStatus} from './simulation'
import {tunnelUpdateCopy} from './updates-copy'

/** Reuse the workspace's D card and popup, without its canvas or window chrome. */
export function ProxyBrowserDemo({locale}:{locale:Locale}) {
 const copy=getDemoCopy(locale),update=tunnelUpdateCopy[locale]
 const viewport=useRef<HTMLElement>(null),card=useRef<HTMLDivElement>(null)
 const [geometry,setGeometry]=useState({scale:1,height:230}),[status,setStatus]=useState<DemoStatus>('listening')
 useEffect(()=>{
  const element=viewport.current,nativeCard=card.current;if(!element||!nativeCard)return
  const measure=()=>{const scale=element.getBoundingClientRect().width/380,height=nativeCard.offsetHeight*scale;setGeometry(current=>current.scale===scale&&current.height===height?current:{scale,height})}
  const observer=new ResizeObserver(measure);observer.observe(element);observer.observe(nativeCard);measure();return()=>observer.disconnect()
 },[])
 return <figure ref={viewport} className="tunnel-proxy-interface" aria-label={update.openProxyBrowser} style={{height:geometry.height}}>
  <div className="demo-native-surface" style={{transform:`scale(${geometry.scale})`}}>
   <div ref={card} className="demo-host-card tunnel-proxy-rule"><RuleContent index={5} copy={copy} status={status} locale={locale} onToggle={()=>setStatus(current=>current==='listening'?'stopped':'listening')}/></div>
  </div>
 </figure>
}
