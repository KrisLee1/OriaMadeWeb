'use client'
import dynamic from 'next/dynamic'
import {useEffect, useRef, useState} from 'react'
import type {Locale} from '@/i18n/config'
export type TabDemoVariant = 'showcase' | 'search' | 'organize' | 'aide' | 'web'
const Demo = dynamic(() => import('./story-runtime'), {ssr: false, loading: () => <div className="tab-demo-loading" aria-hidden="true">OriaTab</div>})
export function TabDemo({locale, variant = 'showcase'}: {locale: Locale; variant?: TabDemoVariant}) {
  const root = useRef<HTMLDivElement>(null), [visible, setVisible] = useState(variant === 'showcase')
  useEffect(() => {
    if (visible || !root.current) return
    const observer = new IntersectionObserver(([entry]) => {if (entry.isIntersecting) {setVisible(true); observer.disconnect()}}, {rootMargin: '300px'})
    observer.observe(root.current)
    return () => observer.disconnect()
  }, [visible])
  return <div ref={root} className={`tab-demo-mount tab-demo-${variant}`}>{visible ? <Demo locale={locale} variant={variant}/> : <div className="tab-demo-loading" aria-hidden="true">OriaTab</div>}</div>
}
