'use client'

import dynamic from 'next/dynamic'
import {usePathname} from 'next/navigation'
import {stripLocale} from '@/i18n/config'
import {useState, useSyncExternalStore} from 'react'
import {useOriaTheme} from '@oriatheme/react'

const Waves = dynamic(() => import('./react-bits-waves'), {ssr:false})
const Aurora = dynamic(() => import('./react-bits-aurora'), {ssr:false})
const Particles = dynamic(() => import('./react-bits-particles'), {ssr:false})
const RippleGrid = dynamic(() => import('./react-bits-ripple-grid'), {ssr:false})
type Background = 'brand' | 'theme' | 'tab' | 'tunnel'

function subscribeMotion(callback:()=>void) {
 const query = matchMedia('(prefers-reduced-motion: reduce)')
 query.addEventListener('change',callback)
 return () => query.removeEventListener('change',callback)
}
const motionSnapshot = () => matchMedia('(prefers-reduced-motion: reduce)').matches
const serverMotionSnapshot = () => true

export function SiteBackground() {
 const path = stripLocale(usePathname())
 const [,product,...rest] = path.split('/')
 const variant: Background = product==='oria-theme'?'theme':product==='oria-tab'?'tab':product==='oria-tunnel'?'tunnel':'brand'
 return <ProductBackground key={variant} variant={variant} reading={rest.length>0}/>
}

function ProductBackground({variant,reading}:{variant:Background;reading:boolean}) {
 const {snapshot} = useOriaTheme()
 const [ready,setReady] = useState(false)
 const reduced = useSyncExternalStore(subscribeMotion,motionSnapshot,serverMotionSnapshot)
 const primary = snapshot.resolvedTheme.variables['--oria-color-primary']
 const accent = snapshot.resolvedTheme.variables['--oria-color-accent']
 const info = snapshot.resolvedTheme.variables['--oria-color-info'] || primary
 const dark = snapshot.resolvedMode==='dark'
 const shared = {paused:reduced,onReady:setReady,intro:false}

 return <>
  <div className="site-background" aria-hidden="true" data-background={variant} data-reading={reading} data-ready={ready} data-paused={reduced}>
   <div className="site-background-glow"/>
   {variant==='brand'&&<Waves {...shared} lineColor={primary} accentColor={accent} spacing={34} amplitude={36} rotation={-24}
    speed={0.24} mouseRadius={180} mouseStrength={0.65} bounce={0.35} returnDuration={1.8}
    opacity={dark?0.22:0.15} fade={0} dpr={1}/>}
   {variant==='theme'&&<Aurora {...shared} colorStops={[primary,accent,info]} amplitude={0.7} height={0.68}
    blend={0.7} scale={1.35} speed={0.35} glow={0.5} layers={3} opacity={dark?0.4:0.24} dpr={1}/>}
   {variant==='tab'&&<Particles {...shared} particleColors={[primary,accent]} particleCount={145}
    particleBaseSize={60} particleSpread={12} sizeRandomness={0.7} speed={0.06} glow={0.6}
    drift="up" driftSpeed={0.14} hoverEffect="repel" particleHoverFactor={0.6} clickBurst
    shape="circle" opacity={dark?0.65:0.5} lightMode={!dark} pixelRatio={1}/>}
   {variant==='tunnel'&&<RippleGrid {...shared} color={primary} cellSize={40} lineWidth={0.7}
    variant="dots" tilt={0} rotation={0} glow={0.2} rippleStrength={0.75} rippleSpeed={0.5}
    autoRipple="random" rippleInterval={6} opacity={dark?0.5:0.35} fade={0} lightMode={!dark} dpr={1}/>}
  </div>

 </>
}
