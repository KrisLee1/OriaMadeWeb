import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { GlassScene } from '@/features/oria-tab/shared/lib/glass/scene'

/** Shared registration contract for document scenes and the calibration lab. */
export const GlassSceneContext=createContext<Pick<GlassScene,'surface'|'content'>|null>(null)
const GlassOrderContext=createContext(0)
export function GlassPaintOrder({order,children}:{order:number;children:ReactNode}) {
  return <GlassOrderContext value={order}>{children}</GlassOrderContext>
}
export function GlassSceneContent({order,className,children}:{order:number;className?:string;children:ReactNode}) {
  const scene=useContext(GlassSceneContext),ref=useRef<HTMLDivElement>(null)
  useEffect(()=>{if(scene&&ref.current)return scene.content(ref.current,order)},[scene,order])
  return <div ref={ref} className={className}>{children}</div>
}
export function WebGLGlassSurface({material}:{material?:'toolbar'|'panel'|'icon'}) {
  const scene=useContext(GlassSceneContext),order=useContext(GlassOrderContext)
  const ref=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null),[ready,setReady]=useState(false)
  useEffect(()=>{if(scene&&ref.current&&canvas.current)return scene.surface(ref.current,canvas.current,order,setReady)},[scene,order])
  return <div ref={ref} aria-hidden="true" className={`glass-surface glass-${material||'toolbar'} webgl-glass-surface`} data-webgl-ready={ready?'true':'false'}>
    <canvas ref={canvas} data-glass-output="" style={{position:'absolute',inset:0,contain:'strict',display:ready?'block':'none',width:'100%',height:'100%',borderRadius:'inherit'}} />
  </div>
}
