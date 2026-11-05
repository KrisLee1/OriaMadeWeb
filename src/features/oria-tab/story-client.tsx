'use client'
import dynamic from 'next/dynamic'
import {useEffect, useRef, useState} from 'react'
import type {Locale} from '@/i18n/config'
export type TabDemoVariant = 'showcase' | 'search' | 'organize' | 'aide' | 'web'
const Demo = dynamic(() => import('./story-runtime'), {ssr: false, loading: () => <div className="tab-demo-loading" aria-hidden="true">OriaTab</div>})
export function TabDemo({locale, variant = 'showcase'}: {locale: Locale; variant?: TabDemoVariant}) {
  const root = useRef<HTMLDivElement>(null)
  const [near,setNear]=useState(variant==='showcase'),[visible,setVisible]=useState(false),[foreground,setForeground]=useState(true)
  useEffect(() => {
    const element=root.current
    if(!element)return
    const nearby=new IntersectionObserver(([entry])=>setNear(entry.isIntersecting),{rootMargin:'200px'})
    const viewport=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting))
    const onVisibility=()=>setForeground(!document.hidden)
    nearby.observe(element);viewport.observe(element)
    document.addEventListener('visibilitychange',onVisibility);onVisibility()
    return()=>{nearby.disconnect();viewport.disconnect();document.removeEventListener('visibilitychange',onVisibility)}
  }, [])
  return <div ref={root} className={`tab-demo-mount tab-demo-${variant}`}>{variant==='showcase'||near ? <Demo locale={locale} variant={variant} active={visible&&foreground}/> : <div className="tab-demo-loading" aria-hidden="true">OriaTab</div>}</div>
}
