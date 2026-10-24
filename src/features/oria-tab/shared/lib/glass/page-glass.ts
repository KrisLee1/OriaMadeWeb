import { elementGlassGeometry } from '@/features/oria-tab/shared/lib/glass/geometry'
import type { LiquidMaterial } from '@/features/oria-tab/shared/lib/glass/model'

/** Send only lens geometry/material to the isolated host. Browser-owned page
 * pixels never enter this iframe, a DOM serializer, or an extension message. */
export function connectPageGlass(material: LiquidMaterial) {
  let disposed = false, raf = 0, stamp = '', sequence = 0
  let surface: HTMLElement | null = null
  const send = (value: object) => window.parent.postMessage(value, '*')
  function update() {
    raf = 0
    if (disposed) return
    const node = document.querySelector<HTMLElement>('.aide-modal > .glass-surface')
    if (surface !== node) { surface?.removeAttribute('data-page-glass'); surface = node; stamp = '' }
    if (!node) { send({ type: 'oriatab.glass.lens', enabled: false }); return }
    const rect = node.getBoundingClientRect()
    if (!rect.width || !rect.height || !node.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) {
      node.removeAttribute('data-page-glass'); send({ type: 'oriatab.glass.lens', enabled: false }); stamp = ''; return
    }
    try {
      const geometry = elementGlassGeometry(node, rect, material)
      // Read the owner's opacity during Popup entry/exit, keeping the browser
      // backdrop in step with the same spring without capturing any page DOM.
      const opacity = Number(getComputedStyle(node.parentElement!).opacity)
      const settled = node.parentElement?.dataset.popupMotion === 'open'
      const value = { settled, left: rect.left, top: rect.top, width: rect.width, height: rect.height, corners: geometry.corners, material, opacity }
      const next = JSON.stringify(value)
      if (stamp !== next) { stamp = next; send({ type: 'oriatab.glass.lens', enabled: true, sequence: ++sequence, ...value }) }
    } catch { node.removeAttribute('data-page-glass'); send({ type: 'oriatab.glass.lens', enabled: false }); stamp = '' }
  }
  const schedule = () => { if (!raf && !disposed) raf = requestAnimationFrame(update) }
  const observer = new MutationObserver(records => {
    if (!surface || records.some(r => r.type === 'childList' || r.target instanceof Element && r.target.contains(surface))) schedule()
  })
  observer.observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['style', 'class', 'data-popup-motion', 'hidden'] })
  const receive = (event: MessageEvent) => {
    if (event.source !== window.parent) return
    if (event.data?.type === 'oriatab.glass.available') { stamp = ''; schedule() }
    if (event.data?.type === 'oriatab.glass.applied' && event.data.sequence === sequence) surface?.setAttribute('data-page-glass', event.data.mode === 'svg' ? 'svg' : 'blur')
  }
  window.addEventListener('message', receive); window.addEventListener('resize', schedule)
  schedule()
  const dispose = () => {
    disposed = true; cancelAnimationFrame(raf); observer.disconnect()
    window.removeEventListener('message', receive); window.removeEventListener('resize', schedule)
    surface?.removeAttribute('data-page-glass'); send({ type: 'oriatab.glass.lens', enabled: false })
  }
  return { dispose, setMaterial(value: LiquidMaterial) { material = value; schedule() } }
}
