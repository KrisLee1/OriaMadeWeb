import { useId, useState } from 'react'
import { Globe2, SearchIcon } from 'lucide-react'
import { useApp } from '@/features/oria-tab/website/state'
import { useAideThemeColor } from '@/features/oria-tab/shared/features/aide-original/avatar/use-aide-theme-color'
import { AideAvatar } from '@/features/oria-tab/shared/features/aide-original/avatar/aide-avatar'
import { useAidePresentation } from '@/features/oria-tab/shared/features/aide-original/avatar/activity-store'
import { GlassSurface } from '@/features/oria-tab/shared/components/glass'
import { type Engine } from '@/features/oria-tab/shared/lib/model'
import { useSiteIcon } from '@/features/oria-tab/shared/lib/use-site-icon'

const engineAssets: Record<string, string> = { yahoo: '/products/oria-tab/engines/yahoo.svg', bing: '/products/oria-tab/engines/bing.svg', baidu: '/products/oria-tab/engines/baidu.svg', google: '/products/oria-tab/engines/google.png', quark: '/products/oria-tab/engines/quark.png', duckduckgo: '/products/oria-tab/engines/duckduckgo.ico', brave: '/products/oria-tab/engines/brave.ico', sogou: '/products/oria-tab/engines/sogou.ico', '360': '/products/oria-tab/engines/360.ico' }
export function EngineIcon({ engine, small = false }: { engine: Engine; small?: boolean }) {
  const [failed, setFailed] = useState('')
  const src = engineAssets[engine.id]
  if (engine.id !== 'browser' && !src) return <CustomEngineIcon engine={engine} small={small} />
  return <span className={`engine-icon ${small ? 'small' : ''}`} aria-hidden="true">{engine.id === 'browser' ? <SearchIcon className="browser-engine-icon" /> : src && failed !== src ? <img src={src} alt="" onError={() => setFailed(src)} /> : <Globe2 />}</span>
}

function CustomEngineIcon({ engine, small }: { engine: Engine; small: boolean }) {
  const icon = useSiteIcon(engine.template.replace('{query}', ''))
  const [failed, setFailed] = useState('')
  const pixels = icon ? Math.min(icon.width, icon.height) / (window.devicePixelRatio || 1) : undefined
  return <span className={`engine-icon ${small ? 'small' : ''}`} aria-hidden="true">{icon && failed !== icon.src ? <img src={icon.src} data-icon-source={icon.source} alt="" referrerPolicy="no-referrer" draggable={false} style={{ maxWidth: pixels, maxHeight: pixels }} onError={() => setFailed(icon.src)} /> : <Globe2 />}</span>
}

