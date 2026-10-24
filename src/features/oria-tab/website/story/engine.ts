import { cubicBezier, easeIn, easeOut, easeInOut, backOut } from 'motion'

// A pure function of story time. Every value is recomputed from the scroll position,
// so scrubbing forwards, backwards or jumping between chapters always lands on the same frame.
export type Ease = (p: number) => number
export const ease = {
  linear: (p: number) => p,
  in: easeIn,
  out: easeOut,
  inOut: easeInOut,
  glide: cubicBezier(.16, 1, .3, 1),
  swing: cubicBezier(.65, 0, .35, 1),
  back: backOut,
} satisfies Record<string, Ease>

/** [time, value, easing used to arrive at this key] */
export type Key = readonly [number, number, Ease?]
export type Track = readonly Key[]

export const clamp01 = (p: number) => Math.min(1, Math.max(0, p))
export const span = (t: number, a: number, b: number) => clamp01((t - a) / (b - a))
export const mix = (a: number, b: number, p: number) => a + (b - a) * p

export function sample(track: Track, t: number) {
  if (t <= track[0][0]) return track[0][1]
  for (let i = 1; i < track.length; i++) {
    const [time, value, curve = ease.inOut] = track[i]
    if (t <= time) {
      const [start, from] = track[i - 1]
      return mix(from, value, curve(span(t, start, time)))
    }
  }
  return track[track.length - 1][1]
}

/** Visible between `a` and `d`, fading over `a→b` and `c→d`. */
export const window4 = (a: number, b: number, c: number, d: number, curve: Ease = ease.inOut): Track => [[a, 0], [b, 1, curve], [c, 1], [d, 0, curve]]
export const hold = (value: number): Track => [[0, value]]

type Props = { x?: Track; y?: Track; s?: Track; sx?: Track; sy?: Track; r?: Track; o?: Track; w?: Track; h?: Track }
export type RigOptions = {
  /** Fade direct children instead of the element itself. Opacity on an ancestor would cut glass off from its backdrop. */
  fadeParts?: boolean
  /** Hide from hit testing and assistive technology whenever opacity is zero. */
  inertWhenHidden?: boolean
  /** Center the element on (x, y) instead of using x/y as plain offsets. */
  centered?: boolean
}
export type Effect = (t: number) => void

type Rig = { el: HTMLElement | SVGElement; props: Props; options: RigOptions; last: Record<string, string> }

export class Story {
  rigs: Rig[] = []
  effects: Effect[] = []
  time = -1
  rig(el: Element | null | undefined, props: Props, options: RigOptions = {}) {
    if (el) this.rigs.push({ el: el as HTMLElement, props, options: { centered: true, ...options }, last: {} })
    return this
  }
  /** Runs `fn` with this span's progress whenever it changes; keeps the end states exact after fast jumps. */
  effect(a: number, b: number, fn: (p: number, t: number) => void) {
    let last = NaN
    this.effects.push(t => { const p = span(t, a, b); if (p !== last) { last = p; fn(p, t) } })
    return this
  }
  always(fn: Effect) { this.effects.push(fn); return this }
  apply(t: number) {
    if (t === this.time) return
    this.time = t
    for (const rig of this.rigs) render(rig, t)
    for (const effect of this.effects) effect(t)
  }
}

function set(rig: Rig, el: HTMLElement | SVGElement, name: string, value: string) {
  const key = name + (el === rig.el ? '' : '#' + Array.prototype.indexOf.call(rig.el.children, el))
  if (rig.last[key] === value) return
  rig.last[key] = value
  el.style.setProperty(name, value)
}

function render(rig: Rig, t: number) {
  const { props: p, options, el } = rig
  const v = (track: Track | undefined, fallback: number) => track ? sample(track, t) : fallback
  const x = v(p.x, 0), y = v(p.y, 0), s = v(p.s, 1), sx = v(p.sx, 1), sy = v(p.sy, 1), r = v(p.r, 0), o = clamp01(v(p.o, 1))
  if (p.x || p.y || p.s || p.sx || p.sy || p.r) {
    const center = options.centered ? 'translate(-50%,-50%) ' : ''
    set(rig, el, 'transform', `translate(${x.toFixed(2)}px,${y.toFixed(2)}px) ${center}scale(${(s * sx).toFixed(4)},${(s * sy).toFixed(4)})${r ? ` rotate(${r.toFixed(2)}deg)` : ''}`)
  }
  if (p.w) set(rig, el, 'width', `${v(p.w, 0).toFixed(1)}px`)
  if (p.h) set(rig, el, 'height', `${v(p.h, 0).toFixed(1)}px`)
  if (p.o) {
    const value = o.toFixed(3)
    if (options.fadeParts) for (const child of Array.from(el.children) as HTMLElement[]) set(rig, child, 'opacity', value)
    else set(rig, el, 'opacity', value)
    // Leave visibility inherited when shown so a hidden ancestor still hides this element.
    set(rig, el, 'visibility', o <= .001 ? 'hidden' : '')
    if (options.inertWhenHidden) {
      const hidden = o < .5
      if ((el as HTMLElement).inert !== hidden) { (el as HTMLElement).inert = hidden; hidden ? el.setAttribute('aria-hidden', 'true') : el.removeAttribute('aria-hidden') }
    }
  }
}

/** Measure an element's center in the coordinate space of a scaled layer (its 1440 × 900 design units). */
export function centerIn(el: Element, layer: Element, width: number) {
  const a = el.getBoundingClientRect(), b = layer.getBoundingClientRect(), k = b.width / width
  return { x: (a.left + a.width / 2 - b.left) / k, y: (a.top + a.height / 2 - b.top) / k, w: a.width / k, h: a.height / k }
}
