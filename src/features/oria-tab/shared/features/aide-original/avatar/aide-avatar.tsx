// Original OriaAide motion and artwork; fully transparent props skip rendering.
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react"

import {
  AideMotionEngine,
  aideTouchRegionAt,
  type AideFrame,
  type AideIdleBehavior,
  type AideMotionStatus,
  type AideTouchReaction,
} from "@/features/oria-tab/shared/features/aide-original/avatar/aide-motion-engine"
import { AIDE_DEFAULT_BASE_COLOR } from "@/features/oria-tab/shared/features/aide-original/avatar/aide-appearance"
import { cn } from "@/features/oria-tab/shared/lib/utils"

export { AIDE_DEFAULT_BASE_COLOR } from "@/features/oria-tab/shared/features/aide-original/avatar/aide-appearance"

export interface AideAvatarProps {
  status: AideMotionStatus
  baseColor?: string
  size?: number | string
  speed?: number
  paused?: boolean
  interactive?: boolean
  motion?: "system" | "full" | "reduced"
  idleBehavior?: AideIdleBehavior | "off"
  idleDelay?: number
  idleSeed?: number
  className?: string
  ariaLabel?: string
  decorative?: boolean
}

interface AidePropPalette {
  surface: string
  surfaceAlt: string
  accent: string
  detail: string
}

const THINKING_CLOUD_TONE_CLASS = "fill-white stroke-black"

const ERROR_GLITCH_SLICES = [
  { y: -66, height: 15, direction: 1 },
  { y: -13, height: 17, direction: -1 },
  { y: 38, height: 14, direction: 1 },
] as const

function useSystemReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])

  return reduced
}

function mixHex(from: string, to: string, amount: number) {
  const progress = Math.max(0, Math.min(1, amount))
  const channel = (offset: number) => Math.round(
    Number.parseInt(from.slice(offset, offset + 2), 16)
      + (Number.parseInt(to.slice(offset, offset + 2), 16) - Number.parseInt(from.slice(offset, offset + 2), 16)) * progress,
  ).toString(16).padStart(2, "0")

  return `#${channel(1)}${channel(3)}${channel(5)}`
}

function propSlotTransform(prop: AideFrame["props"][keyof AideFrame["props"]], anchorX: number, anchorY: number) {
  return `translate(${anchorX} ${anchorY + prop.slotY}) scale(${prop.slotScale}) translate(${-anchorX} ${-anchorY})`
}