export type UtilityKind = 'bookmarks' | 'groups' | 'wallpapers' | 'settings'
export function AideIcon() {
  const presentation = useAidePresentation()
  const baseColor = useAideThemeColor()
  const { state } = useApp()
  return <span className="utility-glass-icon utility-aide" data-aide-status={presentation.kind} data-aide-base-color={baseColor}><GlassSurface radius={14} material="icon" /><AideAvatar baseColor={baseColor} status={presentation.status} size="90%" interactive={false} decorative motion={state.settings.reduceMotion ? 'reduced' : 'system'} className="dock-aide-avatar" /></span>
}
// Optical sizes share a ~36–40 unit footprint inside the themed 64 unit tile.
// Clear intrinsic colors carry recognition; soft highlights and the themed shell carry the glass finish.
// Artwork colors are intrinsic; the glass shell continues to follow the theme.
export function UtilityIcon({ kind }: { kind: UtilityKind }) {
  const id = useId()
  const paint = (name: string) => `url(#${id}-${name})`
  return <span className={`utility-glass-icon utility-${kind}`}><GlassSurface radius={14} material="icon" /><svg viewBox="0 0 64 64" className="utility-art" aria-hidden="true" fill="none">
    <defs>
      {kind !== 'wallpapers' && <filter id={`${id}-frosted`} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
        <feDropShadow dx="0" dy=".65" stdDeviation=".65" floodColor="#244478" floodOpacity=".12" />
      </filter>}
      {kind !== 'wallpapers' && <linearGradient id={`${id}-rim`} x1="16" y1="12" x2="38" y2="52" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f4fbff" stopOpacity=".64" />
        <stop offset=".5" stopColor="#e2f0fa" stopOpacity=".22" />
        <stop offset="1" stopColor="#d9e7f5" stopOpacity=".4" />
      </linearGradient>}
      {kind === 'bookmarks' && <>
        <linearGradient className="utility-tint" id={`${id}-paper`} x1="0" y1="0" x2=".25" y2="1"><stop stopColor="#dcefff" stopOpacity=".88" /><stop offset="1" stopColor="#a5d2fa" stopOpacity=".68" /></linearGradient>
        <linearGradient className="utility-tint" id={`${id}-ribbon`} x1="0" y1="0" x2=".25" y2="1"><stop stopColor="#9ce1ff" stopOpacity=".96" /><stop offset=".5" stopColor="#65c6ff" stopOpacity=".9" /><stop offset="1" stopColor="#4caaf8" stopOpacity=".84" /></linearGradient>
      </>}
      {kind === 'groups' && <>
        <linearGradient className="utility-tint" id={`${id}-blue`} x1="0" y1="0" x2=".2" y2="1"><stop stopColor="#8fdcff" stopOpacity=".96" /><stop offset="1" stopColor="#52b6fc" stopOpacity=".85" /></linearGradient>
        <linearGradient className="utility-tint" id={`${id}-violet`} x1="0" y1="0" x2=".2" y2="1"><stop stopColor="#c5bdff" stopOpacity=".96" /><stop offset="1" stopColor="#9985fb" stopOpacity=".85" /></linearGradient>
        <linearGradient className="utility-tint" id={`${id}-cyan`} x1="0" y1="0" x2=".2" y2="1"><stop stopColor="#97f0ee" stopOpacity=".96" /><stop offset="1" stopColor="#4ed2d5" stopOpacity=".85" /></linearGradient>
        <linearGradient className="utility-tint" id={`${id}-periwinkle`} x1="0" y1="0" x2=".2" y2="1"><stop stopColor="#b5d8ff" stopOpacity=".96" /><stop offset="1" stopColor="#7ca8fb" stopOpacity=".85" /></linearGradient>
      </>}
      {kind === 'settings' && <linearGradient className="utility-tint" id={`${id}-glass`} x1="0" y1="0" x2=".25" y2="1"><stop stopColor="#ecf5ff" stopOpacity=".97" /><stop offset=".5" stopColor="#d0e4fc" stopOpacity=".88" /><stop offset="1" stopColor="#afcaf2" stopOpacity=".82" /></linearGradient>}
    </defs>
    {kind === 'bookmarks' && <g className="utility-symbol" stroke={paint('rim')} strokeWidth=".5" strokeLinejoin="round">
      <path fill={paint('paper')} className="utility-volume" filter={paint('frosted')} d="M20 16h14a4.5 4.5 0 0 1 4.5 4.5v21.6q0 2-1.7 1l-9-5.5q-.8-.5-1.6 0l-9 5.5q-1.7 1-1.7-1V20.5A4.5 4.5 0 0 1 20 16Z" />
      <path fill={paint('ribbon')} className="utility-volume" filter={paint('frosted')} d="M29 13h14a4.5 4.5 0 0 1 4.5 4.5v30.9q0 2.2-1.8 1l-8.7-5.7q-1-.7-2 0l-8.7 5.7q-1.8 1.2-1.8-1V17.5A4.5 4.5 0 0 1 29 13Z" />
      <path className="utility-detail" d="M31 22h10" />
    </g>}
    {kind === 'groups' && <>
      <g className="utility-symbol utility-volume" stroke={paint('rim')} strokeWidth=".5" strokeLinejoin="round" filter={paint('frosted')}>
        <rect fill={paint('blue')} x="14" y="14" width="16.5" height="16.5" rx="4.4" />
        <rect fill={paint('violet')} x="33.5" y="14" width="16.5" height="16.5" rx="4.4" />
        <rect fill={paint('cyan')} x="14" y="33.5" width="16.5" height="16.5" rx="4.4" />
        <rect fill={paint('periwinkle')} x="33.5" y="33.5" width="16.5" height="16.5" rx="4.4" />
      </g>
    </>}
    {kind === 'wallpapers' && <>
      <rect className="utility-pane" x="13" y="16" width="38" height="32" rx="7" />
      <circle className="utility-glyph" cx="40" cy="26" r="4" />
      <path className="utility-glyph" d="m17 41l9-12a2 2 0 0 1 3 0l8 10l5-6a2 2 0 0 1 3 0l3 8v3H17Z" strokeLinejoin="round" />
    </>}
    {kind === 'settings' && <g className="utility-symbol utility-volume" filter={paint('frosted')}>
      <path fill={paint('glass')} stroke={paint('rim')} strokeWidth=".5" fillRule="evenodd" d="M24.52 17.12Q25.61 16.57 26.77 16.19L26.82 16.17Q27.97 15.79 28.19 14.09L28.19 14.02Q28.41 12.33 30.61 12.33L33.39 12.33Q35.59 12.33 35.81 14.02L35.81 14.09Q36.03 15.79 37.18 16.17L37.23 16.19Q38.39 16.57 39.48 17.12L39.52 17.14Q40.61 17.69 41.96 16.64L42.02 16.60Q43.37 15.55 44.93 17.10L46.90 19.07Q48.45 20.63 47.40 21.98L47.36 22.04Q46.31 23.39 46.86 24.48L46.88 24.52Q47.43 25.61 47.81 26.77L47.83 26.82Q48.21 27.97 49.91 28.19L49.98 28.19Q51.67 28.41 51.67 30.61L51.67 33.39Q51.67 35.59 49.98 35.81L49.91 35.81Q48.21 36.03 47.83 37.18L47.81 37.23Q47.43 38.39 46.88 39.48L46.86 39.52Q46.31 40.61 47.36 41.96L47.40 42.02Q48.45 43.37 46.90 44.93L44.93 46.90Q43.37 48.45 42.02 47.40L41.96 47.36Q40.61 46.31 39.52 46.86L39.48 46.88Q38.39 47.43 37.23 47.81L37.18 47.83Q36.03 48.21 35.81 49.91L35.81 49.98Q35.59 51.67 33.39 51.67L30.61 51.67Q28.41 51.67 28.19 49.98L28.19 49.91Q27.97 48.21 26.82 47.83L26.77 47.81Q25.61 47.43 24.52 46.88L24.48 46.86Q23.39 46.31 22.04 47.36L21.98 47.40Q20.63 48.45 19.07 46.90L17.10 44.93Q15.55 43.37 16.60 42.02L16.64 41.96Q17.69 40.61 17.14 39.52L17.12 39.48Q16.57 38.39 16.19 37.23L16.17 37.18Q15.79 36.03 14.09 35.81L14.02 35.81Q12.33 35.59 12.33 33.39L12.33 30.61Q12.33 28.41 14.02 28.19L14.09 28.19Q15.79 27.97 16.17 26.82L16.19 26.77Q16.57 25.61 17.12 24.52L17.14 24.48Q17.69 23.39 16.64 22.04L16.60 21.98Q15.55 20.63 17.10 19.07L19.07 17.10Q20.63 15.55 21.98 16.60L22.04 16.64Q23.39 17.69 24.48 17.14Z M32 22.4a9.6 9.6 0 1 0 0 19.2a9.6 9.6 0 1 0 0-19.2Z" />
    </g>}
  </svg></span>
}
