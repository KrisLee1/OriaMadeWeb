import { useContext, useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useApp } from '@/features/oria-tab/website/state'
import { cn } from '@/features/oria-tab/shared/lib/utils'
import { useThemeSnapshot } from '@oriatheme/react'
import { LIQUID_THEME_ID } from '@/features/oria-tab/shared/lib/theme-preference'
import { materialShadows } from '@/features/oria-tab/shared/lib/material'
import { GlassSceneContext, WebGLGlassSurface } from '@/features/oria-tab/shared/components/glass-webgl'

export function useMedia(query:string) {
  const [matches,setMatches]=useState(()=>matchMedia(query).matches)
  useEffect(()=>{const media=matchMedia(query),change=()=>setMatches(media.matches);change();media.addEventListener('change',change);return()=>media.removeEventListener('change',change)},[query])
  return matches
}
type SurfaceProps={radius?:number;material?:'toolbar'|'panel'|'icon';effects?:'full'|'static'}
export function GlassSurface({material='toolbar',effects='full'}:SurfaceProps) {
  const liquid=useThemeSnapshot(s=>s.preference.activeThemeId===LIQUID_THEME_ID)
  if(!liquid)return <ThemeSurface material={material} effects={effects}/>
  if(effects==='static')return <div aria-hidden="true" className={`glass-surface glass-${material} static-icon-surface`}/>
  return <LiquidSurface material={material}/>
}
function LiquidSurface({material}:SurfaceProps){
  const scene=useContext(GlassSceneContext),reduced=useMedia('(prefers-reduced-transparency: reduce), (prefers-contrast: more), (forced-colors: active)')
  if(reduced)return <div aria-hidden="true" className={`glass-surface glass-${material} glass-solid`}/>
  if(scene)return <WebGLGlassSurface material={material}/>
  return <div aria-hidden="true" className={`glass-surface glass-${material} native-glass-surface`}/>
}
function ThemeSurface({ material, effects }: SurfaceProps) {
  const { state } = useApp()
  const themeId = useThemeSnapshot(snapshot => snapshot.preference.activeThemeId)
  const override = state.settings.materialOverrides[themeId]
  const variables = useThemeSnapshot(snapshot => snapshot.resolvedTheme.variables)
  const style = useMemo(() => {
    const shadow = materialShadows(variables, material === 'icon' ? 'sm' : material === 'panel' ? 'md' : 'lg')
    return {
      '--material-border-light': shadow.border,
      '--material-images': [variables['--oria-pattern-surface'], variables['--oria-gradient-surface']].filter(value => value?.trim()).join(', ') || 'none',
      ...(override?.opacity !== undefined ? { '--material-opacity': override.opacity / 100 } : {}),
      ...(override?.blur !== undefined ? { '--material-blur': `${override.blur}px` } : {}),
    } as CSSProperties
  }, [variables, material, override])
  return <div aria-hidden="true" className={cn('glass-surface', 'theme-surface', `glass-${material}`, effects === 'static' && 'static-icon-surface')} style={style} />
}
