'use client'

import {useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode} from 'react'
import {CardArt} from './card-art'
import './feature-tour.css'

type Feature = {title: string; description: string}

export function FeatureTour({features, scenes, reverse, strip = false, children}: {
  features: readonly Feature[]; scenes: readonly string[]; reverse?: boolean; strip?: boolean; children: (index: number, select: (index: number) => void) => ReactNode
}) {
  const [active, setActive] = useState(0)
  const current = useRef(0)
  const progress = useRef(0)
  const track = useRef<HTMLDivElement>(null)
  const pin = useRef<HTMLDivElement>(null)
  const tour = useRef<HTMLDivElement>(null), list = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const pointer = useRef({x:-1,y:-1})
  const demoId = useId()
  function select(index: number) {
    const viewport = track.current!
    current.current = index
    setActive(index)
    const distance = viewport.scrollHeight - viewport.clientHeight
    progress.current = index / (features.length - 1)
    if (distance > 0) viewport.scrollTop = distance * progress.current
  }
  // A scene can add controls below the window. Resize before paint so the
  // browser keeps the same point in the tour, including its two boundaries.
  function fitViewport() {
    const viewport = track.current!, height = pin.current!.offsetHeight + 'px'
    if (viewport.style.getPropertyValue('--tour-viewport') === height) return
    viewport.style.setProperty('--tour-viewport', height)
    viewport.dataset.measured = ''
    viewport.scrollTop = progress.current * (viewport.scrollHeight - viewport.clientHeight)
  }
  useLayoutEffect(() => {
    fitViewport()
    const container = list.current!, card = container.children[active]
    const group = tour.current!, demo = stage.current!
    const windowSurface = strip ? demo.querySelector('.tunnel-demo-window') ?? demo : demo
    const stacked = window.matchMedia('(max-width: 760px)')
    const lastCard = container.lastElementChild!
    const pad = parseFloat(getComputedStyle(container).paddingTop)

    function project() {
      const source = card.getBoundingClientRect()
      const panel = windowSurface.getBoundingClientRect()
      const bounds = group.getBoundingClientRect()
      // Use the two facing edges as the ends of the light. In the stacked
      // layout the same geometry runs vertically, across both full widths.
      const vertical = stacked.matches
      const reverse = !vertical && panel.right <= source.left
      const start = vertical ? source.top : reverse ? source.left : source.right
      const end = vertical ? panel.bottom : reverse ? panel.right : panel.left
      const sourceMin = vertical ? source.left : source.top
      const sourceMax = vertical ? source.right : source.bottom
      const panelMin = vertical ? panel.left : panel.top
      const panelMax = vertical ? panel.right : panel.bottom
      const low = Math.min(sourceMin, panelMin)
      const high = Math.max(sourceMax, panelMax)
      const gapStart = Math.min(start, end)
      const length = Math.abs(start - end)
      const span = Math.max(1, high - low)
      const startAt = start < end ? 0 : 100
      const endAt = 100 - startAt
      function point(axis: number, position: number) {
        const cross = (position - low) / span * 100
        return vertical ? `${cross}% ${axis}%` : `${axis}% ${cross}%`
      }
      function outline(inset: number) {
        const cardInset = (sourceMax - sourceMin) * inset
        const panelInset = (panelMax - panelMin) * inset
        return `polygon(${[
          point(startAt, sourceMin + cardInset), point(endAt, panelMin + panelInset),
          point(endAt, panelMax - panelInset), point(startAt, sourceMax - cardInset),
        ].join(', ')})`
      }
      const light = group.style
      light.setProperty('--ray-x', `${(vertical ? low : gapStart) - bounds.left}px`)
      light.setProperty('--ray-y', `${(vertical ? gapStart : low) - bounds.top}px`)
      light.setProperty('--ray-width', `${vertical ? span : length}px`)
      light.setProperty('--ray-height', `${vertical ? length : span}px`)
      light.setProperty('--ray-outline', outline(0))
      light.setProperty('--ray-inner', outline(.16))

    }

    function alignCard() {
      const bounds = container.getBoundingClientRect()
      const target = card.getBoundingClientRect()
      if (stacked.matches) {
        if (target.left < bounds.left) container.scrollLeft += target.left - bounds.left
        else if (target.right > bounds.right) container.scrollLeft += target.right - bounds.right
      } else if (target.top < bounds.top + pad) {
        container.scrollTop += target.top - bounds.top - pad
      } else if (target.bottom > bounds.bottom - pad) {
        container.scrollTop += target.bottom - bounds.bottom + pad
      }
      project()
    }

    alignCard()
    const resize = new ResizeObserver(alignCard)
    resize.observe(container)
    resize.observe(windowSurface)
    resize.observe(card)
    resize.observe(lastCard)
    container.addEventListener('scroll', project, {passive: true})
    card.addEventListener('transitionend', project)
    return () => {
      resize.disconnect()
      container.removeEventListener('scroll', project)
      card.removeEventListener('transitionend', project)
    }
  },[active, strip])

  useEffect(() => {
    const viewport = track.current!, group = tour.current!
    // The scroll distance lives inside the preview. It adds no space between chapters.
    function sync() {
      const distance = viewport.scrollHeight - viewport.clientHeight
      if (!distance) return
      progress.current = Math.max(0, Math.min(1, viewport.scrollTop / distance))
      const index = Math.round(progress.current * (features.length - 1))
      if (current.current !== index) { current.current = index; setActive(index) }
    }
    function arm() {
      const rect = group.getBoundingClientRect()
      const header = window.innerWidth > 760 ? 76 : 66
      const visible = rect.top >= header - 16 && rect.bottom <= window.innerHeight + 8
      viewport.toggleAttribute('data-scrollable', visible)
    }
    function size() {
      fitViewport()
      arm()
    }
    const observer = new ResizeObserver(size)
    observer.observe(pin.current!)
    viewport.addEventListener('scroll', sync, {passive: true})
    window.addEventListener('scroll', arm, {passive: true})
    window.addEventListener('resize', arm)
    size()
    return () => {
      observer.disconnect()
      viewport.removeEventListener('scroll', sync)
      window.removeEventListener('scroll', arm)
      window.removeEventListener('resize', arm)
    }
  }, [features.length])

  return <><div className="tunnel-tour-track" role="region" aria-label={features.map(f => f.title).join(" · ")} tabIndex={0} ref={track} style={{'--tour-intervals':features.length-1} as CSSProperties}>
    <div className="tunnel-tour-pin" ref={pin}>
    <div ref={tour} className="tunnel-tour" data-reverse={reverse || undefined} data-strip={strip || undefined}>
    <span className="tunnel-tour-ray" aria-hidden="true"/>
    <div className="tunnel-tour-cards" ref={list}>
      {features.map(({title, description}, index) => {
        return <button type="button" key={title} className="tunnel-tour-card tunnel-card"
          aria-pressed={active === index} aria-controls={demoId} aria-description={description}
          onPointerMove={event => {
            if (event.pointerType === 'touch' || (pointer.current.x===event.clientX && pointer.current.y===event.clientY)) return
            pointer.current={x:event.clientX,y:event.clientY}
            select(index)
          }}
          onFocus={()=>select(index)} onClick={()=>select(index)}>
          <CardArt scene={scenes[index]}/>
          <span className="tunnel-tour-card-title">{title}</span>
        </button>
      })}
    </div>
    <div className="tunnel-tour-stage" id={demoId} ref={stage}>
      {children(active, select)}
    </div>
    </div>
    </div>
  </div>
    <div className="workspace-caption">
      {features.map((feature, index) => <p key={feature.title} aria-hidden={index !== active}>
        <strong>{feature.title}</strong>{feature.description}
      </p>)}
    </div></>
}
