import { animate, svg, type JSAnimation } from 'animejs'
import { Story, ease, span, mix, sample, centerIn, type Track } from '@/features/oria-tab/website/story/engine'
import { captions } from '@/features/oria-tab/website/story/acts'
import { lockClosed } from '@/features/oria-tab/website/story/stage'
import type { PreviewController } from '@/features/oria-tab/website/story/preview-theme'

export type Mode = 'desktop' | 'mobile'
export type Context = {
  root: HTMLElement
  mode: Mode
  /** Pixels per design unit for the viewport-level layers. */
  unit: number
  preview: () => PreviewController | null
  languages: string[]
  placeholders: Record<string, string>
}

const W = 1440, H = 900
// Coordinates are in the 1440 × 900 design space (400 × 860 on phones).
export function choreograph(ctx: Context) {
  const { root, mode, unit } = ctx
  const story = new Story()
  const q = <T extends Element = HTMLElement>(name: string) => root.querySelector<T>(`[data-st="${name}"]`)
  const qa = <T extends Element = HTMLElement>(selector: string) => Array.from(root.querySelectorAll<T>(selector))
  const m = mode === 'mobile'
  const ui = q('ui')!, overlay = root.querySelector<HTMLElement>('.st-overlay')!
  const designW = m ? 400 : W
  root.querySelectorAll('.st-lines, .st-halo-svg').forEach(el => el.setAttribute('viewBox', m ? '0 0 400 860' : `0 0 ${W} ${H}`))

  // ——— Camera: one browser window that the story pushes into and pulls out of. ———
  const camK: Track = m
    ? [[0, .5], [4.6, .5], [8.4, 1, ease.glide], [60, 1], [62.6, .36], [69.6, .36], [72.4, .3], [79.6, .3], [82.4, .3]]
    : [[0, .48], [5, .48], [8.6, 1, ease.glide], [24.8, 1], [25.8, .64], [28.6, .64], [29.8, 1], [38.4, 1], [39.4, .64], [40.8, .64], [42, 1], [60, 1], [62.6, .5], [69.6, .5], [72.4, .24], [79.6, .24], [82.4, .5]]
  const camX: Track = m ? [[0, 0]] : [[0, 0], [24.8, 0], [25.8, 214], [28.6, 214], [29.8, 0], [38.4, 0], [39.4, 214], [40.8, 214], [42, 0], [60, 0], [62.6, 180], [69.6, 180], [72.4, 0], [79.6, 0], [82.4, 200]]
  const camY: Track = m
    ? [[0, 214], [4.6, 214], [8.4, 0, ease.glide], [60, 0], [62.6, 160], [69.6, 160], [72.4, 180], [79.6, 180], [82.4, 760]]
    : [[0, 178], [5, 178], [8.6, 0, ease.glide], [24.8, 0], [25.8, 40], [28.6, 40], [29.8, 0], [38.4, 0], [39.4, 40], [40.8, 40], [42, 0], [60, 0], [62.6, 36], [69.6, 36], [72.4, 80], [79.6, 80], [82.4, 40]]
  const camTilt: Track = m ? [[0, 10], [4.6, 10], [8.4, 0, ease.glide]] : [[0, 16], [5, 16], [8.6, 0, ease.glide]]
  const device = q('device')!
  story.always(t => {
    const k = sample(camK, t), x = sample(camX, t) * unit, y = sample(camY, t) * unit, tilt = sample(camTilt, t)
    device.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)${tilt ? ` perspective(${(1800 * unit).toFixed(0)}px) rotateX(${tilt.toFixed(2)}deg)` : ''} scale(${k.toFixed(4)})`
    const away = Math.min(1, (1 - k) / .2)
    device.style.setProperty('--device-radius', `${(30 * away).toFixed(1)}px`)
    device.style.setProperty('--device-shadow', away.toFixed(3))
    root.style.setProperty('--camera', k.toFixed(4))
  })

  // ——— Browser tabs ———
  const tab = (name: string, x: Track, o: Track, sx?: Track) => story.rig(q(name), { x, o, sx }, { centered: false })
  tab('tab-new', [[0, 76]], [[0, 1]])
  tab('tab-figma', [[0, 254]], [[25.9, 0], [26.3, 1], [26.8, 1], [27.3, 0]], [[25.9, .5], [26.3, 1, ease.back], [26.8, 1], [27.3, .4]])
  tab('tab-mdn', [[26.8, 432], [27.3, 254, ease.swing]], [[26.1, 0], [26.5, 1], [26.9, 1], [27.3, 0]], [[26.1, .5], [26.5, 1, ease.back], [26.9, 1], [27.3, .4]])
  tab('tab-notion', [[26.8, 610], [27.3, 254, ease.swing]], [[26.3, 0], [26.7, 1], [26.9, 1], [27.3, 0]], [[26.3, .5], [26.7, 1, ease.back], [26.9, 1], [27.3, .4]])
  tab('tab-group', [[0, 254]], [[27.1, 0], [27.4, 1], [27.6, 1], [27.8, 0]], [[27.1, .6], [27.4, 1, ease.back]])
  // An article opens in a second tab just before Aide follows you onto the web.
  tab('tab-notes', [[0, 254]], [[38.9, 0], [39.3, 1]], [[38.9, .5], [39.3, 1, ease.back]])
  tab('tab-again', [[0, 432]], [[86.4, 0], [86.9, 1]], [[86.4, .5], [86.9, 1, ease.back]])
  tab('tab-plus', [[0, 256], [25.9, 256], [26.7, 790], [27.3, 382], [27.8, 256], [38.9, 256], [39.3, 434], [86.4, 434], [86.9, 612]], [[0, 1]])
  tab('tab-active', [[0, 76], [39.4, 76], [39.9, 254, ease.glide], [48.4, 254], [48.9, 76, ease.glide], [86.4, 76], [86.9, 432, ease.glide]], [[0, 1]])
  story.rig(q('address-new'), { o: [[0, 1], [39.6, 1], [39.7, 0], [48.6, 0], [48.7, 1]] })
  story.rig(q('address-notes'), { o: [[0, 0], [39.6, 0], [39.7, 1], [48.6, 1], [48.7, 0]] })

  // ——— The third-party page ———
  const article = q('article')!
  story.rig(article, { o: [[0, 0], [39.6, 0], [39.95, 1]] })
  // The browser's own start page gives way to OriaTab as the story begins.
  story.rig(q('native'), { o: [[1, 1], [2.2, 0, ease.inOut]], s: [[1, 1], [2.2, .97]] }, { centered: false })
  story.effect(48.4, 49.8, p => {
    // A circular reveal returns from the webpage to the new tab.
    const aide = centerIn(q('aide')!, ui, designW)
    article.style.clipPath = p <= 0 ? '' : `circle(${((1 - ease.inOut(p)) * 150).toFixed(2)}% at ${(aide.x / designW * 100).toFixed(1)}% ${(aide.y / (m ? 860 : H) * 100).toFixed(1)}%)`
    if (p >= 1) article.style.visibility = 'hidden'; else if (story.time >= 39.95) article.style.visibility = 'visible'
  })
  story.rig(q('selection'), { sx: [[41.6, 0], [43, 1, ease.linear]] }, { centered: false })

  // ——— Dawn paints itself in: sky, a rising sun, mountains, then the lake. ———
  const base = q('wall-base')!.querySelector('svg')!
  const parts = Array.from(base.children).filter(el => !['defs', 'title', 'desc'].includes(el.tagName)) as SVGElement[]
  const reveal = (els: (Element | undefined)[], a: number, b: number, dx: number, dy: number, stagger = 0) => els.forEach((el, i) => {
    if (el) story.rig(el as HTMLElement, { x: [[a + i * stagger, dx], [b + i * stagger, 0, ease.glide]], y: [[a + i * stagger, dy], [b + i * stagger, 0, ease.glide]], o: [[a + i * stagger, 0], [b + i * stagger, 1, ease.out]] }, { centered: false })
  })
  const ridge = Array.from(parts[3]?.children ?? [])
  reveal(parts.slice(0, 3), 1.6, 2.8, 0, -40)
  reveal(ridge.slice(0, 3), 2, 3.9, 0, 300)
  reveal(ridge.slice(3), 2.2, 3.4, 0, 150, .12)
  reveal(parts.slice(4, 8), 2.6, 3.6, 0, 80)
  reveal([parts[8]], 4, 4.6, 0, -20)
  const drawn = Array.from(base.querySelectorAll<SVGGeometryElement>('[clip-path] g[stroke-linecap] path, g[stroke-linecap] path')).slice(0, 60)
  drawn.forEach(el => { el.setAttribute('pathLength', '1'); el.style.strokeDasharray = '1 1' })
  story.effect(3.2, 4.8, p => drawn.forEach((el, i) => { const d = (i % 12) * .04; el.style.strokeDashoffset = String(1 - ease.out(span(p, d, .55 + d))) }))

  // ——— Search ———
  const search = q('search')!
  story.rig(search, {
    x: m ? [[0, 200]] : [[0, 720], [10, 720], [11.8, 880, ease.glide], [18.4, 880], [19.8, 720], [49, 720], [50.4, 860], [60, 860], [61, 720]],
    y: m ? [[0, 560], [10, 560], [11.8, 440, ease.glide], [18.4, 440], [19.8, 560], [49, 560], [50.4, 398], [60, 398], [61, 560]] : [[0, 520], [10, 520], [11.8, 300, ease.glide], [18.4, 300], [19.8, 520], [49, 520], [50.4, 232], [60, 232], [61, 520]],
    w: m ? [[0, 360]] : [[0, 640], [10, 640], [11.8, 600], [18.4, 600], [19.8, 640], [49, 640], [50.4, 520], [60, 520], [61, 640]],
    s: [[3.6, .92], [4.6, 1, ease.back]],
  })
  const shell = search.querySelector<HTMLElement>('.search-shell')!
  story.rig(shell, { o: [[3.6, 0], [4.5, 1], [19.8, 1], [20.5, 0], [49.2, 0], [50.2, 1]] }, { fadeParts: true, centered: false })
  const typed = q('typed')!, placeholder = q('placeholder')!, caret = q('caret')!
  story.always(t => {
    const n = t < 12.2 || t > 19.2 ? 0 : Math.floor(span(t, 12.2, 13.8) * 4.999)
    const text = 'Oria'.slice(0, n)
    if (typed.textContent !== text) typed.textContent = text
    placeholder.style.opacity = n ? '0' : '1'
    caret.style.opacity = t > 11.8 && t < 18.6 ? '1' : '0'
    q('search-icon')!.style.display = n ? 'none' : ''
    q('enter-icon')!.style.display = n ? '' : 'none'
  })
  const engineReel = q('engines')!
  story.effect(13.8, 16.4, p => {
    const steps = 4, at = p * steps, i = Math.floor(at), f = ease.swing(span(at - i, .55, 1))
    engineReel.style.transform = `translateY(calc(${-(Math.min(steps, i + f))} * var(--engine-cell)))`
  })
  const results = q('results')!
  story.rig(results, { o: [[13.6, 0], [14, 1], [17.8, 1], [18.5, 0]], y: [[13.6, -8], [14.4, 0, ease.glide]] }, { centered: false, fadeParts: true })
  story.effect(13.6, 14.8, p => { results.style.clipPath = p >= 1 ? '' : `inset(0 0 ${((1 - ease.glide(p)) * 100).toFixed(1)}% 0 round var(--popup-radius))` })
  story.effect(15.9, 16.5, p => q('result-theme')!.classList.toggle('st-hover', p > 0 && story.time < 18))

  // ——— Dock ———
  const dock = q('dock')!
  story.rig(dock, {
    x: [[0, m ? 200 : 720]],
    y: m ? [[3.8, 880], [4.8, 812, ease.glide], [39.4, 812], [39.9, 980], [48.6, 980], [49.4, 812]] : [[3.8, 850], [4.8, 806, ease.glide], [39.4, 806], [39.9, 1000], [48.6, 1000], [49.4, 806]],
    s: [[3.8, .82], [4.8, 1, ease.back]],
    o: [[3.8, 0], [4.6, 1], [39.6, 1], [39.9, 0], [48.6, 0], [49.1, 1]],
  })
  const dockSize = m ? 30 : 54, gap = m ? 6 : 10
  const slot = (name: string, a: number, b: number) => {
    story.rig(q(`slot-${name}`), { w: [[a, 0], [b, dockSize + gap, ease.glide]] }, { centered: false })
    story.rig(q(`slot-${name}-item`), { o: [[b - .05, 0], [b, 1]] }, { centered: false })
  }
  slot('theme', 17, 17.8); slot('figma', 23.6, 24.4); slot('group', 28, 28.6)
  // A magnification wave sweeps the shelf: a cosine lens like the real Dock.
  const dockItems = () => qa<HTMLElement>('.st-dock .dock-items > .dock-item, .st-dock .dock-items > .st-slot > .dock-item').filter(el => el.offsetWidth > 4 || el.closest('.st-slot')?.clientWidth)
  story.effect(20.6, 23, p => {
    const items = dockItems(), n = items.length, center = mix(-2.6, n + 1.6, p)
    items.forEach((el, i) => { const d = Math.abs(i - center), s = d < 2.4 ? 1 + .42 * (Math.cos(Math.PI * d / 2.4) + 1) / 2 : 1; el.style.transform = s === 1 ? '' : `translateY(${(-(s - 1) * dockSize * .45).toFixed(1)}px) scale(${s.toFixed(3)})` })
  })
  story.effect(29, 30.2, p => { const el = q('dock-aide')!; const b = p <= 0 || p >= 1 ? 0 : Math.abs(Math.sin(p * Math.PI * 3)) * (1 - p) * 16; el.style.transform = b ? `translateY(${-b.toFixed(1)}px)` : '' })

  // ——— Popups open from their Dock source (a Genie-like path) and return to it. ———
  const genie = (el: HTMLElement | null, source: () => HTMLElement | null, home: { x: Track; y: Track }, open: [number, number], close: [number, number] | null, scale: Track = [[0, 1]]) => {
    if (!el) return
    const interactive = el.hasAttribute('data-interactive')
    story.always(t => {
      const p = Math.min(span(t, open[0], open[1]), close ? 1 - span(t, close[0], close[1]) : 1)
      const visible = p > 0
      el.style.visibility = visible ? 'visible' : 'hidden'
      if (interactive) { el.inert = p < 1; if (p < 1) el.setAttribute('aria-hidden', 'true'); else el.removeAttribute('aria-hidden') }
      if (!visible) return
      const hx = sample(home.x, t), hy = sample(home.y, t), hs = sample(scale, t)
      if (p >= 1) { el.style.transform = `translate(${hx}px,${hy}px) translate(-50%,-50%) scale(${hs})`; el.style.opacity = '1'; el.style.clipPath = ''; return }
      const src = source(), from = src ? centerIn(src, ui, designW) : { x: hx, y: hy + 300 }
      const e = ease.glide(p), x = mix(from.x, hx, ease.out(p)), y = mix(from.y, hy, e)
      el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-50%) scale(${mix(.05, hs, e).toFixed(4)},${mix(.02, hs, ease.out(p)).toFixed(4)})`
      el.style.opacity = String(Math.min(1, p * 4))
    })
  }
  genie(q('bookmarks'), () => q('dock-bookmarks'), { x: [[0, m ? 200 : 880]], y: [[0, m ? 572 : 396]] }, [21.4, 22.6], [24.8, 25.6])
  genie(q('aide'), () => q('dock-aide'),
    { x: m ? [[0, 200]] : [[0, 900], [44, 900], [44.1, 1070]], y: m ? [[0, 566], [44, 566], [44.1, 604]] : [[0, 410], [44, 410], [44.1, 470]] }, [30.2, 31.4], [48.6, 49.6])
  genie(q('appearance'), () => q('dock-settings'), { x: [[0, m ? 200 : 860]], y: [[0, m ? 604 : 566]] }, [50.4, 51.6], [59.6, 60.4])
  // Between the two Aide scenes the window collapses into a floating orb and later opens from it on the webpage.
  const aide = q('aide')!, orb = q('aide-orb')!
  const orbX: Track = m ? [[0, 336]] : [[0, 1310]], orbY: Track = m ? [[0, 740]] : [[0, 760]]
  story.rig(orb, { x: orbX, y: orbY, s: [[39.2, .3], [39.8, 1, ease.back], [44.9, 1], [45.4, .3]], o: [[39.2, 0], [39.6, 1], [45, 1], [45.4, 0]] })
  story.effect(38.6, 46, (_, t) => {
    const c = ease.inOut(span(t, 38.6, 39.8)) * (1 - ease.glide(span(t, 44.9, 46)))
    if (!c) { aide.style.translate = aide.style.scale = aide.style.opacity = ''; return }
    const home = t < 44.1 ? (m ? { x: 200, y: 566 } : { x: 900, y: 410 }) : (m ? { x: 200, y: 604 } : { x: 1070, y: 470 })
    aide.style.translate = `${((sample(orbX, t) - home.x) * c).toFixed(1)}px ${((sample(orbY, t) - home.y) * c).toFixed(1)}px`
    aide.style.scale = String((1 - .88 * c).toFixed(4))
    aide.style.opacity = String((1 - span(c, .5, 1)).toFixed(3))
  })
  story.rig(q('transcript-new'), { o: [[0, 1], [42, 1], [42.05, 0]] }, { centered: false })
  story.rig(q('transcript-web'), { o: [[0, 0], [42, 0], [42.05, 1]] }, { centered: false })

  // Aide conversation, streamed in with the scroll.
  const stream = (name: string, a: number, b: number) => {
    const chars = Array.from(q(name)?.children ?? []) as HTMLElement[]
    story.effect(a, b, p => { const n = Math.round(p * chars.length); chars.forEach((ch, i) => { const on = i < n; if (ch.dataset.on !== String(on)) { ch.dataset.on = String(on) } }) })
  }
  story.rig(q('nt-user'), { o: [[31.6, 0], [32, 1]], y: [[31.6, 10], [32, 0, ease.glide]] }, { centered: false })
  stream('nt-reply', 32, 33.6); story.rig(q('nt-rule'), { sx: [[33.6, 0], [34, 1]] }, { centered: false }); stream('nt-detail', 33.8, 35.4)
  qa<HTMLElement>('[data-st="platforms"] > span').forEach((chip, i) => story.rig(chip, { o: [[35.4 + i * .18, 0], [35.7 + i * .18, 1]], y: [[35.4 + i * .18, 8], [35.8 + i * .18, 0, ease.back]] }, { centered: false }))
  story.rig(q('web-quote'), { o: [[45.6, 0], [46, 1]], y: [[45.6, 8], [46, 0]] }, { centered: false })
  story.rig(q('web-user'), { o: [[46, 0], [46.3, 1]], y: [[46, 8], [46.3, 0]] }, { centered: false })
  stream('web-reply', 46.3, 47.3); story.rig(q('web-rule'), { sx: [[47.3, 0], [47.6, 1]] }, { centered: false }); stream('web-detail', 47.6, 48.3)

  // ——— Pointer, drag and context menu ———
  const cursor = q('cursor')!, menu = q('menu')!, submenu = q('submenu')!
  const figTile = () => q('tile-figma'), flyFigma = q('fly-figma')!
  const sel = () => root.querySelector<HTMLElement>('.st-mark-wrap')
  story.always(t => {
    // Drag a bookmark into the Dock.
    const drag = span(t, 23.2, 24.4), visibleDrag = t > 22.8 && t < 24.7
    let cx = 0, cy = 0, show = false
    if (t > 23.15 && t < 24.45) {
      const from = figTile() ? centerIn(figTile()!, ui, designW) : { x: 0, y: 0 }, to = centerIn(q('slot-figma-item')!, ui, designW)
      const e = ease.inOut(drag), x = mix(from.x, to.x, e), y = mix(from.y, to.y, e) - Math.sin(e * Math.PI) * 60
      flyFigma.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-50%) scale(${mix(1.08, .9, e).toFixed(3)})`
      flyFigma.style.visibility = 'visible'
      cx = x + 8; cy = y + 12; show = true
    } else flyFigma.style.visibility = 'hidden'
    if (visibleDrag && !show && figTile()) { const f = centerIn(figTile()!, ui, designW); cx = f.x + 8 + (t < 23.15 ? (23.15 - t) * 80 : 0); cy = f.y + 12; show = true }
    figTile()?.style.setProperty('opacity', t > 23.15 && t < 24.6 ? '.25' : '')
    // Select a sentence, right-click, choose OriaAide → Explain.
    if (t > 41.2 && t < 45.4) {
      const s = sel()
      if (s) {
        const box = centerIn(s, ui, designW), left = box.x - box.w / 2, end = left + box.w
        const pick = span(t, 41.6, 43)
        if (t < 43.8) { cx = mix(left, end, ease.inOut(pick)); cy = box.y + 6 }
        const mx = Math.min(end, designW - (m ? 336 : 360)), my = box.y + 14
        menu.style.transform = `translate(${mx.toFixed(1)}px,${my.toFixed(1)}px)`
        if (t >= 43.8) {
          const oria = q('menu-oria')!.getBoundingClientRect(), exp = q('menu-explain')!.getBoundingClientRect(), base = ui.getBoundingClientRect(), k = base.width / designW
          const ox = (oria.left + oria.width * .45 - base.left) / k, oy = (oria.top + oria.height / 2 - base.top) / k
          const ex = (exp.left + exp.width * .35 - base.left) / k, ey = (exp.top + exp.height / 2 - base.top) / k
          const a = ease.inOut(span(t, 43.8, 44.2)), b = ease.inOut(span(t, 44.4, 44.8))
          cx = mix(mix(end, ox, a), ex, b); cy = mix(mix(box.y + 6, oy, a), ey, b)
        }
        show = true
      }
    }
    const press = (t > 43.2 && t < 43.4) || (t > 44.85 && t < 45.05) ? .86 : 1
    cursor.style.visibility = show ? 'visible' : 'hidden'
    if (show) cursor.style.transform = `translate(${cx.toFixed(1)}px,${cy.toFixed(1)}px) scale(${press})`
  })
  story.rig(menu, { o: [[43.3, 0], [43.5, 1], [45, 1], [45.2, 0]], s: [[43.3, .96], [43.5, 1]] }, { centered: false })
  story.rig(submenu, { o: [[44.15, 0], [44.35, 1]], x: [[44.15, -6], [44.35, 0]] }, { centered: false })
  story.effect(44.4, 44.9, p => q('menu-explain')!.classList.toggle('active', p > .5))
  story.effect(43.8, 44.3, p => q('menu-oria')!.classList.toggle('active', p > .3))

  // ——— Flying shortcuts: a bookmark result and a saved tab group land in the Dock. ———
  const fly = (el: HTMLElement | null, from: () => HTMLElement | null, to: () => HTMLElement | null, a: number, b: number, lift: number, scale: [number, number] = [1, 1]) => {
    if (!el) return
    story.always(t => {
      if (t <= a || t >= b) { el.style.visibility = 'hidden'; return }
      const p = span(t, a, b), f = from(), g = to(); if (!f || !g) return
      const s = centerIn(f, ui, designW), d = centerIn(g, ui, designW), e = ease.inOut(p)
      const x = mix(s.x, d.x, e), y = mix(s.y, d.y, e) - Math.sin(e * Math.PI) * lift
      el.style.visibility = 'visible'
      el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-50%) scale(${mix(scale[0], scale[1], e).toFixed(3)})`
    })
  }
  fly(q('fly-theme'), () => q('result-theme-art')?.firstElementChild as HTMLElement, () => q('slot-theme-item'), 16.5, 17.8, 90, [.6, 1])
  fly(q('fly-group'), () => q('tab-group'), () => q('slot-group-item'), 27.6, 28.6, -40, [1, .5])
  story.rig(q('result-theme-art')?.firstElementChild, { o: [[16.45, 1], [16.5, 0]] }, { centered: false })

  // ——— Appearance: the demo screen previews real OriaTheme presets as you scroll. ———
  const [a5, b5] = [51.5, 57.5]
  const pill = q('theme-pill')!
  story.rig(pill, { x: [[0, m ? 200 : 860]], y: [[0, m ? 338 : 128]], o: [[51.3, 0], [51.7, 1], [57.6, 1], [58, 0]], s: [[51.3, .9], [51.7, 1, ease.back]] })
  const themeName = q('theme-name')!
  story.always(t => {
    const preview = ctx.preview(); if (!preview) return
    const index = t > a5 && t < b5 ? Math.min(preview.sequence.length - 1, Math.floor(span(t, a5, b5) * preview.sequence.length)) : null
    preview.set(index)
    const label = preview.name(index ?? 0)
    if (themeName.textContent !== label) themeName.textContent = label
  })
  const walls = qa<HTMLImageElement>('.st-wall-alt'), wallOrder = [-1, 2, 0, 6, 4, 3, 5, -1]
  story.always(t => {
    const near = t > 48 && t < 60
    walls.forEach((img, i) => {
      if (near && !img.src) img.src = img.dataset.src!
      const at = span(t, a5, b5) * wallOrder.length, slotIndex = wallOrder.indexOf(i)
      const o = slotIndex < 0 || t <= a5 || t >= b5 ? 0 : Math.min(span(at, slotIndex - .2, slotIndex + .15), 1 - span(at, slotIndex + 1 - .2, slotIndex + 1 + .15))
      const value = o.toFixed(3)
      if (img.style.opacity !== value) img.style.opacity = value
    })
  })
  const languageOrder = [...ctx.languages.filter(l => l !== document.documentElement.lang), document.documentElement.lang]
  story.always(t => {
    const typedNow = typed.textContent
    if (typedNow) return
    const i = t > a5 && t < b5 ? Math.floor(span(t, a5, b5) * (languageOrder.length + 1)) - 1 : -1
    const lang = i < 0 || i >= languageOrder.length ? document.documentElement.lang : languageOrder[i]
    const text = ctx.placeholders[lang]
    if (placeholder.textContent !== text) { placeholder.textContent = text; placeholder.lang = lang }
  })

  // ——— The Oria halo: backdrop in the opening, boundary for local data, orbit for the family. ———
  const halo = q<SVGEllipseElement>('halo')!, glow = q<SVGEllipseElement>('halo-glow')!, thin = q<SVGEllipseElement>('halo-thin')!
  const pulseA = q<SVGCircleElement>('pulse-a')!, pulseB = q<SVGCircleElement>('pulse-b')!
  const hx: Track = m ? [[0, 200]] : [[0, 720], [8, 720], [60, 900], [69.6, 900], [72.4, 720]]
  const hy: Track = m ? [[0, 644], [5, 644], [8.4, 430], [60, 590], [69.6, 590], [72.4, 610]] : [[0, 650], [5, 650], [8.4, 470], [60, 486], [69.6, 486], [72.4, 530]]
  const hrx: Track = m ? [[0, 205], [5, 215], [8.4, 520, ease.in], [60, 150], [69.6, 150], [72.4, 168, ease.glide]] : [[0, 600], [5, 640], [8.4, 1100, ease.in], [60, 520], [69.6, 520], [72.4, 400, ease.glide]]
  const hry: Track = m ? [[0, 300], [5, 310], [8.4, 760, ease.in], [60, 190], [69.6, 190], [72.4, 172, ease.glide]] : [[0, 228], [5, 240], [8.4, 520, ease.in], [60, 312], [69.6, 312], [72.4, 168, ease.glide]]
  const hdraw: Track = [[0, .32], [4.4, 1, ease.out], [60, 0], [62.2, 0], [64.6, 1, ease.inOut]]
  const hturn: Track = [[0, .1], [8.4, .36, ease.linear], [62.2, -.2], [64.6, .08, ease.out], [80, .35, ease.linear]]
  const ho: Track = [[0, 1], [5.4, 1], [8.2, 0], [61.8, 0], [62.4, 1], [79.4, 1], [80.4, 0]]
  story.always(t => {
    const o = sample(ho, t)
    for (const el of [halo, glow, thin]) el.style.visibility = o > 0 ? 'visible' : 'hidden'
    if (o <= 0) { pulseA.style.visibility = pulseB.style.visibility = 'hidden'; return }
    const cx = sample(hx, t), cy = sample(hy, t), rx = sample(hrx, t), ry = sample(hry, t), d = sample(hdraw, t), turn = sample(hturn, t)
    for (const [el, grow] of [[halo, 0], [glow, 0], [thin, 14]] as const) { el.setAttribute('cx', cx.toFixed(1)); el.setAttribute('cy', cy.toFixed(1)); el.setAttribute('rx', (rx + grow).toFixed(1)); el.setAttribute('ry', (ry + grow * .6).toFixed(1)) }
    const dash = `${d.toFixed(4)} ${(1.0001 - d).toFixed(4)}`
    halo.style.strokeDasharray = glow.style.strokeDasharray = dash
    halo.style.strokeDashoffset = glow.style.strokeDashoffset = String(-turn)
    thin.style.strokeDasharray = `${(d * .6).toFixed(4)} ${(1.0001 - d * .6).toFixed(4)}`; thin.style.strokeDashoffset = String(turn * .7 - .2)
    halo.style.opacity = String(o); glow.style.opacity = String(o * .5); thin.style.opacity = String(o * .55)
    // Light travels around the orbit in the family act.
    const flow = span(t, 73.6, 79.2)
    for (const [dot, offset] of [[pulseA, 0], [pulseB, .5]] as const) {
      const on = flow > 0 && flow < 1
      dot.style.visibility = on ? 'visible' : 'hidden'
      if (!on) continue
      const angle = (flow * 1.5 + offset) * Math.PI * 2
      dot.setAttribute('cx', (cx + rx * Math.cos(angle)).toFixed(1)); dot.setAttribute('cy', (cy + ry * Math.sin(angle)).toFixed(1))
      dot.style.opacity = String(Math.min(1, flow * 8, (1 - flow) * 8) * o)
    }
  })
  const ringPoint = (t: number, angle: number) => ({ x: sample(hx, t) + sample(hrx, t) * Math.cos(angle), y: sample(hy, t) + sample(hry, t) * Math.sin(angle) })

  // ——— Local first: settings, wallpapers and history flow into this device; the halo closes around it. ———
  const deviceBox = () => {
    const a = device.querySelector('.st-screen')!.getBoundingClientRect(), b = overlay.getBoundingClientRect(), k = b.width / designW
    return { x: (a.left - b.left) / k, y: (a.top - b.top) / k, w: a.width / k, h: a.height / k, chrome: 0 }
  }
  const chips = [0, 1, 2].map(i => q(`local-chip-${i}`)!)
  const chipStart = m ? [[70, 420], [200, 398], [330, 420]] : [[560, 150], [900, 112], [1240, 150]]
  const localPaths = [0, 1, 2].map(i => q<SVGPathElement>(`local-path-${i}`)!)
  const lock = q('local-lock')!, localLabel = q('local-label')!, service = q('service')!, serviceLine = q<SVGPathElement>('service-line')!
  const shackle = q<SVGPathElement>('lock-shackle')!
  const closed = document.createElementNS('http://www.w3.org/2000/svg', 'path'); closed.setAttribute('d', lockClosed)
  const lockAnimation: JSAnimation = animate(shackle, { d: svg.morphTo(closed), autoplay: false, duration: 1000, ease: 'outBack(2)' })
  story.always(t => {
    const active = t > 60.4 && t < 70.4
    for (const el of [lock, localLabel, service, serviceLine, ...localPaths, ...chips]) el.style.visibility = active ? 'visible' : 'hidden'
    if (!active) return
    const box = deviceBox(), cx = box.x + box.w / 2, top = box.y - box.chrome
    const fade = 1 - span(t, 69.2, 70.2)
    localPaths.forEach((path, i) => {
      const [x, y] = chipStart[i]
      path.setAttribute('d', `M${x} ${y + 24} C ${x} ${y + 110}, ${cx} ${top - 130}, ${cx} ${top + 50}`)
      path.style.strokeDashoffset = String(1 - ease.inOut(span(t, 61.8 + i * .2, 63 + i * .2)))
      path.style.opacity = String(1 - span(t, 64.6, 65.2))
      const travel = ease.inOut(span(t, 62.8 + i * .35, 64.2 + i * .35)), len = path.getTotalLength(), pt = path.getPointAtLength(len * travel)
      const appear = ease.back(span(t, 61.2 + i * .2, 61.8 + i * .2))
      chips[i].style.transform = `translate(${pt.x.toFixed(1)}px,${pt.y.toFixed(1)}px) translate(-50%,-50%) scale(${(appear * mix(1, .3, ease.in(travel))).toFixed(3)})`
      chips[i].style.opacity = String(travel > .92 ? 1 - span(travel, .92, 1) : appear)
    })
    const lockAt = ringPoint(t, -Math.PI * .28)
    lock.style.transform = `translate(${lockAt.x.toFixed(1)}px,${lockAt.y.toFixed(1)}px) translate(-50%,-50%) scale(${ease.back(span(t, 64.8, 65.4)).toFixed(3)})`
    lock.style.opacity = String(fade)
    lockAnimation.seek(span(t, 65.5, 66.2) * 1000)
    localLabel.style.transform = `translate(${cx.toFixed(1)}px,${(box.y + box.h + 34).toFixed(1)}px) translate(-50%,-50%)`
    localLabel.style.opacity = m ? '0' : String(Math.min(span(t, 65.2, 65.8), fade))
    // The one way out: only when you use an online feature, to the service you chose.
    const from = ringPoint(t, m ? Math.PI * .5 : Math.PI * .22), to = m ? { x: from.x, y: from.y + 14 } : { x: from.x + 70, y: from.y + 60 }
    serviceLine.setAttribute('d', `M${from.x.toFixed(1)} ${from.y.toFixed(1)} C ${(from.x + 30).toFixed(1)} ${(from.y + 10).toFixed(1)}, ${to.x.toFixed(1)} ${(to.y - 30).toFixed(1)}, ${to.x.toFixed(1)} ${to.y.toFixed(1)}`)
    serviceLine.style.strokeDashoffset = String(1 - ease.inOut(span(t, 66.6, 67.2))); serviceLine.style.opacity = String(fade)
    service.style.transform = `translate(${to.x.toFixed(1)}px,${(to.y + 30).toFixed(1)}px) translate(-50%,-50%) scale(${ease.back(span(t, 67, 67.5)).toFixed(3)})`
    service.style.opacity = String(Math.min(span(t, 67, 67.4), fade))
  })
  story.rig(q('device-glow'), { o: [[63.6, 0], [64.6, 1], [65.6, 0]] }, { centered: false })

  // ——— Oria family: OriaTheme and OriaAide ride the halo around OriaTab. ———
  const famTheme = q('family-theme')!, famAide = q('family-aide')!, famLabel = q('family-label')!
  story.always(t => {
    const active = t > 70.6 && t < 80.4
    for (const el of [famTheme, famAide, famLabel]) el.style.visibility = active ? 'visible' : 'hidden'
    famTheme.inert = famAide.inert = !(t > 73.8 && t < 79.6)
    if (!active) return
    const box = deviceBox(), fade = 1 - span(t, 79.4, 80.2)
    const drift = span(t, 72.4, 79.6) * .18
    const card = (el: HTMLElement, angle: number, a: number) => {
      const at = m ? { x: angle > Math.PI / 2 ? 106 : 294, y: 818 } : ringPoint(Math.max(t, 72.4), angle + drift), s = mix(.86, 1, ease.back(span(t, a, a + .7)))
      el.style.transform = `translate(${at.x.toFixed(1)}px,${at.y.toFixed(1)}px) translate(-50%,-50%) scale(${s.toFixed(3)})`
      el.style.opacity = String(Math.min(span(t, a, a + .4), fade))
    }
    card(famTheme, m ? Math.PI * .62 : Math.PI * .97, 73); card(famAide, m ? Math.PI * .38 - drift * 2 : Math.PI * .03 - drift * 2, 73.3)
    famLabel.style.transform = `translate(${(box.x + box.w / 2).toFixed(1)}px,${(box.y + box.h + 28).toFixed(1)}px) translate(-50%,-50%)`
    famLabel.style.opacity = String(Math.min(span(t, 72.6, 73.2), fade))
  })

  // ——— Captions: lines rise out of a mask; the chapter rule fills as the act plays. ———
  qa<HTMLElement>('.st-caption').forEach(el => {
    const [a, b, c, d] = captions[Number(el.dataset.act)]
    story.rig(el, { o: [[a, 0], [a + .3, 1], [c, 1], [d, 0]], y: [[c, 0], [d, -16, ease.in]] }, { centered: false, inertWhenHidden: true })
    el.querySelectorAll<HTMLElement>('.st-line>span').forEach((line, j) => story.rig(line, { y: [[a + j * .14, m ? 56 : 84], [b + j * .14, 0, ease.glide]] }, { centered: false }))
    story.rig(el.querySelector('.st-body'), { o: [[a + .3, 0], [b + .2, 1]], y: [[a + .3, 14], [b + .2, 0, ease.glide]] }, { centered: false })
    story.rig(el.querySelector('.st-extra'), { o: [[a + .5, 0], [b + .4, 1]], y: [[a + .5, 14], [b + .4, 0, ease.glide]] }, { centered: false })
    story.rig(el.querySelector('.st-rule>i'), { sx: [[a, 0], [d, 1, ease.linear]] }, { centered: false })
  })
  // Keyboard shortcut for Aide in the webpage act.
  for (const i of [0, 1, 2]) story.rig(q(`keys-aide-${i}`), { y: [[47 + i * .08, 0], [47.1 + i * .08, 3], [47.6, 3], [47.7, 0]] }, { centered: false })
  // Install steps light up one after another.
  const steps = qa<HTMLElement>('.st-steps li')
  story.always(t => steps.forEach((li, i) => { const on = t > 83 + i * .85; if (li.dataset.on !== String(on)) li.dataset.on = String(on) }))
  return story
}

export { W, H }