export function AideAvatar({
  status,
  baseColor,
  size = 160,
  speed = 1,
  paused = false,
  interactive = true,
  motion = "system",
  idleBehavior = "auto",
  idleDelay = 10,
  idleSeed = 0,
  className,
  ariaLabel = "Aide",
  decorative = false,
}: AideAvatarProps) {
  const state = status.state
  const rawId = useId()
  const id = rawId.replace(/:/g, "")
  const systemReducedMotion = useSystemReducedMotion()
  const reducedMotion = motion === "reduced" || (motion === "system" && systemReducedMotion)
  const [engine] = useState(() => new AideMotionEngine(status))
  const clockRef = useRef(0)
  const gazeTargetRef = useRef({ x: 0, y: 0 })
  const gazeRef = useRef({ x: 0, y: 0 })
  const activityAtRef = useRef(0)
  const idleStartedAtRef = useRef<number | null>(null)
  const idleTimeRef = useRef(0)
  const idleBlendRef = useRef(0)
  const touchReactionRef = useRef<(AideTouchReaction & { startedAt: number }) | null>(null)
  const staticReactionTimerRef = useRef<number | null>(null)
  const [frame, setFrame] = useState<AideFrame>(() => engine.sample(0))

  useEffect(() => {
    activityAtRef.current = clockRef.current
    idleStartedAtRef.current = null
    idleTimeRef.current = 0
    idleBlendRef.current = 0
    if (paused || reducedMotion) {
      const staticTime = status.state === "startup"
        ? status.phase === "resolved" ? 0.9 : 0.42
        : status.state === "thinking" && status.phase === "resolved"
        ? 1.1
        : state === "context-summary"
          ? 0.42
        : state === "file-create" || state === "file-read" || state === "file-edit"
          ? 0.68
        : state === "visual-capture"
          ? 0.72
        : state === "data-chart"
          ? 0.86
        : state === "complete"
        ? 1.2
        : state === "error"
          ? 0.7
          : state === "web-search"
            ? 1.05
            : state === "translate"
              ? 0.72
            : 0
      engine.reset(status, clockRef.current, staticTime)
    } else {
      engine.setStatus(status, clockRef.current, {
        gazeX: gazeRef.current.x,
        gazeY: gazeRef.current.y,
      })
    }
    setFrame(engine.sample(clockRef.current, {
      gazeX: gazeRef.current.x,
      gazeY: gazeRef.current.y,
    }))
  }, [paused, reducedMotion, state, idleBehavior, idleDelay, idleSeed, "phase" in status ? status.phase : null])

  useEffect(() => {
    if (state !== "idle" || idleBehavior === "off" || paused || reducedMotion) return
    const registerActivity = () => {
      activityAtRef.current = clockRef.current
    }
    const activityEvents = ["pointermove", "pointerdown", "keydown", "wheel"] as const
    activityEvents.forEach((eventName) => window.addEventListener(eventName, registerActivity, { passive: true }))
    return () => {
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, registerActivity))
    }
  }, [idleBehavior, paused, reducedMotion, state])

  useEffect(() => () => {
    if (staticReactionTimerRef.current !== null) {
      window.clearTimeout(staticReactionTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (paused || reducedMotion) return

    let animationFrame = 0
    let last = performance.now()
    const tick = (now: number) => {
      const delta = Math.min((now - last) / 1000, 0.064)
      last = now
      const clockDelta = delta * Math.max(0.1, speed)
      clockRef.current += clockDelta
      const follow = 1 - Math.exp(-delta * 9)
      gazeRef.current.x += (gazeTargetRef.current.x - gazeRef.current.x) * follow
      gazeRef.current.y += (gazeTargetRef.current.y - gazeRef.current.y) * follow
      const idleEnabled = state === "idle" && idleBehavior !== "off"
      const shouldIdle = idleEnabled && clockRef.current - activityAtRef.current >= Math.max(0, idleDelay)
      if (shouldIdle && idleStartedAtRef.current === null) {
        idleStartedAtRef.current = clockRef.current
        idleTimeRef.current = 0
      }
      if (shouldIdle) idleTimeRef.current += clockDelta
      const idleFollow = 1 - Math.exp(-clockDelta * (shouldIdle ? 4.2 : 7.5))
      idleBlendRef.current += ((shouldIdle ? 1 : 0) - idleBlendRef.current) * idleFollow
      if (!shouldIdle && idleBlendRef.current < 0.001) {
        idleBlendRef.current = 0
        idleStartedAtRef.current = null
        idleTimeRef.current = 0
      }
      const activeReaction = touchReactionRef.current
      const touchReaction = activeReaction
        ? { region: activeReaction.region, elapsed: clockRef.current - activeReaction.startedAt }
        : undefined
      if (touchReaction && touchReaction.elapsed >= 0.76) touchReactionRef.current = null
      setFrame(engine.sample(clockRef.current, {
        gazeX: gazeRef.current.x,
        gazeY: gazeRef.current.y,
        idleBehavior: idleBehavior === "off" ? "auto" : idleBehavior,
        idleTime: idleTimeRef.current,
        idleBlend: idleBlendRef.current,
        idleSeed,
        touchReaction,
      }))
      animationFrame = requestAnimationFrame(tick)
    }
    animationFrame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animationFrame)
  }, [idleBehavior, idleDelay, idleSeed, paused, reducedMotion, speed, state])

  function updateGaze(event: ReactPointerEvent<SVGSVGElement>) {
    if (!interactive || reducedMotion) return
    const bounds = event.currentTarget.getBoundingClientRect()
    gazeTargetRef.current = {
      x: Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2)),
      y: Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2)),
    }
  }

  function resetGaze() {
    gazeTargetRef.current = { x: 0, y: 0 }
  }

  function triggerTouchReaction(region: AideTouchReaction["region"]) {
    if (!interactive || frame.characterOpacity < 0.2) return
    if (staticReactionTimerRef.current !== null) {
      window.clearTimeout(staticReactionTimerRef.current)
      staticReactionTimerRef.current = null
    }

    const startedAt = clockRef.current - 0.025
    touchReactionRef.current = { region, elapsed: 0, startedAt }
    const staticReaction = { region, elapsed: 0.13 } as const
    setFrame(engine.sample(clockRef.current, {
      gazeX: gazeRef.current.x,
      gazeY: gazeRef.current.y,
      touchReaction: paused || reducedMotion ? staticReaction : { region, elapsed: 0.025 },
    }))

    if (paused || reducedMotion) {
      staticReactionTimerRef.current = window.setTimeout(() => {
        touchReactionRef.current = null
        staticReactionTimerRef.current = null
        setFrame(engine.sample(clockRef.current, {
          gazeX: gazeRef.current.x,
          gazeY: gazeRef.current.y,
        }))
      }, 220)
    }
  }

  function reactToPointer(event: ReactPointerEvent<SVGSVGElement>) {
    if (!interactive) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - bounds.left) / bounds.width) * 256 - 128
    const y = ((event.clientY - bounds.top) / bounds.height) * 256 - 128
    const region = aideTouchRegionAt(x, y)
    if (!region) return
    event.preventDefault()
    triggerTouchReaction(region)
  }

  function reactToKeyboard(event: ReactKeyboardEvent<SVGSVGElement>) {
    if (!interactive || (event.key !== "Enter" && event.key !== " ")) return
    event.preventDefault()
    triggerTouchReaction("face")
  }

  const clipId = `aide-clip-${id}`
  const bodyGradientId = `aide-body-${id}`
  const glassLightId = `aide-glass-${id}`
  const rimLightId = `aide-rim-${id}`
  const spinRibbonId = `aide-spin-ribbon-${id}`
  const shadowId = `aide-shadow-${id}`
  const blurId = `aide-blur-${id}`
  const ribbonBlurId = `aide-ribbon-blur-${id}`
  const bulbGradientId = `aide-bulb-${id}`
  const bulbGlowId = `aide-bulb-glow-${id}`
  const bulbDepthId = `aide-bulb-depth-${id}`
  const bulbMetalId = `aide-bulb-metal-${id}`
  const thinkingBubbleDepthId = `aide-thinking-bubble-depth-${id}`
  const errorGlitchClipPrefix = `aide-error-glitch-${id}`
  const successTint = frame.successTint
  const errorTint = frame.errorTint
  const customBaseColor = baseColor && /^#[0-9a-f]{6}$/i.test(baseColor) ? baseColor : null
  const stateColor = (base: string, custom: string, success: string, error: string) => (
    mixHex(
      mixHex(customBaseColor ? custom : base, success, successTint),
      error,
      errorTint,
    )
  )
  const customShade = (mixWith: "#FFFFFF" | "#111112", amount: number) => (
    mixHex(customBaseColor ?? AIDE_DEFAULT_BASE_COLOR, mixWith, amount)
  )
  const propPalette: AidePropPalette = {
    surface: stateColor("#F7F0FF", customShade("#FFFFFF", 0.78), "#E9FFF1", "#FFF1F2"),
    surfaceAlt: stateColor("#EEE1FD", customShade("#FFFFFF", 0.58), "#D7F7E3", "#FFE0E2"),
    accent: stateColor("#DCC5FA", customShade("#FFFFFF", 0.28), "#95DEB0", "#F2A1A7"),
    detail: stateColor("#8E62B9", customShade("#111112", 0.18), "#3A8F5A", "#AE3B45"),
  }
  const characterTransforms = []
  if (frame.characterY !== 0) characterTransforms.push(`translate(0 ${frame.characterY})`)
  if (frame.characterRotation !== 0) characterTransforms.push(`rotate(${frame.characterRotation})`)
  if (frame.characterScaleX !== 1 || frame.characterScale !== 1) {
    characterTransforms.push(`scale(${frame.characterScale * frame.characterScaleX} ${frame.characterScale})`)
  }
  const characterTransform = characterTransforms.length > 0 ? characterTransforms.join(" ") : undefined

  return (
    <svg
      className={cn("aide-avatar block overflow-visible select-none", interactive && "touch-none cursor-pointer", className)}
      width={size}
      height={size}
      viewBox="-128 -128 256 256"
      role={decorative ? undefined : interactive ? "button" : "img"}
      tabIndex={!decorative && interactive ? 0 : undefined}
      aria-label={decorative ? undefined : ariaLabel}
      aria-hidden={decorative || undefined}
      onPointerMove={updateGaze}
      onPointerDown={reactToPointer}
      onPointerLeave={resetGaze}
      onKeyDown={reactToKeyboard}
    >
      <defs>
        <linearGradient id={bodyGradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={stateColor("#E8D4FF", customShade("#FFFFFF", 0.58), "#DDF8E9", "#FFE0E2")} />
          <stop offset="38%" stopColor={stateColor("#D9BEFC", customShade("#FFFFFF", 0.36), "#BCEBCF", "#FFC3C7")} />
          <stop offset="72%" stopColor={stateColor("#CDB0F4", customShade("#FFFFFF", 0.12), "#8DD8AA", "#F4939A")} />
          <stop offset="100%" stopColor={stateColor("#B88FE8", customShade("#111112", 0.1), "#57B979", "#E35D68")} />
        </linearGradient>
        <radialGradient id={glassLightId} cx="0.31" cy="0.18" r="0.77">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.76" />
          <stop offset="34%" stopColor={stateColor("#F6EDFF", customShade("#FFFFFF", 0.78), "#EEFFF5", "#FFF1F2")} stopOpacity="0.28" />
          <stop offset="72%" stopColor={stateColor("#D9B9F8", customShade("#FFFFFF", 0.3), "#A4E5BE", "#F7A9AE")} stopOpacity="0.05" />
          <stop offset="100%" stopColor={stateColor("#8C59C5", customShade("#111112", 0.2), "#2D8D57", "#B93643")} stopOpacity="0.22" />
        </radialGradient>
        <linearGradient id={rimLightId} x1="0.08" y1="0.04" x2="0.92" y2="0.96">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="42%" stopColor={stateColor("#F8EFFF", customShade("#FFFFFF", 0.82), "#EEFFF5", "#FFF0F1")} stopOpacity="0.42" />
          <stop offset="72%" stopColor={stateColor("#C79CEB", customShade("#FFFFFF", 0.2), "#8CD8A9", "#F28B93")} stopOpacity="0.12" />
          <stop offset="100%" stopColor={stateColor("#8753BB", customShade("#111112", 0.24), "#227348", "#A82F3A")} stopOpacity="0.54" />
        </linearGradient>
        <linearGradient id={spinRibbonId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={stateColor("#A96EE0", customShade("#111112", 0.18), "#2EAE68", "#D74753")} stopOpacity="0.18" />
          <stop offset="45%" stopColor={stateColor("#F3E8FF", customShade("#FFFFFF", 0.72), "#D8FFE5", "#FFE2E4")} stopOpacity="0.96" />
          <stop offset="100%" stopColor={stateColor("#C794ED", customShade("#FFFFFF", 0.18), "#64CE8B", "#EF737D")} stopOpacity="0.3" />
        </linearGradient>
        <clipPath id={clipId}>
          <path d={frame.bodyPath} />
        </clipPath>
        {ERROR_GLITCH_SLICES.map((slice, index) => (
          <clipPath id={`${errorGlitchClipPrefix}-${index}`} key={slice.y}>
            <rect x="-128" y={slice.y} width="256" height={slice.height} />
          </clipPath>
        ))}
        <filter id={shadowId} x="-35%" y="-35%" width="170%" height="190%">
          <feDropShadow dx="0" dy="7" stdDeviation="7" floodColor={stateColor("#5E387E", customShade("#111112", 0.55), "#245E3B", "#76242C")} floodOpacity="0.26" />
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor={stateColor("#7B4AA5", customShade("#111112", 0.4), "#347C50", "#9A303A")} floodOpacity="0.18" />
        </filter>
        <filter id={blurId} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter id={ribbonBlurId} x="-30%" y="-80%" width="160%" height="260%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
        <radialGradient id={bulbGradientId} cx="0.36" cy="0.28" r="0.76">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.98" />
          <stop offset="28%" stopColor="#FFF5B8" stopOpacity="0.96" />
          <stop offset="68%" stopColor="#FFE46E" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#F7BD24" stopOpacity="0.94" />
        </radialGradient>
        <linearGradient id={bulbMetalId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFF2BB" />
          <stop offset="46%" stopColor="#D6A32E" />
          <stop offset="100%" stopColor="#F4D879" />
        </linearGradient>
        <filter id={bulbGlowId} x="-110%" y="-110%" width="320%" height="320%">
          <feGaussianBlur stdDeviation="7.5" />
        </filter>
        <filter id={bulbDepthId} x="-45%" y="-45%" width="190%" height="210%">
          <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#B77A00" floodOpacity="0.22" />
          <feDropShadow dx="-2" dy="-2" stdDeviation="2" floodColor="#FFFFFF" floodOpacity="0.38" />
        </filter>
        <filter id={thinkingBubbleDepthId} x="-80%" y="-80%" width="260%" height="260%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.4" floodColor="var(--oria-color-bg, #FFFFFF)" floodOpacity="0.9" />
          <feDropShadow dx="0" dy="1.4" stdDeviation="1.8" floodColor="var(--oria-color-fg, #111112)" floodOpacity="0.18" />
        </filter>
      </defs>

      {frame.props.startup.opacity > 0 && <StartupProp
        frame={frame}
        blurId={blurId}
        bodyGradientId={bodyGradientId}
        rimLightId={rimLightId}
      />}
      <SpinRibbon frame={frame} gradientId={spinRibbonId} blurId={ribbonBlurId} layer="back" />
      <g transform={characterTransform} opacity={frame.characterOpacity}>
        <path d={frame.bodyPath} fill={`url(#${bodyGradientId})`} filter={`url(#${shadowId})`} />
        <g clipPath={`url(#${clipId})`} pointerEvents="none">
          <rect x="-112" y="-112" width="224" height="224" fill={`url(#${glassLightId})`} />
          <ellipse
            cx={frame.shine.x}
            cy={frame.shine.y}
            rx="42"
            ry="16"
            transform={`rotate(-43 ${frame.shine.x} ${frame.shine.y})`}
            fill="#FFFFFF"
            opacity={frame.shine.opacity}
            filter={`url(#${blurId})`}
          />
          <path
            d="M -73 -28 C -50 -49 -37 -62 -25 -83"
            fill="none"
            stroke="#FFFFFF"
            strokeOpacity="0.3"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <ellipse cx="4" cy="88" rx="66" ry="42" fill={stateColor("#7F4AB4", customShade("#111112", 0.34), "#267A49", "#9D303A")} opacity="0.1" filter={`url(#${blurId})`} />
        </g>
        <path d={frame.bodyPath} fill="none" stroke={`url(#${rimLightId})`} strokeWidth="1.8" strokeLinejoin="round" />
        <path d={frame.bodyPath} fill="none" stroke="#FFFFFF" strokeOpacity="0.2" strokeWidth="0.7" strokeLinejoin="round" />

        <g fill="#111112" pointerEvents="none">
          {frame.eyes.map((currentEye, index) => (
            <g key={index} transform={`rotate(${currentEye.rotation} ${currentEye.x} ${currentEye.y})`}>
              <ellipse
                cx={currentEye.x}
                cy={currentEye.y}
                rx={currentEye.rx}
                ry={Math.max(0.8, currentEye.ry * currentEye.openness)}
                opacity={1 - Math.max(currentEye.curve, currentEye.cross)}
              />
              <path
                d={`M ${(currentEye.x - currentEye.rx).toFixed(2)} ${currentEye.y.toFixed(2)} Q ${currentEye.x.toFixed(2)} ${(currentEye.y - currentEye.ry * 0.72).toFixed(2)} ${(currentEye.x + currentEye.rx).toFixed(2)} ${currentEye.y.toFixed(2)}`}
                fill="none"
                stroke="#111112"
                strokeWidth="4.4"
                strokeLinecap="round"
                opacity={currentEye.curve}
              />
              <g
                fill="none"
                stroke="#111112"
                strokeWidth="4.4"
                strokeLinecap="round"
                opacity={currentEye.cross}
              >
                <path
                  d={`M ${(currentEye.x - currentEye.rx * 0.72).toFixed(2)} ${(currentEye.y - currentEye.ry * 0.72).toFixed(2)} L ${(currentEye.x + currentEye.rx * 0.72).toFixed(2)} ${(currentEye.y + currentEye.ry * 0.72).toFixed(2)}`}
                />
                <path
                  d={`M ${(currentEye.x + currentEye.rx * 0.72).toFixed(2)} ${(currentEye.y - currentEye.ry * 0.72).toFixed(2)} L ${(currentEye.x - currentEye.rx * 0.72).toFixed(2)} ${(currentEye.y + currentEye.ry * 0.72).toFixed(2)}`}
                />
              </g>
            </g>
          ))}
          <path
            d={`M ${(-frame.mouth.width / 2).toFixed(2)} ${frame.mouth.y.toFixed(2)} Q 0 ${(frame.mouth.y + frame.mouth.curve).toFixed(2)} ${(frame.mouth.width / 2).toFixed(2)} ${frame.mouth.y.toFixed(2)}`}
            fill="none"
            stroke="#111112"
            strokeWidth="4.2"
            strokeLinecap="round"
            opacity={frame.mouth.opacity}
          />
        </g>

        <TouchReactionEffects frame={frame} palette={propPalette} />

        {frame.props["context-summary"].opacity > 0 && <ContextSummaryProp frame={frame} palette={propPalette} />}
        {frame.props.thinking.opacity > 0 && <ThinkingProp
          frame={frame}
          gradientId={bulbGradientId}
          glowId={bulbGlowId}
          depthId={bulbDepthId}
          metalId={bulbMetalId}
          bubbleDepthId={thinkingBubbleDepthId}
        />}
        {frame.props["web-search"].opacity > 0 && <WebSearchProp frame={frame} palette={propPalette} />}
        {frame.props["visual-capture"].opacity > 0 && <VisualCaptureProp frame={frame} palette={propPalette} />}
        {frame.props["data-chart"].opacity > 0 && <DataChartProp frame={frame} palette={propPalette} />}
        {frame.props["file-create"].opacity > 0 && <FileOperationProp frame={frame} palette={propPalette} mode="create" />}
        {frame.props["file-read"].opacity > 0 && <FileOperationProp frame={frame} palette={propPalette} mode="read" />}
        {frame.props["file-edit"].opacity > 0 && <FileOperationProp frame={frame} palette={propPalette} mode="edit" />}
        {frame.props["dictionary"].opacity > 0 && <DictionaryProp frame={frame} palette={propPalette} />}
        {frame.props["translate"].opacity > 0 && <TranslateProp frame={frame} palette={propPalette} />}
        {frame.props["calculate"].opacity > 0 && <CalculateProp frame={frame} palette={propPalette} />}
        {frame.props["time"].opacity > 0 && <TimeProp frame={frame} palette={propPalette} />}
        <SleepyZs frame={frame} palette={propPalette} />
        <ErrorGlitchEffect
          frame={frame}
          bodyGradientId={bodyGradientId}
          bodyClipId={clipId}
          sliceClipPrefix={errorGlitchClipPrefix}
        />
      </g>
      <SpinRibbon frame={frame} gradientId={spinRibbonId} blurId={ribbonBlurId} layer="front" />
      {frame.props["complete"].opacity > 0 && <CompleteProp frame={frame} />}
    </svg>
  )
}

function ErrorGlitchEffect({
  frame,
  bodyGradientId,
  bodyClipId,
  sliceClipPrefix,
}: {
  frame: AideFrame
  bodyGradientId: string
  bodyClipId: string
  sliceClipPrefix: string
}) {
  const effect = frame.props.error
  const phaseWave = Math.sin(effect.phase * Math.PI * 2)

  return (
    <g data-aide-effect="error-glitch" pointerEvents="none">
      {ERROR_GLITCH_SLICES.map((slice, index) => {
        const offset = slice.direction * effect.opacity * (4.5 + index * 1.35 + phaseWave * 1.2)
        return (
          <g key={slice.y} clipPath={`url(#${sliceClipPrefix}-${index})`}>
            <path
              d={frame.bodyPath}
              fill="#711923"
              opacity={effect.opacity * 0.3}
              transform={`translate(${-offset * 0.46} 0)`}
            />
            <path
              d={frame.bodyPath}
              fill={`url(#${bodyGradientId})`}
              opacity={effect.opacity * 0.78}
              transform={`translate(${offset} 0)`}
            />
            <path
              d={frame.bodyPath}
              fill="none"
              stroke="#FFF4F5"
              strokeWidth="1.4"
              opacity={effect.opacity * 0.5}
              transform={`translate(${offset} 0)`}
            />
          </g>
        )
      })}
      <g clipPath={`url(#${bodyClipId})`}>
        <rect
          x="-112"
          y={effect.y}
          width="224"
          height={1.4 + effect.opacity * 2.2}
          fill="#FFF4F5"
          opacity={effect.glow}
        />
        <rect
          x="-112"
          y={effect.y + 4.6}
          width="224"
          height="1.8"
          fill="#711923"
          opacity={effect.opacity * 0.28}
        />
        <path d={frame.bodyPath} fill="#FFFFFF" opacity={effect.resolve} />
      </g>
    </g>
  )
}

function TouchReactionEffects({ frame, palette }: { frame: AideFrame; palette: AidePropPalette }) {
  const { touch } = frame
  const phase = touch.phase
  const headRise = phase * 13
  const faceRadius = 8 + phase * 22
  const bellySpread = phase * 10

  return (
    <g data-aide-effect="touch-reaction" pointerEvents="none">
      <g opacity={touch.head} fill="#FFFFFF" stroke={palette.accent} strokeWidth="1.6" paintOrder="stroke">
        <path d="M -20 -87 l 2.8 5.4 5.4 2.8 -5.4 2.8 -2.8 5.4 -2.8 -5.4 -5.4 -2.8 5.4 -2.8 Z" transform={`translate(${-phase * 5} ${-headRise}) scale(${0.7 + phase * 0.35})`} />
        <path d="M 18 -91 l 2.2 4.2 4.2 2.2 -4.2 2.2 -2.2 4.2 -2.2 -4.2 -4.2 -2.2 4.2 -2.2 Z" transform={`translate(${phase * 7} ${-headRise * 0.78}) scale(${0.68 + phase * 0.28})`} />
        <circle cx="0" cy={-91 - headRise * 0.55} r={2.3 + phase * 1.2} fill={palette.surface} />
      </g>

      <circle
        cx="0"
        cy="-3"
        r={faceRadius}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={2.4 - phase * 1.1}
        opacity={touch.face * (1 - phase * 0.72)}
      />
      <circle cx="0" cy="-3" r={3.8 + phase * 2} fill={palette.surface} opacity={touch.face * 0.72} />

      <g fill="#F287A4">
        <ellipse cx="-45" cy="14" rx={13 + touch.leftCheek * 2} ry="7" opacity={touch.leftCheek * 0.34} />
        <ellipse cx="45" cy="14" rx={13 + touch.rightCheek * 2} ry="7" opacity={touch.rightCheek * 0.34} />
      </g>
      <g fill="none" stroke="#F06F91" strokeWidth="2.5" strokeLinecap="round">
        <path d="M -56 12 l 6 -2 M -55 17 l 6 -2" opacity={touch.leftCheek * 0.72} />
        <path d="M 56 12 l -6 -2 M 55 17 l -6 -2" opacity={touch.rightCheek * 0.72} />
      </g>

      <g
        fill="none"
        stroke={palette.surface}
        strokeWidth="3"
        strokeLinecap="round"
        opacity={touch.belly * (1 - phase * 0.45)}
      >
        <path d={`M ${-40 - bellySpread} 72 Q ${-51 - bellySpread} 64 ${-55 - bellySpread} 53`} />
        <path d={`M ${40 + bellySpread} 72 Q ${51 + bellySpread} 64 ${55 + bellySpread} 53`} />
        <path d={`M ${-27 - bellySpread * 0.55} 86 Q ${-34 - bellySpread} 82 ${-38 - bellySpread} 74`} opacity="0.72" />
        <path d={`M ${27 + bellySpread * 0.55} 86 Q ${34 + bellySpread} 82 ${38 + bellySpread} 74`} opacity="0.72" />
      </g>
    </g>
  )
}

const SLEEPY_SYMBOLS = [
  { glyph: "z", delay: 0, size: 12, offsetX: 0 },
  { glyph: "z", delay: 0.33, size: 16, offsetX: 5 },
  { glyph: "Z", delay: 0.66, size: 21, offsetX: 11 },
] as const

function SleepyZs({ frame, palette }: { frame: AideFrame; palette: AidePropPalette }) {
  const cycle = (frame.idlePhase * 0.42) % 1

  return (
    <g
      data-aide-effect="sleepy-zzz"
      fill="#111112"
      stroke={palette.surface}
      strokeWidth="2.4"
      paintOrder="stroke"
      fontFamily="ui-rounded, -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
      fontWeight="750"
      pointerEvents="none"
    >
      {SLEEPY_SYMBOLS.map((symbol, index) => {
        const progress = (cycle - symbol.delay + 1) % 1
        const fadeIn = Math.min(1, progress / 0.16)
        const fadeOut = Math.min(1, (1 - progress) / 0.24)
        const opacity = frame.sleepiness * fadeIn * fadeOut * 0.88
        const x = 48 + symbol.offsetX + progress * 19
        const y = -43 - index * 3 - progress * 45
        const scale = 0.68 + progress * 0.42
        const rotation = -8 + progress * 8

        return (
          <text
            key={symbol.delay}
            x={x}
            y={y}
            fontSize={symbol.size}
            opacity={opacity}
            textAnchor="middle"
            dominantBaseline="central"
            transform={`translate(${x} ${y}) rotate(${rotation}) scale(${scale}) translate(${-x} ${-y})`}
          >
            {symbol.glyph}
          </text>
        )
      })}
    </g>
  )
}

const STARTUP_PARTICLES = [
  { x: -66, y: -31, radius: 4.4, color: "#7DD3FC", bend: 14, delay: 0 },
  { x: -37, y: -64, radius: 3.2, color: "#A78BFA", bend: -17, delay: 0.1 },
  { x: 9, y: -72, radius: 4.8, color: "#F9A8D4", bend: 13, delay: 0.2 },
  { x: 51, y: -49, radius: 3.5, color: "#FCD34D", bend: -15, delay: 0.3 },
  { x: 72, y: -5, radius: 4.2, color: "#86EFAC", bend: 18, delay: 0.4 },
  { x: 57, y: 42, radius: 3, color: "#FB923C", bend: -14, delay: 0.5 },
  { x: 19, y: 68, radius: 4.6, color: "#67E8F9", bend: 16, delay: 0.6 },
  { x: -28, y: 59, radius: 3.4, color: "#C4B5FD", bend: -18, delay: 0.7 },
  { x: -62, y: 32, radius: 4.3, color: "#FDA4AF", bend: 15, delay: 0.8 },
  { x: -73, y: -5, radius: 3.1, color: "#FDE68A", bend: -13, delay: 0.9 },
] as const

function StartupProp({
  frame,
  blurId,
  bodyGradientId,
  rimLightId,
}: {
  frame: AideFrame
  blurId: string
  bodyGradientId: string
  rimLightId: string
}) {
  const prop = frame.props.startup
  const resolve = Math.max(0, Math.min(1, prop.resolve))
  const orbFadeProgress = Math.max(0, Math.min(1, (resolve - 0.12) / 0.72))
  const orbOpacity = 1 - (1 - Math.pow(1 - orbFadeProgress, 3))

  return (
    <g transform={propSlotTransform(prop, 0, 0)} pointerEvents="none">
      <circle
        r={20 + prop.glow * 17}
        fill="#FFFFFF"
        opacity={prop.glow * orbOpacity * 0.34}
        filter={`url(#${blurId})`}
      />
      {STARTUP_PARTICLES.map((particle, index) => {
        const life = (prop.phase - particle.delay + 1) % 1
        const progress = life
        const travel = Math.pow(progress, 1.7)
        const angle = Math.atan2(particle.y, particle.x)
        const arc = Math.sin(progress * Math.PI) * particle.bend
        const x = particle.x * (1 - travel) - Math.sin(angle) * arc
        const y = particle.y * (1 - travel) + Math.cos(angle) * arc
        const radius = particle.radius * (1 - travel * 0.62)
        const fadeIn = Math.min(1, progress / 0.12)
        const fadeOut = Math.min(1, (1 - progress) / 0.16)
        const opacity = prop.opacity * fadeIn * fadeOut

        return (
          <g key={particle.color + index} transform={`translate(${x} ${y})`} opacity={opacity}>
            <circle r={radius * 1.8} fill={particle.color} opacity="0.22" filter={`url(#${blurId})`} />
            <circle r={radius} fill={particle.color} />
            <circle cx={-radius * 0.28} cy={-radius * 0.34} r={radius * 0.3} fill="#FFFFFF" opacity="0.68" />
          </g>
        )
      })}
      <g opacity={orbOpacity} transform={`scale(${prop.scale})`}>
        <circle r="15" fill={`url(#${bodyGradientId})`} />
        <circle r="15" fill="none" stroke={`url(#${rimLightId})`} strokeWidth="1.5" />
        <ellipse cx="-4.6" cy="-5.2" rx="5.4" ry="3.1" fill="#FFFFFF" opacity="0.58" transform="rotate(-38 -4.6 -5.2)" />
        <ellipse cx="3" cy="8" rx="8" ry="4.5" fill="#6D3E9C" opacity="0.08" filter={`url(#${blurId})`} />
      </g>
    </g>
  )
}

function SpinRibbon({
  frame,
  gradientId,
  blurId,
  layer,
}: {
  frame: AideFrame
  gradientId: string
  blurId: string
  layer: "back" | "front"
}) {
  const isFront = layer === "front"
  const path = isFront
    ? "M 108 4 C 72 51 -72 51 -108 4"
    : "M -108 4 C -72 -47 72 -47 108 4 C 72 51 -72 51 -108 4"
  const dashOffset = -(frame.spinPhase * 1.42 + (isFront ? 0.16 : 0))
  const opacity = frame.spinTrail * (isFront ? 0.86 : 0.46)

  return (
    <g opacity={opacity} pointerEvents="none">
      <path
        d={path}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={isFront ? 13 : 10}
        strokeLinecap="round"
        pathLength="1"
        strokeDasharray={isFront ? "0.52 0.48" : "0.46 0.54"}
        strokeDashoffset={dashOffset}
        opacity={isFront ? 0.22 : 0.16}
        filter={`url(#${blurId})`}
      />
      <path
        d={path}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={isFront ? 5.6 : 4.2}
        strokeLinecap="round"
        pathLength="1"
        strokeDasharray={isFront ? "0.52 0.48" : "0.46 0.54"}
        strokeDashoffset={dashOffset}
      />
      <path
        d={path}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        strokeLinecap="round"
        pathLength="1"
        strokeDasharray="0.18 0.82"
        strokeDashoffset={dashOffset - 0.08}
        opacity={isFront ? 0.68 : 0.34}
      />
    </g>
  )
}

const CONTEXT_SUMMARY_CARDS = [
  { width: 39, startY: -94, offset: 0 },
  { width: 33, startY: -69, offset: 1 / 3 },
  { width: 43, startY: -44, offset: 2 / 3 },
] as const

function ContextSummaryProp({ frame, palette }: { frame: AideFrame; palette: AidePropPalette }) {
  const prop = frame.props["context-summary"]
  const arrivals = CONTEXT_SUMMARY_CARDS.map((card) => {
    const progress = (prop.phase + card.offset) % 1
    return Math.max(0, 1 - Math.abs(progress - 0.88) / 0.12)
  })
  const arrival = Math.max(...arrivals)
  const noteScale = 1 + arrival * 0.045

  return (
    <g
      data-aide-effect="context-summary"
      transform={propSlotTransform(prop, 0, -66)}
      pointerEvents="none"
    >
      <g opacity={prop.opacity} transform={`translate(0 ${prop.y})`}>
        <path
          d="M -72 -99 C -28 -113 2 -92 35 -75"
          fill="none"
          stroke={palette.detail}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="2 7"
          opacity="0.2"
        />
        {CONTEXT_SUMMARY_CARDS.map((card, index) => {
          const progress = (prop.phase + card.offset) % 1
          const eased = progress * progress * (3 - 2 * progress)
          const x = lerpAvatar(-78, 36, eased)
          const y = lerpAvatar(card.startY, -69, eased) - Math.sin(progress * Math.PI) * 10
          const scale = lerpAvatar(1, 0.3, eased)
          const edgeFade = Math.min(1, progress / 0.08, (1 - progress) / 0.13)
          const height = 17

          return (
            <g
              key={card.startY}
              transform={`translate(${x} ${y}) scale(${scale})`}
              opacity={Math.max(0, edgeFade)}
            >
              <rect
                x={-card.width / 2}
                y={-height / 2}
                width={card.width}
                height={height}
                rx="6"
                fill={index % 2 === 0 ? palette.surface : palette.surfaceAlt}
                stroke="#111112"
                strokeWidth="2.2"
              />
              <path
                d={`M ${-card.width / 2 + 7} -2 H ${card.width / 2 - 7} M ${-card.width / 2 + 7} 3.5 H ${card.width / 2 - 12}`}
                fill="none"
                stroke={palette.detail}
                strokeWidth="1.8"
                strokeLinecap="round"
                opacity="0.56"
              />
            </g>
          )
        })}
        <g transform={`translate(58 -68) scale(${noteScale})`}>
          <rect
            x="-21"
            y="-27"
            width="42"
            height="54"
            rx="10"
            fill={palette.surfaceAlt}
            stroke="#111112"
            strokeWidth="3"
          />
          <path
            d="M -13 -16 H 10 M -13 -8 H 13 M -13 0 H 8 M -13 8 H 12"
            fill="none"
            stroke={palette.detail}
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.7"
          />
          <path
            d="M -5 18 H 5"
            fill="none"
            stroke={palette.accent}
            strokeWidth="3.2"
            strokeLinecap="round"
            opacity={0.62 + arrival * 0.3}
          />
          <path
            d="M -14 -20 C -8 -24 0 -25 6 -23"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.7"
          />
        </g>
      </g>
    </g>
  )
}

function lerpAvatar(from: number, to: number, amount: number) {
  return from + (to - from) * amount
}

function ThinkingProp({
  frame,
  gradientId,
  glowId,
  depthId,
  metalId,
  bubbleDepthId,
}: {
  frame: AideFrame
  gradientId: string
  glowId: string
  depthId: string
  metalId: string
  bubbleDepthId: string
}) {
  const prop = frame.props.thinking
  const center = { x: 59, y: -54 + prop.y * 0.28 }
  const gather = Math.max(0, Math.min(1, prop.resolve))
  const cloudOpacity = Math.max(0, Math.min(1, (0.94 - gather) / 0.24))
  const bulbOpacity = Math.max(0, Math.min(1, (gather - 0.62) / 0.25))
  const activeCloud = {
    x: 69 + Math.cos(prop.phase * 0.42) * 2.4,
    y: -69 + Math.sin(prop.phase * 0.52) * 2 + prop.y * 0.6,
  }
  const cloud = {
    x: activeCloud.x + (center.x - activeCloud.x) * gather,
    y: activeCloud.y + (center.y - activeCloud.y) * gather,
    scale: 1 - gather * 0.72,
    rotation: Math.sin(prop.phase * 0.36) * 2.2 * (1 - gather),
  }
  const cloudScaleX = 1 + Math.sin(prop.phase * 0.7) * 0.028 * (1 - gather)
  const cloudScaleY = 1 + Math.cos(prop.phase * 0.62) * 0.024 * (1 - gather)
  const thoughtBubbles = [
    { x: 39, y: -45, radius: 2.8, phase: 0 },
    { x: 47, y: -53, radius: 4.1, phase: 0.8 },
    { x: 56, y: -60, radius: 5.2, phase: 1.6 },
  ] as const
  return (
    <g transform={propSlotTransform(prop, center.x, center.y)} pointerEvents="none">
      <g opacity={prop.opacity}>
        <g
          data-aide-effect="thinking-bubble-cloud"
          opacity={cloudOpacity}
        >
          <g filter={`url(#${bubbleDepthId})`}>
            {thoughtBubbles.map((bubble) => {
              const pulse = 1 + Math.sin(prop.phase * 1.1 + bubble.phase) * 0.08 * (1 - gather)
              const x = bubble.x + (center.x - bubble.x) * gather
              const y = bubble.y + (center.y - bubble.y) * gather
              const radius = bubble.radius * pulse * (1 - gather * 0.68)
              return (
                <circle
                  key={bubble.x}
                  cx={x}
                  cy={y}
                  r={radius}
                  className={THINKING_CLOUD_TONE_CLASS}
                  strokeWidth="1.8"
                />
              )
            })}
          </g>
          <g
            transform={`translate(${cloud.x} ${cloud.y}) rotate(${cloud.rotation}) scale(${cloud.scale * cloudScaleX} ${cloud.scale * cloudScaleY})`}
            filter={`url(#${bubbleDepthId})`}
          >
            <path
              d="M -22 3 C -27 -3 -24 -11 -17 -14 C -18 -21 -10 -26 -3 -22 C 2 -28 13 -25 16 -19 C 25 -20 30 -12 27 -5 C 33 1 28 10 20 11 C 17 18 7 20 1 15 C -5 20 -16 17 -18 11 C -25 12 -29 7 -22 3 Z"
              className={THINKING_CLOUD_TONE_CLASS}
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            <path
              d="M -13 -11 C -8 -17 1 -19 8 -16"
              className="stroke-black"
              fill="none"
              strokeWidth="2.2"
              strokeLinecap="round"
              opacity="0.16"
            />
          </g>
        </g>

        <g
          opacity={bulbOpacity}
          transform={`translate(${center.x} ${center.y}) scale(${prop.scale}) translate(${-center.x} ${-center.y})`}
        >
        <circle
          cx={center.x}
          cy={center.y - 7}
          r="31"
          fill="#FFD84D"
          opacity={prop.glow * 0.3}
          filter={`url(#${glowId})`}
        />
        <path
          d={`M ${center.x} ${center.y - 29} C ${center.x - 13} ${center.y - 29} ${center.x - 21} ${center.y - 20} ${center.x - 21} ${center.y - 8} C ${center.x - 21} ${center.y + 1} ${center.x - 16} ${center.y + 7} ${center.x - 10} ${center.y + 12} C ${center.x - 8} ${center.y + 14} ${center.x - 7} ${center.y + 17} ${center.x - 7} ${center.y + 20} H ${center.x + 7} C ${center.x + 7} ${center.y + 17} ${center.x + 8} ${center.y + 14} ${center.x + 10} ${center.y + 12} C ${center.x + 16} ${center.y + 7} ${center.x + 21} ${center.y + 1} ${center.x + 21} ${center.y - 8} C ${center.x + 21} ${center.y - 20} ${center.x + 13} ${center.y - 29} ${center.x} ${center.y - 29} Z`}
          fill={`url(#${gradientId})`}
          stroke="#FFFBE7"
          strokeWidth="1.5"
          strokeOpacity="0.82"
          strokeLinejoin="round"
          filter={`url(#${depthId})`}
        />
        <path
          d={`M ${center.x - 10} ${center.y - 19} C ${center.x - 15} ${center.y - 14} ${center.x - 15} ${center.y - 7} ${center.x - 12} ${center.y - 2}`}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3.2"
          strokeLinecap="round"
          opacity="0.68"
        />
        <path
          d={`M ${center.x - 7} ${center.y - 7} Q ${center.x - 3} ${center.y - 1} ${center.x - 3} ${center.y + 11} M ${center.x + 7} ${center.y - 7} Q ${center.x + 3} ${center.y - 1} ${center.x + 3} ${center.y + 11} M ${center.x - 3} ${center.y + 11} H ${center.x + 3}`}
          fill="none"
          stroke="#D69B08"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.62"
        />
        <rect
          x={center.x - 7}
          y={center.y + 20}
          width="14"
          height="5.5"
          rx="2.75"
          fill={`url(#${metalId})`}
        />
        <rect
          x={center.x - 5.5}
          y={center.y + 27}
          width="11"
          height="4.5"
          rx="2.25"
          fill={`url(#${metalId})`}
          opacity="0.9"
        />
        <ellipse
          cx={center.x}
          cy={center.y + 19.5}
          rx="5"
          ry="1.4"
          fill="#FFF8D7"
          opacity="0.72"
        />
        </g>
      </g>
    </g>
  )
}

const WEB_SEARCH_SKELETON = [
  { y: 19, width: 34, delay: 0.02 },
  { y: 25.2, width: 52, delay: 0.13 },
  { y: 31.4, width: 27, delay: 0.24 },
  { y: 37.6, width: 43, delay: 0.35 },
  { y: 43.8, width: 21, delay: 0.46 },
] as const

function WebSearchProp({ frame, palette }: { frame: AideFrame; palette: AidePropPalette }) {
  const prop = frame.props["web-search"]
  const cycleOpacity = prop.phase < 0.86 ? 1 : (1 - prop.phase) / 0.14
  const errorProgress = prop.resolve

  return (
    <g transform={propSlotTransform(prop, 0, 38)} pointerEvents="none">
      <g opacity={prop.opacity} transform={`translate(0 ${prop.y})`}>
      <path
        d="M -42 10 Q -42 6 -38 6 H 38 Q 42 6 42 10 L 37 55 H -37 Z"
        fill="#111112"
        stroke="#111112"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M -35 13 H 35 L 31.5 49 H -31.5 Z" fill={palette.accent} opacity="0.56" />
      <g opacity={Math.max(0, cycleOpacity) * (1 - errorProgress)}>
        {WEB_SEARCH_SKELETON.map((row, index) => {
          const progress = Math.max(0, Math.min(1, (prop.phase - row.delay) / 0.16))
          const reveal = 1 - Math.pow(1 - progress, 3)
          const shimmer = 0.58 + Math.sin((prop.phase * Math.PI * 2 + index * 0.8)) * 0.08

          return (
            <rect
              key={row.y}
              x="-27"
              y={row.y}
              width={row.width * reveal}
              height="3.5"
              rx="1.75"
              fill="#FFFFFF"
              opacity={reveal * shimmer}
            />
          )
        })}
      </g>
      <g
        data-aide-web-search-error="true"
        opacity={errorProgress}
        transform={`translate(0 1) scale(${0.72 + errorProgress * 0.28})`}
      >
        <path
          d="M 0 17 L 15 44 H -15 Z"
          fill="#E35D68"
        />
        <path
          d="M 0 25 V 35"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
        <circle cx="0" cy="39.5" r="1.8" fill="#FFFFFF" />
      </g>
      <path d="M -37 55 H 37" fill="none" stroke="#111112" strokeWidth="4" strokeLinecap="round" />
      <path
        d="M -37 55 H 37 L 51 65 Q 52 66.5 48 67 H -48 Q -52 66.5 -51 65 Z"
        fill={palette.surfaceAlt}
        stroke="#111112"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      <path d="M -27 58 H 27 L 34 62.5 H -34 Z" fill="#111112" opacity="0.18" />
      <path d="M -10 62 H 10 L 14 65 H -14 Z" fill="#FFFFFF" opacity="0.72" />
      <path d="M -49 67 H 49 L 45 70 H -45 Z" fill="#111112" stroke="#111112" strokeWidth="1.8" strokeLinejoin="round" />
      </g>
    </g>
  )
}

function VisualCaptureProp({ frame, palette }: { frame: AideFrame; palette: AidePropPalette }) {
  const prop = frame.props["visual-capture"]
  const scanY = -18 + prop.phase * 36
  const bracketInset = 1.8 + prop.glow * 1.6
  const bracketPath = [
    `M ${-30 + bracketInset} -16 V ${-24 + bracketInset} H ${-22 + bracketInset}`,
    `M ${30 - bracketInset} -16 V ${-24 + bracketInset} H ${22 - bracketInset}`,
    `M ${-30 + bracketInset} 16 V ${24 - bracketInset} H ${-22 + bracketInset}`,
    `M ${30 - bracketInset} 16 V ${24 - bracketInset} H ${22 - bracketInset}`,
  ].join(" ")

  return (
    <g
      data-aide-effect="visual-capture"
      transform={propSlotTransform(prop, 50, 5)}
      pointerEvents="none"
    >
      <g
        opacity={prop.opacity}
        transform={`translate(50 ${5 + prop.y}) rotate(${prop.rotation}) scale(${prop.scale})`}
      >
        <rect
          x="-27"
          y="-21"
          width="54"
          height="42"
          rx="7"
          fill={palette.surfaceAlt}
          fillOpacity="0.9"
          stroke="#111112"
          strokeWidth="2.8"
        />
        <circle cx="14" cy="-10" r="4" fill={palette.accent} opacity="0.9" />
        <path
          d="M -22 15 L -9 2 L 0 10 L 9 1 L 23 15 Z"
          fill={palette.accent}
          opacity="0.72"
        />
        <path
          d={bracketPath}
          fill="none"
          stroke="#111112"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={`M -22 ${scanY.toFixed(2)} H 22`}
          fill="none"
          stroke={palette.detail}
          strokeWidth="2.4"
          strokeLinecap="round"
          opacity="0.32"
        />
        <rect
          x="-27"
          y="-21"
          width="54"
          height="42"
          rx="7"
          fill="#FFFFFF"
          opacity={prop.resolve * 0.82}
        />
        <circle
          cx="0"
          cy="30"
          r="5.5"
          fill={palette.surface}
          stroke="#111112"
          strokeWidth="2.6"
        />
        <circle cx="0" cy="30" r="2" fill={palette.detail} opacity={0.48 + prop.glow * 0.4} />
      </g>
    </g>
  )
}

const DATA_CHART_BARS = [
  { x: -21, height: 18, delay: 0 },
  { x: -7, height: 31, delay: 0.18 },
  { x: 7, height: 24, delay: 0.36 },
  { x: 21, height: 38, delay: 0.54 },
] as const

function DataChartProp({ frame, palette }: { frame: AideFrame; palette: AidePropPalette }) {
  const prop = frame.props["data-chart"]
  const travelX = -22 + prop.phase * 44
  const travelY = 5 - Math.sin(prop.phase * Math.PI) * 20 - prop.phase * 7

  return (
    <g
      data-aide-effect="data-chart"
      transform={propSlotTransform(prop, 54, 14)}
      pointerEvents="none"
    >
      <g
        opacity={prop.opacity}
        transform={`translate(54 ${14 + prop.y}) rotate(${prop.rotation}) scale(${prop.scale})`}
      >
        <rect
          x="-35"
          y="-35"
          width="70"
          height="70"
          rx="12"
          fill={palette.surface}
          fillOpacity="0.94"
          stroke="#111112"
          strokeWidth="3.2"
        />
        <path
          d="M -25 -25 V 24 H 26"
          fill="none"
          stroke="#111112"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.72"
        />
        {DATA_CHART_BARS.map((bar, index) => {
          const pulse = 0.78 + Math.sin((prop.phase + bar.delay) * Math.PI * 2) * 0.18
          const height = bar.height * pulse
          return (
            <rect
              key={bar.x}
              x={bar.x - 4.5}
              y={23 - height}
              width="9"
              height={height}
              rx="2.5"
              fill={index % 2 === 0 ? palette.accent : palette.detail}
              opacity={0.68 + index * 0.07}
            />
          )
        })}
        <path
          d="M -22 5 C -14 -3 -11 -10 -5 -9 C 2 -8 5 1 12 -3 C 18 -7 20 -17 24 -22"
          fill="none"
          stroke="#111112"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeDasharray="82"
          strokeDashoffset={82 * (1 - prop.resolve)}
        />
        <circle
          cx={travelX}
          cy={travelY}
          r={2.8 + prop.glow * 0.7}
          fill="#111112"
          stroke={palette.surfaceAlt}
          strokeWidth="1.6"
        />
        <circle
          cx="25"
          cy="-25"
          r="4.5"
          fill={palette.surfaceAlt}
          stroke="#111112"
          strokeWidth="2.2"
        />
        <path d="M 23 -25 H 27" stroke="#111112" strokeWidth="1.8" strokeLinecap="round" />
      </g>
    </g>
  )
}

function FileOperationProp({
  frame,
  palette,
  mode,
}: {
  frame: AideFrame
  palette: AidePropPalette
  mode: "create" | "read" | "edit"
}) {
  const state = `file-${mode}` as const
  const prop = frame.props[state]
  const scanY = -24 + prop.phase * 50
  const stroke = prop.resolve
  const lineWidths = [30, 38, 25, 34] as const

  return (
    <g
      data-aide-effect={state}
      transform={propSlotTransform(prop, 57, 18)}
      pointerEvents="none"
    >
      <g
        opacity={prop.opacity}
        transform={`translate(57 ${18 + prop.y}) rotate(${prop.rotation}) scale(${prop.scale})`}
      >
        <path
          d="M -29 -42 H 11 L 29 -24 V 42 H -29 Z"
          fill={palette.surface}
          stroke="#111112"
          strokeWidth="3.4"
          strokeLinejoin="round"
        />
        <path
          d="M 11 -42 V -24 H 29"
          fill={palette.surfaceAlt}
          stroke="#111112"
          strokeWidth="3.4"
          strokeLinejoin="round"
        />
        <path
          d="M -20 -33 H 1"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.74"
        />

        {mode === "create" && (
          <>
            {lineWidths.map((width, index) => {
              const reveal = Math.max(0, Math.min(1, prop.phase * 4 - index))
              return (
                <path
                  key={width + index}
                  d={`M -19 ${-16 + index * 11} H ${-19 + width * reveal}`}
                  fill="none"
                  stroke={palette.detail}
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  opacity={0.34 + reveal * 0.5}
                />
              )
            })}
            <g transform="translate(24 35)" opacity={0.58 + prop.glow * 0.38}>
              <circle r="10" fill={palette.accent} stroke="#111112" strokeWidth="2.6" />
              <path d="M -4 0 H 4 M 0 -4 V 4" stroke="#111112" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          </>
        )}

        {mode === "read" && (
          <>
            {lineWidths.map((width, index) => (
              <path
                key={width + index}
                d={`M -19 ${-16 + index * 11} H ${-19 + width}`}
                fill="none"
                stroke={palette.detail}
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.48"
              />
            ))}
            <rect
              x="-23"
              y={scanY - 4}
              width="46"
              height="8"
              rx="4"
              fill={palette.accent}
              opacity={prop.glow * 0.58}
            />
            <path
              d={`M -21 ${scanY} H 21`}
              stroke={palette.detail}
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <g transform={`translate(${18 + Math.sin(prop.phase * Math.PI * 2) * 2} ${18 + prop.phase * 5})`}>
              <circle r="9" fill={palette.surfaceAlt} fillOpacity="0.86" stroke="#111112" strokeWidth="2.8" />
              <path d="M 6.5 6.5 L 14 14" stroke="#111112" strokeWidth="3.4" strokeLinecap="round" />
            </g>
          </>
        )}

        {mode === "edit" && (
          <>
            {lineWidths.slice(0, 3).map((width, index) => (
              <path
                key={width + index}
                d={`M -19 ${-16 + index * 11} H ${-19 + width}`}
                fill="none"
                stroke={palette.detail}
                strokeWidth="3"
                strokeLinecap="round"
                opacity={index === 2 ? 0.32 + prop.glow * 0.42 : 0.46}
              />
            ))}
            <path
              d={`M -18 18 H ${-18 + 36 * stroke}`}
              stroke={palette.accent}
              strokeWidth="5.2"
              strokeLinecap="round"
              opacity="0.86"
            />
            <g transform={`translate(${-17 + 36 * stroke} ${12 + Math.sin(prop.phase * Math.PI) * 3}) rotate(-37)`}>
              <path d="M -17 -4 H 14 L 21 0 L 14 4 H -17 Z" fill={palette.accent} stroke="#111112" strokeWidth="2.6" strokeLinejoin="round" />
              <path d="M 14 -4 L 21 0 L 14 4 Z" fill={palette.surfaceAlt} />
              <path d="M -17 -4 V 4" stroke="#111112" strokeWidth="2.6" strokeLinecap="round" />
            </g>
          </>
        )}
      </g>
    </g>
  )
}

function DictionaryProp({ frame, palette }: { frame: AideFrame; palette: AidePropPalette }) {
  const prop = frame.props.dictionary
  const flip = Math.max(0, Math.min(1, (prop.phase - 0.06) / 0.88))
  const lift = Math.sin(flip * Math.PI)
  const outerX = Math.cos(flip * Math.PI) * 47
  const topY = -5 - lift * 17
  const bottomY = 36 - lift * 7
  const pageOpacity = Math.pow(Math.sin(flip * Math.PI), 0.34)
  const pagePath = `M 0 0 Q ${(outerX * 0.46).toFixed(2)} ${(-13 - lift * 8).toFixed(2)} ${outerX.toFixed(2)} ${topY.toFixed(2)} L ${outerX.toFixed(2)} ${bottomY.toFixed(2)} Q ${(outerX * 0.48).toFixed(2)} ${(29 - lift * 3).toFixed(2)} 0 42 Z`
  const lineStartX = outerX * 0.28
  const lineEndX = outerX * 0.82
  const lineMidX = outerX * 0.56
  const pageFill = flip < 0.5 ? palette.surface : palette.surfaceAlt

  return (
    <g transform={propSlotTransform(prop, 0, 48)} pointerEvents="none">
      <g opacity={prop.opacity} transform={`translate(0 ${29 + prop.y}) rotate(${prop.rotation})`}>
      <path d="M -53 37 Q -27 29 0 42 Q 27 29 53 37" fill="none" stroke="#111112" strokeOpacity="0.18" strokeWidth="7" strokeLinecap="round" />
      <path d="M -53 -4 Q -27 -15 0 0 V 42 Q -27 28 -53 37 Z" fill={palette.surface} stroke="#111112" strokeWidth="3.8" strokeLinejoin="round" />
      <path d="M 53 -4 Q 27 -15 0 0 V 42 Q 27 28 53 37 Z" fill={palette.surfaceAlt} stroke="#111112" strokeWidth="3.8" strokeLinejoin="round" />
      <path d="M -42 8 H -13 M -42 17 H -17 M 13 8 H 42 M 17 17 H 42" stroke={palette.detail} strokeOpacity="0.55" strokeWidth="2.4" strokeLinecap="round" />
      <path
        d={pagePath}
        fill="#111112"
        opacity={lift * 0.14}
        transform={`translate(${((-outerX / 47) * 4).toFixed(2)} 4)`}
      />
      <path
        d={pagePath}
        fill={pageFill}
        stroke="#111112"
        strokeWidth="2.8"
        strokeLinejoin="round"
        opacity={pageOpacity}
      />
      <g
        fill="none"
        stroke={palette.detail}
        strokeWidth="2.1"
        strokeLinecap="round"
        opacity={pageOpacity * Math.min(1, Math.abs(outerX) / 16) * 0.58}
      >
        <path d={`M ${lineStartX.toFixed(2)} ${(8 - lift * 4).toFixed(2)} Q ${lineMidX.toFixed(2)} ${(6 - lift * 5).toFixed(2)} ${lineEndX.toFixed(2)} ${(7 - lift * 3).toFixed(2)}`} />
        <path d={`M ${lineStartX.toFixed(2)} ${(17 - lift * 2).toFixed(2)} Q ${lineMidX.toFixed(2)} ${(15 - lift * 3).toFixed(2)} ${(lineEndX * 0.88).toFixed(2)} ${(16 - lift).toFixed(2)}`} />
      </g>
      <path
        d={`M 0 0 Q ${(outerX * 0.46).toFixed(2)} ${(-13 - lift * 8).toFixed(2)} ${outerX.toFixed(2)} ${topY.toFixed(2)}`}
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity={pageOpacity * 0.76}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path d="M 0 0 V 42" fill="none" stroke="#111112" strokeOpacity="0.34" strokeWidth="2.2" strokeLinecap="round" />
      </g>
    </g>
  )
}

function TranslateProp({ frame, palette }: { frame: AideFrame; palette: AidePropPalette }) {
  const prop = frame.props.translate
  const travel = Math.sin(prop.phase * Math.PI)
  const arrowShift = Math.sin(prop.phase * Math.PI * 2) * 4

  return (
    <g transform={propSlotTransform(prop, 0, 49)} pointerEvents="none">
      <g
        opacity={prop.opacity}
        transform={`translate(0 ${35 + prop.y}) rotate(${prop.rotation}) scale(${prop.scale})`}
      >
        <g transform={`translate(0 ${-travel * 3}) rotate(${-7 + travel * 2} -31 0)`}>
          <rect x="-58" y="-20" width="50" height="43" rx="12" fill={palette.surface} stroke="#111112" strokeWidth="3.4" />
          <path d="M -22 23 L -13 31 L -14 18" fill={palette.surface} stroke="#111112" strokeWidth="3.4" strokeLinejoin="round" />
          <text
            x="-33"
            y="3"
            fill="#111112"
            fontFamily="ui-rounded, -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
            fontSize="25"
            fontWeight="750"
            textAnchor="middle"
            dominantBaseline="central"
          >
            A
          </text>
        </g>
        <g transform={`translate(0 ${travel * 3}) rotate(${7 - travel * 2} 31 4)`}>
          <rect x="8" y="-15" width="50" height="43" rx="12" fill={palette.surfaceAlt} stroke="#111112" strokeWidth="3.4" />
          <path d="M 22 28 L 13 36 L 14 23" fill={palette.surfaceAlt} stroke="#111112" strokeWidth="3.4" strokeLinejoin="round" />
          <text
            x="33"
            y="8"
            fill="#111112"
            fontFamily="ui-rounded, -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
            fontSize="22"
            fontWeight="750"
            textAnchor="middle"
            dominantBaseline="central"
          >
            文
          </text>
        </g>
        <g
          transform={`translate(${arrowShift} 0)`}
          fill="none"
          stroke={palette.detail}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.82"
        >
          <path d="M -10 -4 H 8 L 3 -9" />
          <path d="M 10 8 H -8 L -3 13" />
        </g>
      </g>
    </g>
  )
}

const CALCULATE_PARTICLES = [
  { glyph: "7", delay: 0, dx: -52, rise: 44, rotation: -24, size: 14 },
  { glyph: "+", delay: 0.125, dx: -36, rise: 66, rotation: -16, size: 16 },
  { glyph: "3", delay: 0.25, dx: -18, rise: 82, rotation: -8, size: 13 },
  { glyph: "×", delay: 0.375, dx: 1, rise: 58, rotation: 13, size: 16 },
  { glyph: "9", delay: 0.5, dx: 21, rise: 78, rotation: 18, size: 14 },
  { glyph: "÷", delay: 0.625, dx: 40, rise: 61, rotation: 25, size: 16 },
  { glyph: "=", delay: 0.75, dx: 57, rise: 43, rotation: 30, size: 15 },
  { glyph: "−", delay: 0.875, dx: 68, rise: 66, rotation: 36, size: 16 },
] as const

function CalculateProp({ frame, palette }: { frame: AideFrame; palette: AidePropPalette }) {
  const prop = frame.props.calculate
  return (
    <g transform={propSlotTransform(prop, -53, 25)} pointerEvents="none">
      <g opacity={prop.opacity} transform={`translate(-53 ${23 + prop.y}) rotate(${prop.rotation}) scale(${prop.scale})`}>
      <g
        fill="#111112"
        stroke={palette.surface}
        strokeWidth="2.4"
        strokeLinejoin="round"
        paintOrder="stroke"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
        fontWeight="750"
      >
        {CALCULATE_PARTICLES.map((particle) => {
          const life = (prop.phase - particle.delay + 1) % 1
          const active = life < 0.86
          const progress = active ? life / 0.86 : 1
          const travel = 1 - Math.pow(1 - progress, 3)
          const lift = Math.sin(progress * Math.PI) * 5
          const opacity = active ? Math.sin(progress * Math.PI) * 0.92 : 0
          const scale = 0.68 + Math.sin(progress * Math.PI) * 0.34
          const x = particle.dx * travel
          const y = -27 - particle.rise * travel - lift
          const rotation = particle.rotation * travel

          return (
            <text
              key={particle.glyph}
              x={x}
              y={y}
              fontSize={particle.size}
              opacity={opacity}
              transform={`translate(${x} ${y}) rotate(${rotation}) scale(${scale}) translate(${-x} ${-y})`}
            >
              {particle.glyph}
            </text>
          )
        })}
      </g>
      <rect x="-24" y="-31" width="48" height="66" rx="10" fill="#111112" />
      <rect x="-16" y="-22" width="32" height="12" rx="3" fill={palette.accent} opacity="0.78" />
      {[[-11, 2], [0, 2], [11, 2], [-11, 14], [0, 14], [11, 14], [-11, 26], [0, 26], [11, 26]].map(([x, y], index) => (
        <circle key={index} cx={x} cy={y} r={index / 8 < prop.phase ? 3.4 : 2.6} fill={palette.surface} opacity={0.62 + (index / 8 < prop.phase ? 0.35 : 0)} />
      ))}
      </g>
    </g>
  )
}

function TimeProp({ frame, palette }: { frame: AideFrame; palette: AidePropPalette }) {
  const prop = frame.props.time
  const radians = (prop.phase / 180) * Math.PI
  const handX = -62 + Math.sin(radians) * 16
  const handY = 18 - Math.cos(radians) * 16 + prop.y
  return (
    <g transform={propSlotTransform(prop, -62, 18)} pointerEvents="none">
      <g opacity={prop.opacity}>
        <circle cx="-62" cy={18 + prop.y} r="28" fill={palette.surface} fillOpacity="0.72" stroke="#111112" strokeWidth="4.5" />
        <path d={`M -62 ${18 + prop.y} L ${handX} ${handY}`} stroke="#111112" strokeWidth="4" strokeLinecap="round" />
        <path d={`M -62 ${18 + prop.y} L -49 ${27 + prop.y}`} stroke="#111112" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="-62" cy={18 + prop.y} r="3.2" fill="#111112" />
      </g>
    </g>
  )
}

function CompleteProp({ frame }: { frame: AideFrame }) {
  const prop = frame.props.complete
  return (
    <g transform={propSlotTransform(prop, 65, -50)} pointerEvents="none">
      <g opacity={prop.opacity} transform={`translate(65 ${-50 + prop.y}) scale(${prop.scale})`}>
        <circle r="19" fill="#111112" />
        <path d="M -8 0 L -2 7 L 10 -8" fill="none" stroke="#E9FFF1" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  )
}
