import { useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { useThemeSnapshot } from '@oriatheme/react'
import { useApp } from '@/features/oria-tab/website/state'
import { LIQUID_THEME_ID } from '@/features/oria-tab/shared/lib/theme-preference'
import { customTheme, themeColors } from '@/features/oria-tab/shared/lib/theme'
import { resolveGlassTint } from '@/features/oria-tab/shared/lib/glass/model'
import { ApplicationGlassScene } from '@/features/oria-tab/shared/lib/glass/application-scene'
import { connectPageGlass } from '@/features/oria-tab/shared/lib/glass/page-glass'
import { GlassSceneContext } from '@/features/oria-tab/shared/components/glass-webgl'
import { useMedia } from '@/features/oria-tab/shared/components/glass'

/** A document boundary; nested website previews provide their own scoped scene. */
export function GlassEnvironment({children,scope,external=false}:{children:ReactNode;scope?:RefObject<HTMLElement|null>;external?:boolean}) {
  const {state,ready}=useApp(),liquid=useThemeSnapshot(s=>s.preference.activeThemeId===LIQUID_THEME_ID),dark=useThemeSnapshot(s=>s.resolvedMode==='dark')
  const themeBackground=useThemeSnapshot(s=>(['--oria-color-bg','--oria-gradient-bg','--oria-pattern-bg'] as const).map(k=>s.resolvedTheme.variables[k]).join('|'))
  const background=JSON.stringify([state.settings.background,state.settings.dim,state.settings.wallpaperBlur,themeBackground,dark])
  const reduced=useMedia('(prefers-reduced-transparency: reduce), (prefers-contrast: more), (forced-colors: active)')
  const pageGlass=useRef<ReturnType<typeof connectPageGlass>|undefined>(undefined)
  const [scene,setScene]=useState<ApplicationGlassScene|null>(null)
  useLayoutEffect(()=>{
    if(!ready||!liquid||reduced||external)return
    const root=scope?.current??document.body
    const previous=root.getAttribute('data-glass-scope');root.setAttribute('data-glass-scope','')
    let next:ApplicationGlassScene
    try{next=new ApplicationGlassScene(root);setScene(next)}catch{root.removeAttribute('data-glass-scope');return}
    return()=>{next.dispose();setScene(null);if(previous===null)root.removeAttribute('data-glass-scope');else root.setAttribute('data-glass-scope',previous)}
  },[ready,liquid,reduced,scope,external])
  useLayoutEffect(()=>{
    if(!ready||!liquid||reduced||!external)return
    const bridge=connectPageGlass(state.settings.liquidMaterial);pageGlass.current=bridge
    return()=>{bridge.dispose();pageGlass.current=undefined}
  },[ready,liquid,reduced,external])
  useLayoutEffect(()=>{pageGlass.current?.setMaterial(state.settings.liquidMaterial)},[state.settings.liquidMaterial])
  useLayoutEffect(()=>{
    if(!scene)return
    const color=state.settings.themeColor==='custom'?customTheme(state.settings.customColor):themeColors[state.settings.themeColor]
    // Theme color is supplied as sRGB; the model applies the same concentration
    // in either mode, and only changes its neutral base color.
    const hex=color.tint.replace('#',''),accent=[0,2,4].map(i=>parseInt(hex.slice(i,i+2),16)/255) as [number,number,number]
    scene.setMaterial(state.settings.liquidMaterial,resolveGlassTint(state.settings.liquidMaterial,dark,accent))
  },[scene,state.settings.liquidMaterial,state.settings.themeColor,state.settings.customColor,dark])
  useLayoutEffect(()=>{scene?.invalidateBackground()},[scene,background])
  return <GlassSceneContext value={scene}>{children}</GlassSceneContext>
}
