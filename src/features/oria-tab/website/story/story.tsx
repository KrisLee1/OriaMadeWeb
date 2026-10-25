import {localizedPath, isLocale} from "@/i18n/config"
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { scroll, motionValue, springValue } from 'motion'
import { ArrowDown, ChevronRight } from 'lucide-react'
import { useThemeSnapshot } from '@oriatheme/react'
import { useMedia, GlassSurface } from '@/features/oria-tab/shared/components/glass'
import { translations } from '@/features/oria-tab/shared/lib/i18n'
import { acts, TOTAL, rest, actAt } from '@/features/oria-tab/website/story/acts'
import { choreograph, type Mode } from '@/features/oria-tab/website/story/choreography'
import { Device, Screen, Overlay, Halo, Keys, installIcons, type Copy } from '@/features/oria-tab/website/story/stage'
import { PreviewThemeScope, usePreviewRuntime, type PreviewController } from '@/features/oria-tab/website/story/preview-theme'
import { span } from '@/features/oria-tab/website/story/engine'
import { site } from '@/features/oria-tab/website/site-config.mjs'
import { PlatformIcon } from '@/features/oria-tab/website/platform-icons.mjs'

const languages = ['zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'de', 'fr', 'ru']
const placeholders = Object.fromEntries(languages.map(lang => [lang, (translations as Record<string, Record<string, string>>)[lang].searchPlaceholder]))
const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

export function Downloads({ c }: { c: Copy }) {
  return <div className="website-downloads">
    <div className="store-downloads">
    <a href={site.edge} className="hd-island download-glass edge-download"><GlassSurface /><PlatformIcon platform="edge" /><span>{c.download[0]}</span></a>
    <a href={site.chrome} className="hd-island download-glass chrome-download"><GlassSurface /><PlatformIcon platform="chrome" /><span>{c.download[1]}</span></a>
    </div>
    <div className="github-install" role="group" aria-label={`GitHub · ${c.download[4]}`}>
    {site.releaseReady ? <a href={site.releaseRepository + '/releases/latest'} className="hd-island download-glass github-download"><GlassSurface /><PlatformIcon platform="github" /><span>{c.download[2]}</span></a> : <button className="hd-island download-glass" disabled data-release-pending><GlassSurface /><PlatformIcon platform="github" /><span>GitHub · {c.download[12]}</span></button>}
    <ol data-glass-content="" className="st-steps">{c.download.slice(5, 9).map((text, i) => { const Icon = installIcons[i]; return <li key={i}><span className="st-step-icon"><Icon size={16} /></span><span><b>{c.stage[10 + i]}</b><small>{text}</small></span></li> })}</ol>
    </div>
  </div>
}

function Caption({ c, index }: { c: Copy; index: number }) {
  const [, title, body, kicker] = c.scenes[index]
  const layout = index === 0 ? 'hero' : index === 7 ? 'center' : 'side'
  const lines = title.split('\n')
  return <section className={`st-caption st-caption-${layout}`} data-act={index} aria-labelledby={`st-title-${index}`}>
    <div data-glass-content="" className="st-index"><span className="st-num">{String(index + 1).padStart(2, '0')}</span><span className="st-rule"><i /></span><span className="st-kicker">{kicker}</span></div>
    <h2 data-glass-content="" id={`st-title-${index}`} aria-label={title.replace('\n', ' ')}>{lines.map((line, i) => <span className="st-line" key={i} aria-hidden="true"><span>{line}</span></span>)}</h2>
    <p data-glass-content="" className="st-body">{body}</p>
    {index === 0 && <div className="cinema-actions st-extra"><a href="#get" className="hd-island download-glass hero-download"><GlassSurface /><span>{c.nav[4]}</span><ArrowDown size={16} /></a><a href="#search" className="quiet-link">{c.nav[0]}<ChevronRight size={16} /></a></div>}
    {index === 4 && <div className="st-extra"><Keys keys={[isMac ? 'Option' : 'Alt', 'Shift', 'A']} name="keys-aide" /></div>}
    {index === 5 && <p data-glass-content="" className="st-hint st-extra">{c.settings[11]}</p>}
    {index === 8 && <div className="st-extra"><Downloads c={c} /></div>}
  </section>
}

// Portrait viewports (phones, tablets, narrow windows) use the portrait composition.
function measure() { const mode: Mode = innerWidth <= 760 || innerWidth < innerHeight * .95 ? 'mobile' : 'desktop', w = mode === 'mobile' ? 400 : 1440, h = mode === 'mobile' ? 860 : 900; return { mode, unit: Math.min(innerWidth / w, innerHeight / h) } }
function useLayout(staticMode: boolean) {
  const [layout, setLayout] = useState(measure)
  useEffect(() => { if (staticMode) return; const update = () => setLayout(measure()); addEventListener('resize', update); return () => removeEventListener('resize', update) }, [staticMode])
  return layout
}

/** One complete stage: the camera, browser window, demo screen, drawings and captions. */
function Stage({ c, mode, unit, preview, onPreview, rootRef, frameIndex }: { c: Copy; mode: Mode; unit: number; preview?: ReturnType<typeof usePreviewRuntime>; onPreview?: (controller: PreviewController) => void; rootRef: React.RefObject<HTMLDivElement | null>; frameIndex?: number }) {
  const global = useThemeSnapshot(s => s.preference.activeThemeId), dark = useThemeSnapshot(s => s.resolvedMode === 'dark')
  return <div className="st" ref={rootRef} data-mode={mode} style={{ '--u': unit } as React.CSSProperties}>
    <div data-glass-background="" className="st-backdrop" aria-hidden="true" />
    <Halo />
    <Device c={c}>{preview && onPreview ? <PreviewThemeScope preview={preview} global={{ themeId: global, dark }} onReady={onPreview}><Screen c={c} /></PreviewThemeScope> : <Screen c={c} />}</Device>
    <Overlay c={c} themeHref={localizedPath(isLocale(document.documentElement.lang) ? document.documentElement.lang : "en", "/oria-theme")} />
    <div className="st-layer st-copy">{c.scenes.map((_, i) => frameIndex === undefined || frameIndex === i ? <Caption c={c} index={i} key={i} /> : null)}</div>
  </div>
}

function Rail({ c, act, fills, onNavigate }: { c: Copy; act: number; fills: React.RefObject<HTMLSpanElement[]>; onNavigate: (i: number) => void }) {
  return <nav className="cinema-rail floating-glass" aria-label={c.nav[0]}><GlassSurface /><span className="st-count" aria-hidden="true">{String(act + 1).padStart(2, '0')}<i>/{String(acts.length).padStart(2, '0')}</i></span>{acts.map((id, i) => <a href={'#' + id} key={id} aria-label={c.scenes[i][0]} aria-current={act === i ? 'step' : undefined} onClick={e => { e.preventDefault(); history.replaceState(null, '', '#' + id); onNavigate(i) }}><span className="st-dot"><i ref={el => { if (el) fills.current[i] = el }} /></span>{act === i && <strong>{c.scenes[i][0]}</strong>}</a>)}</nav>
}

export function StoryView({ c }: { c: Copy }) {
  const reduced = useMedia('(prefers-reduced-motion: reduce)')
  return reduced ? <StaticStory c={c} /> : <ScrollStory c={c} />
}

function ScrollStory({ c }: { c: Copy }) {
  const { mode, unit } = useLayout(false)
  const track = useRef<HTMLDivElement>(null), root = useRef<HTMLDivElement>(null), fills = useRef<HTMLSpanElement[]>([])
  const controller = useRef<PreviewController | null>(null), preview = usePreviewRuntime()
  const [act, setAct] = useState(0), actRef = useRef(0)
  const onPreview = useCallback((value: PreviewController) => { controller.current = value }, [])
  const length = mode === 'mobile' ? TOTAL * 10 + 100 : TOTAL * 13 + 100

  useLayoutEffect(() => {
    const story = choreograph({ root: root.current!, mode, unit, preview: () => controller.current, languages, placeholders })
    const render = (t: number) => {
      story.apply(t)
      // Read by the verification script to wait for the smoothed clock to settle.
      ;(window as unknown as { __oriaStoryTime: number }).__oriaStoryTime = t
      fills.current.forEach((el, i) => el.style.setProperty('--fill', String(span(t, i * 10, i * 10 + 10))))
      const next = actAt(t)
      if (next !== actRef.current) { actRef.current = next; setAct(next); document.body.dataset.storyScene = String(next) }
    }
    const raw = motionValue(0), smooth = springValue(raw, { stiffness: 220, damping: 34, restDelta: .00002 })
    const stopScroll = scroll((progress: number) => raw.set(progress), { target: track.current!, offset: ['start start', 'end end'] })
    const first = (() => { const el = track.current!, top = el.getBoundingClientRect().top + scrollY; return Math.min(1, Math.max(0, (scrollY - top) / (el.offsetHeight - innerHeight))) })()
    raw.jump(first); smooth.jump(first); render(first * TOTAL)
    const stopSmooth = smooth.on('change', v => render(v * TOTAL))
    return () => { stopScroll(); stopSmooth(); smooth.destroy(); controller.current?.set(null) }
  }, [mode, unit])

  const navigate = useCallback((i: number, behavior: ScrollBehavior = 'smooth') => {
    const el = track.current!, top = el.getBoundingClientRect().top + scrollY
    scrollTo({ top: top + (el.offsetHeight - innerHeight) * rest[i] / TOTAL, behavior })
  }, [])
  useEffect(() => {
    const syncHash = () => {
      const index = acts.indexOf(location.hash.slice(1) as typeof acts[number])
      if (index >= 0) navigate(index, 'instant')
    }
    const frame = requestAnimationFrame(syncHash)
    addEventListener('hashchange', syncHash)
    addEventListener('popstate', syncHash)
    const click = (e: MouseEvent) => { const a = (e.target as HTMLElement).closest('a'); if (!a || a.closest('.cinema-rail') || a.pathname !== location.pathname || !a.hash) return; const i = acts.indexOf(a.hash.slice(1) as typeof acts[number]); if (i >= 0) { e.preventDefault(); history.replaceState(null, '', a.hash); navigate(i) } }
    document.addEventListener('click', click)
    document.documentElement.classList.add('st-snapping')
    return () => { cancelAnimationFrame(frame); removeEventListener('hashchange', syncHash); removeEventListener('popstate', syncHash); document.removeEventListener('click', click); document.documentElement.classList.remove('st-snapping'); delete document.body.dataset.storyScene }
  }, [navigate])

  const rail = <div id="oria-tab-progress"><Rail c={c} act={act} fills={fills} onNavigate={navigate} /></div>
  return <>{rail}<div className="st-track" ref={track} style={{ height: `${length}svh` }}>
    {acts.map((id, i) => <span className="st-snap" id={id} key={id} style={{ top: `calc(${(rest[i] / TOTAL).toFixed(5)} * (100% - 100svh))` }} />)}
    <div className="st-sticky"><Stage c={c} mode={mode} unit={unit} preview={preview} onPreview={onPreview} rootRef={root} /><div className="cinema-bottom"><span className="product-demo-note">{c.demo[19]} <span>·</span> OriaTab {site.version}</span><span className="cinema-scroll">{c.nav[0]}<ArrowDown size={13} /></span></div></div>
  </div></>
}

/** Reduced motion: every act becomes a still frame of the same stage, mounted as it nears the viewport. */
function StaticStory({ c }: { c: Copy }) {
  const [act, setAct] = useState(0), fills = useRef<HTMLSpanElement[]>([])
  useEffect(() => {
    const observer = new IntersectionObserver(entries => { const visible = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]; if (visible) setAct(Number((visible.target as HTMLElement).dataset.still)) }, { rootMargin: '-20% 0px -45% 0px', threshold: [0, .25, .5] })
    document.querySelectorAll('.st-still').forEach(el => observer.observe(el)); return () => observer.disconnect()
  }, [])
  useEffect(() => { fills.current.forEach((el, i) => el.style.setProperty('--fill', i <= act ? '1' : '0')) }, [act])
  const navigate = (i: number) => document.getElementById(acts[i])?.scrollIntoView({ behavior: 'instant' })
  return <>{<div id="oria-tab-progress"><Rail c={c} act={act} fills={fills} onNavigate={navigate} /></div>}<div className="st-stills">{acts.map((id, i) => <Still c={c} index={i} key={id} />)}</div></>
}
function Still({ c, index }: { c: Copy; index: number }) {
  const ref = useRef<HTMLElement>(null), root = useRef<HTMLDivElement>(null), [visible, setVisible] = useState(index === 0)
  const [{ mode, unit }] = useState(measure)
  useEffect(() => { const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setVisible(true) }, { rootMargin: '600px' }); observer.observe(ref.current!); return () => observer.disconnect() }, [])
  useLayoutEffect(() => { if (!visible || !root.current) return; const story = choreograph({ root: root.current, mode, unit, preview: () => null, languages, placeholders }); story.apply(rest[index]); root.current.querySelectorAll<HTMLElement>('.st-caption').forEach((el) => { const on = Number(el.dataset.act) === index; el.style.opacity = on ? '1' : '0'; el.style.visibility = on ? 'visible' : 'hidden'; el.inert = !on }) }, [visible, index, mode, unit])
  return <section ref={ref} className="st-still" id={acts[index]} data-still={index} aria-label={c.scenes[index][0]}>{visible ? <Stage c={c} mode={mode} unit={unit} rootRef={root} frameIndex={index} /> : <div className="st-still-placeholder"><h2>{c.scenes[index][1]}</h2><p>{c.scenes[index][2]}</p></div>}</section>
}
