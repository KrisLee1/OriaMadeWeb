'use client'

import {useEffect, useRef} from 'react'
import {useOriaTheme} from '@oriatheme/react'

// Canvas 2D adaptation of React Bits DotGrid, David Haz. See docs/MIGRATION.md.
const diameter = 2.6
const pitch = diameter + 22
const radius = 160
const lifetime = 720
type Dot = {x: number; y: number; litAt: number; strength: number; dx: number; dy: number}

export default function TunnelDotGrid() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const {snapshot} = useOriaTheme()
  const primary = snapshot.resolvedTheme.variables['--oria-color-primary']

  useEffect(() => {
    const node = canvas.current!
    const ctx = node.getContext('2d')
    if (!ctx) return
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    const accent = getComputedStyle(node).color
    let dots: Dot[] = [], width = 0, height = 0, frame = 0, lastDraw = 0
    let visible = false
    let previous: {x: number; y: number} | undefined

    function reset() {
      cancelAnimationFrame(frame)
      frame = 0
      previous = undefined
      for (const dot of dots) dot.strength = 0
      ctx!.clearRect(0, 0, width, height)
    }

    function resize() {
      reset()
      width = node.clientWidth
      height = node.clientHeight
      const ratio = Math.min(devicePixelRatio || 1, 1.5)
      node.width = Math.round(width * ratio)
      node.height = Math.round(height * ratio)
      ctx!.setTransform(ratio, 0, 0, ratio, 0, 0)
      const cols = Math.ceil(width / pitch), rows = Math.ceil(height / pitch)
      dots = Array.from({length: cols * rows}, (_, index) => ({
        x: (width - (cols - 1) * pitch) / 2 + index % cols * pitch,
        y: (height - (rows - 1) * pitch) / 2 + Math.floor(index / cols) * pitch,
        litAt: 0, strength: 0, dx: 0, dy: 0,
      }))
    }

    function draw(now: number) {
      frame = 0
      if (now - lastDraw < 32) { frame = requestAnimationFrame(draw); return }
      lastDraw = now
      ctx!.clearRect(0, 0, width, height)
      ctx!.fillStyle = accent
      let active = false
      for (const dot of dots) {
        if (!dot.strength) continue
        const remaining = 1 - (now - dot.litAt) / lifetime
        if (remaining <= 0) { dot.strength = 0; continue }
        const light = dot.strength * remaining ** 2
        ctx!.globalAlpha = light * .75
        ctx!.beginPath()
        ctx!.arc(dot.x + dot.dx * light, dot.y + dot.dy * light, diameter / 2 * (1 + light), 0, Math.PI * 2)
        ctx!.fill()
        active = true
      }
      ctx!.globalAlpha = 1
      if (active) frame = requestAnimationFrame(draw)
    }

    function pointer(event: PointerEvent) {
      if (!visible || reduced.matches || document.hidden) return
      const bounds = node.getBoundingClientRect()
      const x = event.clientX - bounds.left, y = event.clientY - bounds.top
      if (x < 0 || y < 0 || x > width || y > height) { leave(); return }
      const dx = previous ? x - previous.x : 0, dy = previous ? y - previous.y : 0
      if (previous && !dx && !dy && event.type !== 'pointerdown') return
      previous = {x, y}
      const now = performance.now()
      for (const dot of dots) {
        const distance = Math.hypot(dot.x - x, dot.y - y)
        if (distance >= radius) continue
        const strength = (1 - distance / radius) ** 1.4
        const lingering = dot.strength * Math.max(0, 1 - (now - dot.litAt) / lifetime) ** 2
        if (strength < lingering) continue
        dot.litAt = now
        dot.strength = strength
        dot.dx = Math.max(-7, Math.min(7, dx * .16))
        dot.dy = Math.max(-7, Math.min(7, dy * .16))
      }
      if (!frame) frame = requestAnimationFrame(draw)
    }

    function leave() { previous = undefined }
    const resizeObserver = new ResizeObserver(resize)
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (!visible) reset()
    })
    resizeObserver.observe(node)
    intersection.observe(node)
    window.addEventListener('pointermove', pointer, {passive: true})
    window.addEventListener('pointerdown', pointer, {passive: true})
    window.addEventListener('scroll', leave, {passive: true})
    document.documentElement.addEventListener('pointerleave', leave)
    window.addEventListener('blur', reset)
    document.addEventListener('visibilitychange', reset)
    reduced.addEventListener('change', reset)
    return () => {
      reset()
      resizeObserver.disconnect()
      intersection.disconnect()
      window.removeEventListener('pointermove', pointer)
      window.removeEventListener('pointerdown', pointer)
      window.removeEventListener('scroll', leave)
      document.documentElement.removeEventListener('pointerleave', leave)
      window.removeEventListener('blur', reset)
      document.removeEventListener('visibilitychange', reset)
      reduced.removeEventListener('change', reset)
    }
  }, [primary])

  return <canvas ref={canvas} className="tunnel-dots" aria-hidden="true"/>
}
