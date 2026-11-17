import {useEffect, useRef, type RefObject} from 'react'
import type {Locale} from '@/i18n/config'
import type {DemoView} from './demo'
import {DemoPlaybackButton, useDemoPlayback} from './demo-playback'

type Step = {selector: string; delay: number; query?: string; click?: boolean}
const search = '.demo-list-toolbar input'
function filter(text: string): Step[] {
  return [...text].map((_, i) => ({selector: search, query: text.slice(0, i + 1), delay: i === text.length - 1 ? 1100 : 165}))
}
function press(selector: string): Step[] {
  return [{selector, delay: 550}, {selector, click: true, delay: 1000}]
}
const clearSearch: Step = {selector: search, query: '', delay: 450}
const steps: Record<DemoView, Step[]> = {
  map: [...press('[data-zoom=in]'), ...press('[data-zoom=reset]')],
  forwards: [...filter('VNC'), ...press('.demo-start'), ...press('.demo-start'), clearSearch],
  services: [...filter('Nginx'), ...press('.demo-row-checkbox'), ...press('.demo-row-checkbox'), clearSearch],
  hosts: [...filter('lab'), {selector: '.demo-host-meta', delay: 1400}, clearSearch],
  logs: [...filter('VNC'), {selector: '.demo-log-row', delay: 1400}, clearSearch],
}

export function WorkspaceWalkthrough({locale, view, host, setQuery, setPaused}: {
  locale: Locale; view: DemoView; host: RefObject<HTMLDivElement | null>
  setQuery: (value: string) => void; setPaused: (paused: boolean) => void
}) {
  const automatic = useRef(false)
  const highlight = useRef<HTMLElement | null>(null)
  function clear() {
    highlight.current?.removeAttribute('data-guided')
    highlight.current = null
  }
  const {mode, toggle} = useDemoPlayback({
    host, automatic, steps: steps[view], reset() { clear(); setQuery('') }, clear,
    apply(step) {
      const section = host.current?.querySelector('[role=tabpanel]:not([hidden])')
      const target = section?.querySelector<HTMLElement>(step.selector)
      if (!target) return false
      clear()
      highlight.current = target
      target.dataset.guided = ''
      if (step.query !== undefined) setQuery(step.query)
      if (step.click) target.click()
      return true
    },
  })
  useEffect(() => { setPaused(mode !== 'playing') }, [mode, setPaused])
  useEffect(() => clear, [])
  return <span className="workspace-playback" data-playback={mode}><DemoPlaybackButton locale={locale} mode={mode} onClick={toggle}/></span>
}
