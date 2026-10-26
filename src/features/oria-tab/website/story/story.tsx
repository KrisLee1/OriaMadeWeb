import {useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties} from 'react'
import {useThemeSnapshot} from '@oriatheme/react'
import {useReducedMotion} from 'motion/react'
import {Play, RotateCcw, Pause} from 'lucide-react'
import {Tabs, TabsList, TabsTrigger, TabsContent} from '@/components/ui/tabs'
import {localize} from '@/i18n/localize'
import {useTranslation} from 'react-i18next'
import {translations} from '../../shared/lib/i18n'
import {choreograph} from './choreography'
import {Device, Screen, Overlay, Halo, Article, SearchBox, Bookmarks, AideWindow, type Copy} from './stage'
import {PreviewThemeScope, usePreviewRuntime, type PreviewController} from './preview-theme'
import {localizedPath, isLocale} from '@/i18n/config'
import type {TabDemoVariant} from '../../story-client'

const languages = ['zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'de', 'fr', 'ru']
const placeholders = Object.fromEntries(languages.map(lang => [lang, (translations as Record<string, Record<string, string>>)[lang].searchPlaceholder]))
const frames = [8.8, 15.2, 22.9, 37, 48.2, 58.2]
const ranges = [[2.3, 8.8], [11.8, 18.2], [21.4, 28.8], [30.4, 38], [41.4, 48.3], [51.4, 59.2]]

export function StoryView({c}: {c: Copy}) {
  const {i18n} = useTranslation(), locale = isLocale(i18n.language) ? i18n.language : 'en'
  const [scene, setScene] = useState(0), [playing, setPlaying] = useState(false), [replay, setReplay] = useState(0)
  const [size, setSize] = useState({width: 1440, height: 900})
  const viewport = useRef<HTMLDivElement>(null), root = useRef<HTMLDivElement>(null)
  const controller = useRef<PreviewController | null>(null), preview = usePreviewRuntime()
  const reduced = useReducedMotion(), pausedTime = useRef<number | null>(null)
  const globalTheme = useThemeSnapshot(s => s.preference.activeThemeId), dark = useThemeSnapshot(s => s.resolvedMode === 'dark')
  const onReady = useCallback((value: PreviewController) => {controller.current = value}, [])
  useLayoutEffect(() => {
    const element = viewport.current!
    const observer = new ResizeObserver(([entry]) => setSize({width: entry.contentRect.width, height: entry.contentRect.height}))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  const mode = size.width <= 600 ? 'mobile' : 'desktop'
  const unit = Math.min(size.width / (mode === 'mobile' ? 400 : 1440), size.height / (mode === 'mobile' ? 860 : 900))
  useLayoutEffect(() => {
    if (!root.current) return
    const story = choreograph({root: root.current, mode, unit, preview: () => controller.current, languages, placeholders})
    const apply = (time: number) => {
      story.apply(time)
      // Keep the native browser window in place while its original UI choreography plays.
      root.current!.querySelector<HTMLElement>('[data-st="device"]')!.style.transform = 'none'
      root.current!.style.setProperty('--camera', '1')
    }
    if (!playing || reduced) {apply(pausedTime.current ?? frames[scene]); return () => controller.current?.set(null)}
    const [start, end] = ranges[scene]
    let frame = 0, began = 0
    const tick = (now: number) => {
      if (!began) began = now
      const time = Math.min(end, start + (now - began) / 1000 * 1.8)
      pausedTime.current = time
      apply(time)
      if (time < end) frame = requestAnimationFrame(tick)
      else {pausedTime.current = frames[scene]; setPlaying(false)}
    }
    frame = requestAnimationFrame(tick)
    return () => {cancelAnimationFrame(frame); controller.current?.set(null)}
  }, [scene, mode, unit, playing, replay, reduced, globalTheme, dark])
  const labels = [c.demo[0], ...c.scenes.slice(1, 6).map((scene: string[]) => scene[0])]
  return <Tabs value={scene} onValueChange={value => {pausedTime.current = null; setPlaying(false); setScene(Number(value))}} className="tab-showcase">
    <div className="tab-showcase-toolbar"><TabsList variant="line" className="tab-scene-tabs" aria-label={c.nav[0]}>{labels.map((label: string, index: number) => <TabsTrigger value={index} key={index}>{label}</TabsTrigger>)}</TabsList>
      {!reduced && <button type="button" className="tab-replay" aria-label={localize(locale, playing ? 'Pause demo' : 'Replay demo', playing ? '暂停演示' : '重播演示')} onClick={() => {if (!playing) pausedTime.current = null; setPlaying(!playing); setReplay(value => value + 1)}}>{playing ? <Pause size={13}/> : <Play size={13}/>}<span>{localize(locale, playing ? 'Pause demo' : 'Replay demo', playing ? '暂停演示' : '重播演示')}</span></button>}
    </div>
    <TabsContent value={scene} className="tab-showcase-panel" aria-label={labels[scene]}>
      <div className="tab-showcase-viewport" ref={viewport}>
        <div ref={root} className="st tab-preview-stage" data-mode={mode} data-scene={scene} style={{'--u': unit} as CSSProperties}>
          <Halo/><Device c={c}><PreviewThemeScope preview={preview} global={{themeId: globalTheme, dark}} onReady={onReady}><Screen c={c}/></PreviewThemeScope></Device>
          <Overlay c={c} themeHref={localizedPath(locale, '/oria-theme')}/>
        </div>
      </div>
    </TabsContent>
    <div className="tab-showcase-caption"><span>0{scene + 1} / 06</span><p>{scene === 0 ? c.demo[24] : c.scenes[scene][3]}</p><button type="button" aria-label={localize(locale, 'Reset demo', '重置演示')} onClick={() => {pausedTime.current = null; setScene(0); setPlaying(false)}}><RotateCcw size={14}/></button></div>
  </Tabs>
}

/** Close-ups use the same product components as the browser preview. */
export function FeaturePreview({c, variant}: {c: Copy; variant: Exclude<TabDemoVariant, 'showcase'>}) {
  const host = useRef<HTMLDivElement>(null), [scale, setScale] = useState(1)
  useLayoutEffect(() => {
    const observer = new ResizeObserver(([entry]) => setScale(Math.min(1, entry.contentRect.width / 500)))
    observer.observe(host.current!)
    return () => observer.disconnect()
  }, [])
  return <div ref={host} className={`tab-closeup tab-closeup-${variant}`} aria-hidden="true" inert>{variant === 'web' ? <Article c={c}/> : <img className="tab-closeup-wallpaper" data-glass-background="" src="/products/oria-tab/assets/wallpapers/dawn.svg" alt=""/>}<div className="tab-closeup-inner" style={{transform: `translateX(-50%) scale(${scale})`}}>
    {variant === 'search' ? <SearchBox c={c}/> : variant === 'organize' ? <Bookmarks c={c}/> : <AideWindow c={c}/>}
  </div></div>
}
