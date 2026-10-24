// Ported from OriaAide without changing the motion/rendering implementation.
export const AIDE_STATES = [
  "startup",
  "idle",
  "context-summary",
  "thinking",
  "web-search",
  "visual-capture",
  "data-chart",
  "file-create",
  "file-read",
  "file-edit",
  "dictionary",
  "translate",
  "calculate",
  "time",
  "complete",
  "error",
] as const

export type AideState = (typeof AIDE_STATES)[number]

export const AIDE_STARTUP_PHASES = ["active", "resolved"] as const

export type AideStartupPhase = (typeof AIDE_STARTUP_PHASES)[number]

export const AIDE_THINKING_PHASES = ["active", "resolved"] as const

export type AideThinkingPhase = (typeof AIDE_THINKING_PHASES)[number]

export const AIDE_WEB_SEARCH_PHASES = ["active", "error"] as const

export type AideWebSearchPhase = (typeof AIDE_WEB_SEARCH_PHASES)[number]

export const AIDE_IDLE_BEHAVIORS = [
  "auto",
  "look-around",
  "stretch",
  "bounce",
  "sleepy",
  "curious",
  "sway",
] as const

export type AideIdleBehavior = (typeof AIDE_IDLE_BEHAVIORS)[number]

export const AIDE_TOUCH_REGIONS = [
  "head",
  "face",
  "left-cheek",
  "right-cheek",
  "belly",
] as const

export type AideTouchRegion = (typeof AIDE_TOUCH_REGIONS)[number]

export interface AideTouchReaction {
  region: AideTouchRegion
  elapsed: number
}

export type AideMotionStatus =
  | { state: "startup"; phase: AideStartupPhase }
  | { state: "thinking"; phase: AideThinkingPhase }
  | { state: "web-search"; phase: AideWebSearchPhase }
  | { state: Exclude<AideState, "startup" | "thinking" | "web-search"> }

const PROFILE_SAMPLES = 64
const TAU = Math.PI * 2

export interface AideEyePose {
  x: number
  y: number
  rx: number
  ry: number
  rotation: number
  openness: number
  curve: number
  cross: number
}

export interface AidePropPose {
  opacity: number
  phase: number
  resolve: number
  glow: number
  y: number
  rotation: number
  scale: number
  slotY: number
  slotScale: number
}

export interface AideTouchPose {
  head: number
  face: number
  leftCheek: number
  rightCheek: number
  belly: number
  phase: number
}

type AidePropState = Exclude<AideState, "idle">

export interface AidePose {
  radii: number[]
  rotation: number
  characterOpacity: number
  characterScale: number
  characterScaleX: number
  characterY: number
  characterRotation: number
  touch: AideTouchPose
  sleepiness: number
  idlePhase: number
  successTint: number
  errorTint: number
  spinPhase: number
  spinTrail: number
  eyes: [AideEyePose, AideEyePose]
  mouth: {
    y: number
    width: number
    curve: number
    opacity: number
  }
  shine: {
    x: number
    y: number
    opacity: number
  }
  props: Record<AidePropState, AidePropPose>
}

export interface AideFrame extends AidePose {
  status: AideMotionStatus
  state: AideState
  bodyPath: string
}

export interface AideSampleInput {
  gazeX?: number
  gazeY?: number
  idleBehavior?: AideIdleBehavior
  idleTime?: number
  idleBlend?: number
  idleSeed?: number
  touchReaction?: AideTouchReaction
}

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
}

function lerp(from: number, to: number, amount: number) {
  return from + (to - from) * amount
}

function easeOutQuint(value: number) {
  return 1 - Math.pow(1 - clamp(value), 5)
}

function easeInOutCubic(value: number) {
  const progress = clamp(value)
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2
}

function easeOutBack(value: number) {
  const progress = clamp(value)
  if (progress === 0 || progress === 1) return progress
  const overshoot = 1.70158
  return 1 + (overshoot + 1) * Math.pow(progress - 1, 3) + overshoot * Math.pow(progress - 1, 2)
}

function pulseEnvelope(time: number, start: number, duration: number) {
  if (time <= start || time >= start + duration) return 0
  return Math.sin(((time - start) / duration) * Math.PI)
}

const IDLE_BODY_BEHAVIORS = ["stretch", "bounce", "sway"] as const
const IDLE_FACE_BEHAVIORS = ["look-around", "sleepy", "curious"] as const

type IdleBodyBehavior = (typeof IDLE_BODY_BEHAVIORS)[number]
type IdleFaceBehavior = (typeof IDLE_FACE_BEHAVIORS)[number]

function idleChoice(index: number, seed: number, salt: number, length: number) {
  let value = Math.trunc(index + seed * 101 + salt * 7919)
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b)
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b)
  return ((value ^ (value >>> 16)) >>> 0) % length
}

function idleEnvelope(sceneTime: number) {
  if (sceneTime < 0.48) return easeInOutCubic(sceneTime / 0.48)
  if (sceneTime < 2.72) return 1
  if (sceneTime < 3.42) return 1 - easeInOutCubic((sceneTime - 2.72) / 0.7)
  return 0
}

function idleBehaviorsFor(
  behavior: AideIdleBehavior,
  sceneIndex: number,
  seed: number,
): { body: IdleBodyBehavior | null; face: IdleFaceBehavior | null } {
  if (behavior === "auto") {
    return {
      body: IDLE_BODY_BEHAVIORS[idleChoice(sceneIndex, seed, 3, IDLE_BODY_BEHAVIORS.length)]!,
      face: IDLE_FACE_BEHAVIORS[idleChoice(sceneIndex, seed, 7, IDLE_FACE_BEHAVIORS.length)]!,
    }
  }
  if (behavior === "stretch" || behavior === "bounce" || behavior === "sway") {
    return { body: behavior, face: null }
  }
  return { body: null, face: behavior }
}

function blink(t: number, offset = 0, period = 4.9) {
  const phase = ((t + offset) % period + period) % period
  if (phase > 0.18) return 1
  return 1 - Math.sin((phase / 0.18) * Math.PI) * 0.92
}

function baseRadius(angle: number) {
  return 84 + 16 * Math.cos(angle * 4) + 1.6 * Math.cos(angle * 8)
}

function profile(
  t: number,
  rotation: number,
  deformation: (angle: number, time: number) => number,
) {
  return Array.from({ length: PROFILE_SAMPLES }, (_, index) => {
    const angle = (index / PROFILE_SAMPLES) * TAU + rotation
    return baseRadius(angle) * deformation(angle, t)
  })
}

function emptyProps(): AidePose["props"] {
  const hidden = (): AidePropPose => ({
    opacity: 0,
    phase: 0,
    resolve: 0,
    glow: 0,
    y: 0,
    rotation: 0,
    scale: 1,
    slotY: 26,
    slotScale: 0.56,
  })

  return {
    startup: hidden(),
    "context-summary": hidden(),
    thinking: hidden(),
    "web-search": hidden(),
    "visual-capture": hidden(),
    "data-chart": hidden(),
    "file-create": hidden(),
    "file-read": hidden(),
    "file-edit": hidden(),
    dictionary: hidden(),
    translate: hidden(),
    calculate: hidden(),
    time: hidden(),
    complete: hidden(),
    error: hidden(),
  }
}

function emptyTouch(): AideTouchPose {
  return { head: 0, face: 0, leftCheek: 0, rightCheek: 0, belly: 0, phase: 0 }
}

export function aideTouchRegionAt(x: number, y: number): AideTouchRegion | null {
  if (!Number.isFinite(x) || !Number.isFinite(y) || Math.hypot(x, y) > 104) return null
  if (y < -38) return "head"
  if (y < 27 && Math.abs(x) < 28) return "face"
  if (y < 35) return x < 0 ? "left-cheek" : "right-cheek"
  return "belly"
}

function applyTouchReaction(
  pose: Omit<AidePose, "touch">,
  reaction: AideTouchReaction | undefined,
): AidePose {
  const touch = emptyTouch()
  if (!reaction || reaction.elapsed < 0 || reaction.elapsed >= 0.76) return { ...pose, touch }

  const phase = clamp(reaction.elapsed / 0.76)
  const attack = easeOutQuint(phase / 0.12)
  const release = 1 - easeInOutCubic((phase - 0.55) / 0.45)
  const strength = attack * release
  const wobble = Math.sin(phase * TAU * 2.25) * (1 - phase)
  const expressive = pose.errorTint < 0.45 && pose.spinPhase < 0.18
  const next: AidePose = {
    ...pose,
    eyes: [{ ...pose.eyes[0] }, { ...pose.eyes[1] }],
    mouth: { ...pose.mouth },
    touch: { ...touch, phase },
  }

  if (reaction.region === "head") {
    next.touch.head = strength
    next.characterY += strength * 3.2 - wobble * 0.8
    next.characterScale *= 1 - strength * 0.022
    next.characterScaleX *= 1 + strength * 0.052
    if (expressive) {
      next.eyes[0].curve = Math.max(next.eyes[0].curve, strength)
      next.eyes[1].curve = Math.max(next.eyes[1].curve, strength)
      next.mouth.width = lerp(next.mouth.width, 29, strength)
      next.mouth.curve = lerp(next.mouth.curve, 13, strength)
    }
  } else if (reaction.region === "face") {
    next.touch.face = strength
    next.characterScale *= 1 + strength * 0.03 + wobble * 0.008
    next.characterY -= strength * 1.8
    if (expressive) {
      next.eyes.forEach((currentEye) => {
        currentEye.rx = lerp(currentEye.rx, 9.2, strength)
        currentEye.ry = lerp(currentEye.ry, 13.8, strength)
        currentEye.openness = lerp(currentEye.openness, 1, strength)
      })
      next.mouth.width = lerp(next.mouth.width, 11, strength)
      next.mouth.curve = lerp(next.mouth.curve, 1, strength)
    }
  } else if (reaction.region === "left-cheek" || reaction.region === "right-cheek") {
    const left = reaction.region === "left-cheek"
    next.touch[left ? "leftCheek" : "rightCheek"] = strength
    next.characterRotation += (left ? 1 : -1) * (strength * 4.5 + wobble * 1.2)
    next.characterScaleX *= 1 + strength * 0.018
    if (expressive) {
      const touchedEye = next.eyes[left ? 0 : 1]
      touchedEye.openness = lerp(touchedEye.openness, 0.1, strength)
      next.mouth.width = lerp(next.mouth.width, 28, strength)
      next.mouth.curve = lerp(next.mouth.curve, 12, strength)
    }
  } else {
    next.touch.belly = strength
    next.characterY -= strength * 7.5
    next.characterRotation += wobble * 3.2
    next.characterScale *= 1 + strength * 0.025
    next.characterScaleX *= 1 - strength * 0.035
    if (expressive) {
      next.eyes[0].curve = Math.max(next.eyes[0].curve, strength)
      next.eyes[1].curve = Math.max(next.eyes[1].curve, strength)
      next.mouth.width = lerp(next.mouth.width, 31, strength)
      next.mouth.curve = lerp(next.mouth.curve, 14, strength)
    }
  }

  return next
}

function eye(
  x: number,
  y: number,
  openness = 1,
  rotation = 0,
  rx = 7.2,
  ry = 11.5,
  curve = 0,
  cross = 0,
): AideEyePose {
  return { x, y, rx, ry, rotation, openness, curve, cross }
}

function poseForStatus(status: AideMotionStatus, t: number, input: AideSampleInput): AidePose {
  const state = status.state
  const gazeX = clamp(input.gazeX ?? 0, -1, 1)
  const gazeY = clamp(input.gazeY ?? 0, -1, 1)
  const props = emptyProps()
  const breathing = 1 + Math.sin((t / 3.2) * TAU) * 0.007
  const defaultBlink = blink(t)
  let rotation = 0
  let characterOpacity = 1
  let characterScale = 1
  let characterScaleX = 1
  let characterY = 0
  let characterRotation = 0
  let sleepiness = 0
  let idlePhase = 0
  let successTint = 0
  let errorTint = 0
  let spinPhase = 0
  let spinTrail = 0
  let radii = profile(t, 0, () => breathing)
  let eyes: AidePose["eyes"] = [
    eye(-20 + gazeX * 3.2, -12 + gazeY * 2.2, defaultBlink),
    eye(20 + gazeX * 3.2, -12 + gazeY * 2.2, defaultBlink),
  ]
  let mouth: AidePose["mouth"] = { y: 17, width: 23, curve: 7, opacity: 1 }
  let shine = {
    x: -28 + Math.sin(t * 0.42) * 2.5,
    y: -39 + Math.cos(t * 0.36) * 2,
    opacity: 0.48,
  }

  if (state === "startup") {
    const resolved = status.phase === "resolved"
    const resolveProgress = resolved ? easeInOutCubic(t / 0.72) : 0
    const revealProgress = resolved ? easeInOutCubic((t - 0.06) / 0.72) : 0
    const materializeProgress = resolved ? easeInOutCubic((t - 0.08) / 0.72) : 0
    const particleFade = resolved ? easeOutQuint(t / 0.42) : 0
    const orbPulse = 1 + Math.sin(t * 2.8) * 0.035

    characterOpacity = revealProgress
    characterScale = lerp(0.16, 1, materializeProgress)
    props.startup = {
      opacity: 1 - particleFade,
      phase: (t * 0.46) % 1,
      resolve: resolveProgress,
      glow: resolved ? lerp(0.58, 0, resolveProgress) : 0.54 + Math.sin(t * 2.2) * 0.06,
      y: 0,
      rotation: 0,
      scale: resolved ? lerp(orbPulse, 3.4, resolveProgress) : orbPulse,
      slotY: 0,
      slotScale: 1,
    }
  } else if (state === "idle") {
    const winkPhase = ((t + 0.6) % 7.6 + 7.6) % 7.6
    const wink = winkPhase < 0.24
      ? 1 - Math.sin((winkPhase / 0.24) * Math.PI) * 0.94
      : 1
    eyes[0].openness = Math.min(eyes[0].openness, wink)
    const idleTime = Math.max(0, input.idleTime ?? 0)
    const sceneDuration = 4.6
    const sceneIndex = Math.floor(idleTime / sceneDuration)
    const sceneTime = idleTime - sceneIndex * sceneDuration
    idlePhase = sceneTime
    const activity = idleEnvelope(sceneTime) * clamp(input.idleBlend ?? 0)
    const selection = idleBehaviorsFor(input.idleBehavior ?? "auto", sceneIndex, input.idleSeed ?? 0)

    if (selection.body === "stretch") {
      radii = profile(t, 0, (angle) => (
        breathing * (1 - Math.cos(angle * 2) * 0.052 * activity)
      ))
      characterScale = 1 + activity * 0.012
      eyes[0].y -= activity * 2
      eyes[1].y -= activity * 2
      mouth = { y: lerp(17, 15, activity), width: lerp(23, 28, activity), curve: lerp(7, 11, activity), opacity: 1 }
    } else if (selection.body === "bounce") {
      const lift = 0.78 + Math.sin(sceneTime * 4.2) * 0.22
      characterY = -7 * activity * lift
      characterScale = 1 + activity * 0.025
      characterScaleX = 1 - activity * 0.018
    } else if (selection.body === "sway") {
      characterRotation = Math.sin(sceneTime * 2.15) * 6 * activity
      eyes[0].x -= characterRotation * 0.18
      eyes[1].x -= characterRotation * 0.18
      shine.x += characterRotation * 0.34
    }

    if (selection.face === "look-around") {
      const lookX = Math.sin(sceneTime * 2.35) * 7 * activity
      const lookY = Math.sin(sceneTime * 1.18 + 0.7) * 2.6 * activity
      eyes[0].x += lookX
      eyes[1].x += lookX
      eyes[0].y += lookY
      eyes[1].y += lookY
      shine.x += lookX * 0.25
    } else if (selection.face === "sleepy") {
      const sleepyOpenness = 0.16 + Math.sin(sceneTime * 1.7) * 0.04
      eyes[0].openness = lerp(eyes[0].openness, sleepyOpenness, activity)
      eyes[1].openness = lerp(eyes[1].openness, sleepyOpenness, activity)
      eyes[0].y += activity * 2.6
      eyes[1].y += activity * 2.6
      mouth = { y: lerp(mouth.y, 22, activity), width: lerp(mouth.width, 14, activity), curve: lerp(mouth.curve, 2, activity), opacity: 0.84 }
      characterY += activity * 2
      sleepiness = activity
    } else if (selection.face === "curious") {
      characterRotation -= activity * 4.8
      eyes[0].rx = lerp(eyes[0].rx, 8.8, activity)
      eyes[0].ry = lerp(eyes[0].ry, 13.2, activity)
      eyes[1].rx = lerp(eyes[1].rx, 6.1, activity)
      eyes[1].ry = lerp(eyes[1].ry, 9.7, activity)
      eyes[0].y -= activity * 2
      eyes[1].y += activity * 1.3
      mouth = { y: lerp(mouth.y, 18, activity), width: lerp(mouth.width, 15, activity), curve: lerp(mouth.curve, 4, activity), opacity: 0.9 }
    }

    return applyTouchReaction(
      { radii, rotation, characterOpacity, characterScale, characterScaleX, characterY, characterRotation, sleepiness, idlePhase, successTint, errorTint, spinPhase, spinTrail, eyes, mouth, shine, props },
      input.touchReaction,
    )
  }

  if (state === "context-summary") {
    const phase = (t * 0.42) % 1
    const compression = 0.5 + Math.sin(phase * TAU) * 0.5
    radii = profile(t, 0, (angle) => (
      1
      + Math.cos(angle * 2) * compression * 0.007
      + Math.sin(angle * 4 - t * 1.4) * 0.006
    ))
    const follow = lerp(-3, 4, phase)
    eyes = [
      eye(-20 + follow, -18, blink(t, 0.9), -5, 6.6, 10.8),
      eye(20 + follow, -18, blink(t, 0.9), -5, 6.6, 10.8),
    ]
    mouth = { y: 17, width: 18, curve: 2, opacity: 0.82 }
    props["context-summary"] = {
      opacity: 1,
      phase,
      resolve: 0,
      glow: 0,
      y: Math.sin(t * 1.45) * 1.2,
      rotation: 0,
      scale: 1,
      slotY: 0,
      slotScale: 1,
    }
  } else if (state === "thinking") {
    const resolved = status.phase === "resolved"
    const phase = resolved ? t * 0.7 : t * 2.2
    const resolveProgress = resolved ? easeInOutCubic(t / 0.68) : 0
    const bulbProgress = resolved ? easeOutBack((t - 0.44) / 0.32) : 0
    const glowProgress = resolved ? easeOutQuint((t - 0.56) / 0.36) : 0
    const resolvedBreathing = resolved && t > 0.92
      ? 1 + Math.sin((t - 0.92) * 2.1) * 0.003
      : 1
    radii = profile(t, 0, (angle) => (
      resolvedBreathing * (
        1
        + Math.sin(angle * 2 + phase) * lerp(0.025, 0.007, resolveProgress)
        + Math.sin(angle * 5 - phase * 0.7) * lerp(0.009, 0.003, resolveProgress)
      )
    ))
    eyes = [
      eye(-21 + Math.sin(t * 0.7) * 2, -17 + Math.cos(t * 0.9), blink(t, 0.5), lerp(-8, -4, resolveProgress)),
      eye(18 + Math.sin(t * 0.7) * 2, -19 + Math.cos(t * 0.9), blink(t, 0.5), lerp(-8, -4, resolveProgress)),
    ]
    mouth = {
      y: lerp(18, 16, resolveProgress),
      width: lerp(18, 22, resolveProgress),
      curve: lerp(-1, 6, resolveProgress),
      opacity: 0.86,
    }
    props.thinking = {
      opacity: 1,
      phase,
      resolve: resolveProgress,
      glow: glowProgress,
      y: Math.sin(t * 1.8) * 2,
      rotation: Math.sin(t * 0.8) * 5,
      scale: bulbProgress,
      slotY: 0,
      slotScale: 1,
    }
  } else if (state === "web-search") {
    const failed = status.phase === "error"
    const errorProgress = failed ? easeOutQuint(t / 0.32) : 0
    const scan = failed ? 0.92 : (t * 0.7) % 1
    radii = profile(t, 0, (angle) => 1 + Math.sin(angle * 2 - t * 2.4) * 0.014)
    const scanGaze = failed ? 0 : Math.sin(t * 3.4) * 4
    eyes = [eye(-20 + scanGaze, -18, blink(t, 1.2), 0, 6.4, 10), eye(20 + scanGaze, -18, blink(t, 1.2), 0, 6.4, 10)]
    mouth = {
      y: lerp(13, 19, errorProgress),
      width: lerp(16, 20, errorProgress),
      curve: lerp(1, -5, errorProgress),
      opacity: lerp(0.3, 0.82, errorProgress),
    }
    props["web-search"] = {
      opacity: 1,
      phase: scan,
      resolve: errorProgress,
      glow: 0,
      y: Math.sin(t * 2.1) * 1.2,
      rotation: 0,
      scale: 1,
      slotY: 0,
      slotScale: 1,
    }
  } else if (state === "visual-capture") {
    const phase = (t * 0.62) % 1
    const shutter = pulseEnvelope(phase, 0.66, 0.24)
    const scanY = lerp(-18, 18, easeInOutCubic(phase))
    const focus = 0.5 + Math.sin(phase * TAU) * 0.5
    radii = profile(t, 0, (angle) => (
      1 + Math.sin(angle * 2 - t * 1.8) * 0.009 - shutter * 0.006
    ))
    eyes = [
      eye(-17.5, -18 + scanY * 0.045, blink(t, 1.45), -3, 6.5, 10.3),
      eye(22.5, -18 + scanY * 0.045, blink(t, 1.45), 3, 6.5, 10.3),
    ]
    mouth = { y: 17, width: 18, curve: 3, opacity: 0.76 }
    props["visual-capture"] = {
      opacity: 1,
      phase,
      resolve: shutter,
      glow: focus,
      y: Math.sin(t * 1.45) * 1.1,
      rotation: Math.sin(t * 0.72) * 0.8,
      scale: 1 - shutter * 0.035,
      slotY: 0,
      slotScale: 1,
    }
  } else if (state === "data-chart") {
    const phase = (t * 0.3) % 1
    const trace = phase < 0.78 ? easeInOutCubic(phase / 0.78) : 1
    radii = profile(t, 0, (angle) => (
      1 + Math.sin(angle * 3 - t * 1.45) * 0.008
    ))
    const followX = lerp(-1.5, 4.5, phase)
    const followY = Math.sin(phase * TAU) * 1.2
    eyes = [
      eye(-18 + followX, -18 + followY, blink(t, 1.25), -4, 6.6, 10.4),
      eye(21 + followX, -18 + followY, blink(t, 1.25), -2, 6.6, 10.4),
    ]
    mouth = { y: 16, width: 22, curve: 7, opacity: 0.82 }
    props["data-chart"] = {
      opacity: 1,
      phase,
      resolve: trace,
      glow: 0.5 + Math.sin(phase * TAU) * 0.5,
      y: Math.sin(t * 1.5) * 1,
      rotation: Math.sin(t * 0.7) * 0.9,
      scale: 1,
      slotY: 0,
      slotScale: 1,
    }
  } else if (state === "file-create") {
    const phase = (t * 0.38) % 1
    const writingLine = Math.min(3, Math.floor(phase * 4))
    const lineProgress = (phase * 4) % 1
    const focusY = -25 + writingLine * 9
    radii = profile(t, 0, (angle) => 1 + Math.sin(angle * 3 - t * 1.3) * 0.008)
    eyes = [
      eye(-18 + lineProgress * 3, -17 + focusY * 0.035, blink(t, 0.9), -4, 6.5, 10.4),
      eye(21 + lineProgress * 3, -17 + focusY * 0.035, blink(t, 0.9), -2, 6.5, 10.4),
    ]
    mouth = { y: 16, width: 21, curve: 6, opacity: 0.78 }
    props["file-create"] = {
      opacity: 1,
      phase,
      resolve: lineProgress,
      glow: Math.sin(phase * Math.PI),
      y: Math.sin(t * 1.55) * 1.1,
      rotation: Math.sin(t * 0.72) * 1.2,
      scale: 1,
      slotY: 0,
      slotScale: 1,
    }
  } else if (state === "file-read") {
    const phase = (t * 0.34) % 1
    const scanY = lerp(-23, 24, phase)
    radii = profile(t, 0, (angle) => 1 + Math.sin(angle * 2 + t * 1.05) * 0.008)
    eyes = [
      eye(-18 + Math.sin(phase * TAU) * 1.5, -18 + scanY * 0.075, blink(t, 1.3), -3, 6.5, 10.2),
      eye(21 + Math.sin(phase * TAU) * 1.5, -18 + scanY * 0.075, blink(t, 1.3), -1, 6.5, 10.2),
    ]
    mouth = { y: 17, width: 18, curve: 3, opacity: 0.76 }
    props["file-read"] = {
      opacity: 1,
      phase,
      resolve: 0,
      glow: 0.55 + Math.sin(phase * Math.PI) * 0.28,
      y: Math.sin(t * 1.4) * 0.9,
      rotation: Math.sin(t * 0.64) * 0.8,
      scale: 1,
      slotY: 0,
      slotScale: 1,
    }
  } else if (state === "file-edit") {
    const phase = (t * 0.36) % 1
    const stroke = easeInOutCubic(phase)
    radii = profile(t, 0, (angle) => 1 + Math.sin(angle * 3 - t * 1.5) * 0.009)
    eyes = [
      eye(-18 + stroke * 4, -17 + stroke * 2, blink(t, 1.6), -5, 6.5, 10.4),
      eye(21 + stroke * 4, -17 + stroke * 2, blink(t, 1.6), -3, 6.5, 10.4),
    ]
    mouth = { y: 17, width: 19, curve: 4, opacity: 0.78 }
    props["file-edit"] = {
      opacity: 1,
      phase,
      resolve: stroke,
      glow: Math.sin(phase * Math.PI),
      y: Math.sin(t * 1.6) * 1,
      rotation: Math.sin(t * 0.76) * 1,
      scale: 1,
      slotY: 0,
      slotScale: 1,
    }
  } else if (state === "dictionary") {
    const line = (t * 0.62) % 1
    radii = profile(t, 0, (angle) => 1 + Math.sin(angle * 2 + t * 1.1) * 0.009)
    const readX = lerp(-3.2, 3.2, line)
    const readY = line > 0.92 ? 1.5 : 0
    eyes = [eye(-20 + readX, -18 + readY, blink(t, 0.8), -2, 6.6, 10.5), eye(20 + readX, -18 + readY, blink(t, 0.8), 2, 6.6, 10.5)]
    mouth = { y: 16, width: 20, curve: 5, opacity: 0.72 }
    props.dictionary = {
      opacity: 1,
      phase: (t * 0.34) % 1,
      resolve: 0,
      glow: 0,
      y: Math.sin(t * 1.5) * 1.1,
      rotation: Math.sin(t * 0.8) * 1.2,
      scale: 1,
      slotY: 0,
      slotScale: 1,
    }
  } else if (state === "translate") {
    const swap = (t * 0.42) % 1
    radii = profile(t, 0, (angle) => 1 + Math.sin(angle * 3 - t * 1.35) * 0.01)
    const follow = Math.sin(swap * TAU) * 2.6
    eyes = [
      eye(-20 + follow, -18, blink(t, 1.1), -3, 6.6, 10.5),
      eye(20 + follow, -18, blink(t, 1.1), 3, 6.6, 10.5),
    ]
    mouth = { y: 16, width: 21, curve: 6, opacity: 0.76 }
    props.translate = {
      opacity: 1,
      phase: swap,
      resolve: 0,
      glow: 0,
      y: Math.sin(t * 1.6) * 1.1,
      rotation: Math.sin(t * 0.72) * 1.4,
      scale: 1,
      slotY: 0,
      slotScale: 1,
    }
  } else if (state === "calculate") {
    const beat = (Math.floor(t * 2.2) % 4) / 3
    radii = profile(t, 0, (angle) => 1 + Math.sin(angle * 4 - t * 2) * 0.008)
    const jump = (beat - 0.5) * 5
    eyes = [eye(-20 + jump, -17, blink(t, 1.7), -4), eye(20 + jump, -17, blink(t, 1.7), 4)]
    mouth = { y: 16, width: 17, curve: 0, opacity: 0.8 }
    props.calculate = {
      opacity: 1,
      phase: (t * 0.48) % 1,
      resolve: 0,
      glow: 0,
      y: Math.sin(t * 2.4) * 1.2,
      rotation: Math.sin(t * 1.3) * 1.5,
      scale: 1 + Math.sin(t * 4.4) * 0.012,
      slotY: 0,
      slotScale: 1,
    }
  } else if (state === "time") {
    const hand = t * 54
    rotation = Math.sin(t * 0.9) * 0.012
    radii = profile(t, rotation, (angle) => 1 + Math.sin(angle * 4 - t * 2.2) * 0.011)
    const lookAngle = t * 0.9
    eyes = [
      eye(-20 + Math.cos(lookAngle) * 2.2, -17 + Math.sin(lookAngle) * 1.8, blink(t, 2.1), -4),
      eye(20 + Math.cos(lookAngle) * 2.2, -17 + Math.sin(lookAngle) * 1.8, blink(t, 2.1), 4),
    ]
    mouth = { y: 17, width: 22, curve: 6, opacity: 0.9 }
    props.time = {
      opacity: 1,
      phase: hand,
      resolve: 0,
      glow: 0,
      y: Math.sin(t * 1.7) * 1.2,
      rotation: 0,
      scale: 1,
      slotY: 0,
      slotScale: 1,
    }
  } else if (state === "complete") {
    const eyeProgress = easeOutQuint(t / 0.28)
    const spinProgress = easeInOutCubic(t / 0.82)
    const tintProgress = easeInOutCubic((t - 0.08) / 0.68)
    const checkProgress = clamp((t - 0.82) / 0.28)
    const checkPop = easeOutBack(checkProgress)
    const completionBreathing = t < 1.1
      ? 1
      : 1 + Math.sin(((t - 1.1) / 3.8) * TAU) * 0.004

    characterScaleX = spinProgress >= 1 ? 1 : Math.cos(spinProgress * TAU)
    successTint = tintProgress
    spinPhase = spinProgress
    spinTrail = spinProgress >= 1 ? 0 : Math.pow(Math.sin(spinProgress * Math.PI), 0.65)
    radii = profile(t, 0, (angle) => {
      const spinStretch = Math.sin(spinProgress * Math.PI) * Math.cos(angle * 2) * 0.016
      return completionBreathing * (0.978 + eyeProgress * 0.022 + spinStretch)
    })
    eyes = [
      eye(-20, -15, 1, -7, 9, 9, eyeProgress),
      eye(20, -15, 1, 7, 9, 9, eyeProgress),
    ]
    mouth = { y: 14, width: 30, curve: 14, opacity: 1 }
    props.complete = {
      opacity: clamp((t - 0.82) / 0.1),
      phase: checkProgress,
      resolve: 0,
      glow: 0,
      y: lerp(8, 0, checkPop) + (t > 1.1 ? Math.sin((t - 1.1) * 1.8) * 0.45 : 0),
      rotation: 0,
      scale: checkPop,
      slotY: 0,
      slotScale: 1,
    }
    shine = { x: -30, y: -42, opacity: lerp(0.48, 0.62, tintProgress) }
  } else if (state === "error") {
    const recoil = Math.exp(-Math.max(0, t) * 5)
    const errorProgress = easeInOutCubic(t / 0.5)
    const crossProgress = easeOutQuint(t / 0.28)
    const recurringTime = t >= 1.1 ? (t - 1.1) % 2.8 : -1
    const glitchIntensity = Math.max(
      pulseEnvelope(t, 0.04, 0.3),
      pulseEnvelope(recurringTime, 0, 0.24) * 0.58,
    )
    const glitchPhase = (t * 13.7) % 1
    errorTint = errorProgress
    characterOpacity = 1 - glitchIntensity * 0.045
    characterScaleX = 1 + glitchIntensity * 0.012
    radii = profile(t, 0, (angle) => (
      1 - recoil * 0.03 + Math.sin(angle * 2 + t * 1.4) * 0.008
    ))
    eyes = [
      eye(-20, -14, 1, 0, 10, 10, 0, crossProgress),
      eye(20, -14, 1, 0, 10, 10, 0, crossProgress),
    ]
    mouth = { y: 24, width: 25, curve: -8, opacity: 1 }
    shine = { x: -31, y: -43, opacity: 0.34 }
    props.error = {
      opacity: glitchIntensity,
      phase: glitchPhase,
      resolve: glitchIntensity * (0.1 + Math.abs(Math.sin(glitchPhase * TAU)) * 0.08),
      glow: glitchIntensity * 0.52,
      y: lerp(-62, 62, glitchPhase),
      rotation: Math.sin(glitchPhase * TAU),
      scale: 1,
      slotY: 0,
      slotScale: 1,
    }
  }

  return applyTouchReaction(
    { radii, rotation, characterOpacity, characterScale, characterScaleX, characterY, characterRotation, sleepiness, idlePhase, successTint, errorTint, spinPhase, spinTrail, eyes, mouth, shine, props },
    input.touchReaction,
  )
}

function interpolateEye(from: AideEyePose, to: AideEyePose, amount: number): AideEyePose {
  return {
    x: lerp(from.x, to.x, amount),
    y: lerp(from.y, to.y, amount),
    rx: lerp(from.rx, to.rx, amount),
    ry: lerp(from.ry, to.ry, amount),
    rotation: lerp(from.rotation, to.rotation, amount),
    openness: lerp(from.openness, to.openness, amount),
    curve: lerp(from.curve, to.curve, amount),
    cross: lerp(from.cross, to.cross, amount),
  }
}

function interpolateProp(
  from: AidePropPose,
  to: AidePropPose,
  amount: number,
  transitionProgress: number,
): AidePropPose {
  const opacityDelta = to.opacity - from.opacity
  const entering = opacityDelta > 0.001
  const exiting = opacityDelta < -0.001
  const presenceProgress = entering
    ? easeOutQuint((transitionProgress - 0.18) / 0.82)
    : exiting
      ? easeInOutCubic(transitionProgress / 0.56)
      : amount
  const slotProgress = entering
    ? easeOutBack((transitionProgress - 0.18) / 0.82)
    : exiting
      ? easeInOutCubic(transitionProgress / 0.56)
      : amount

  return {
    opacity: lerp(from.opacity, to.opacity, presenceProgress),
    phase: lerp(from.phase, to.phase, amount),
    resolve: lerp(from.resolve, to.resolve, amount),
    glow: lerp(from.glow, to.glow, amount),
    y: lerp(from.y, to.y, amount),
    rotation: lerp(from.rotation, to.rotation, amount),
    scale: lerp(from.scale, to.scale, amount),
    slotY: lerp(from.slotY, to.slotY, slotProgress),
    slotScale: lerp(from.slotScale, to.slotScale, slotProgress),
  }
}

function interpolatePose(
  from: AidePose,
  to: AidePose,
  amount: number,
  transitionProgress: number,
): AidePose {
  return {
    radii: to.radii.map((radius, index) => lerp(from.radii[index] ?? radius, radius, amount)),
    rotation: lerp(from.rotation, to.rotation, amount),
    characterOpacity: lerp(from.characterOpacity, to.characterOpacity, amount),
    characterScale: lerp(from.characterScale, to.characterScale, amount),
    characterScaleX: lerp(from.characterScaleX, to.characterScaleX, amount),
    characterY: lerp(from.characterY, to.characterY, amount),
    characterRotation: lerp(from.characterRotation, to.characterRotation, amount),
    touch: {
      head: lerp(from.touch.head, to.touch.head, amount),
      face: lerp(from.touch.face, to.touch.face, amount),
      leftCheek: lerp(from.touch.leftCheek, to.touch.leftCheek, amount),
      rightCheek: lerp(from.touch.rightCheek, to.touch.rightCheek, amount),
      belly: lerp(from.touch.belly, to.touch.belly, amount),
      phase: lerp(from.touch.phase, to.touch.phase, amount),
    },
    sleepiness: lerp(from.sleepiness, to.sleepiness, amount),
    idlePhase: lerp(from.idlePhase, to.idlePhase, amount),
    successTint: lerp(from.successTint, to.successTint, amount),
    errorTint: lerp(from.errorTint, to.errorTint, amount),
    spinPhase: lerp(from.spinPhase, to.spinPhase, amount),
    spinTrail: lerp(from.spinTrail, to.spinTrail, amount),
    eyes: [interpolateEye(from.eyes[0], to.eyes[0], amount), interpolateEye(from.eyes[1], to.eyes[1], amount)],
    mouth: {
      y: lerp(from.mouth.y, to.mouth.y, amount),
      width: lerp(from.mouth.width, to.mouth.width, amount),
      curve: lerp(from.mouth.curve, to.mouth.curve, amount),
      opacity: lerp(from.mouth.opacity, to.mouth.opacity, amount),
    },
    shine: {
      x: lerp(from.shine.x, to.shine.x, amount),
      y: lerp(from.shine.y, to.shine.y, amount),
      opacity: lerp(from.shine.opacity, to.shine.opacity, amount),
    },
    props: {
      startup: interpolateProp(from.props.startup, to.props.startup, amount, transitionProgress),
      "context-summary": interpolateProp(
        from.props["context-summary"],
        to.props["context-summary"],
        amount,
        transitionProgress,
      ),
      thinking: interpolateProp(from.props.thinking, to.props.thinking, amount, transitionProgress),
      "web-search": interpolateProp(from.props["web-search"], to.props["web-search"], amount, transitionProgress),
      "visual-capture": interpolateProp(
        from.props["visual-capture"],
        to.props["visual-capture"],
        amount,
        transitionProgress,
      ),
      "data-chart": interpolateProp(from.props["data-chart"], to.props["data-chart"], amount, transitionProgress),
      "file-create": interpolateProp(from.props["file-create"], to.props["file-create"], amount, transitionProgress),
      "file-read": interpolateProp(from.props["file-read"], to.props["file-read"], amount, transitionProgress),
      "file-edit": interpolateProp(from.props["file-edit"], to.props["file-edit"], amount, transitionProgress),
      dictionary: interpolateProp(from.props.dictionary, to.props.dictionary, amount, transitionProgress),
      translate: interpolateProp(from.props.translate, to.props.translate, amount, transitionProgress),
      calculate: interpolateProp(from.props.calculate, to.props.calculate, amount, transitionProgress),
      time: interpolateProp(from.props.time, to.props.time, amount, transitionProgress),
      complete: interpolateProp(from.props.complete, to.props.complete, amount, transitionProgress),
      error: interpolateProp(from.props.error, to.props.error, amount, transitionProgress),
    },
  }
}

export function pathFromRadii(radii: number[], rotation = 0) {
  const points = radii.map((radius, index) => {
    const angle = (index / radii.length) * TAU + rotation
    return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius }
  })
  const point = (index: number) => points[(index + points.length) % points.length]!
  const start = point(0)
  let path = `M ${start.x.toFixed(2)} ${start.y.toFixed(2)}`
  for (let index = 0; index < points.length; index += 1) {
    const previous = point(index - 1)
    const current = point(index)
    const next = point(index + 1)
    const after = point(index + 2)
    const c1x = current.x + (next.x - previous.x) / 6
    const c1y = current.y + (next.y - previous.y) / 6
    const c2x = next.x - (after.x - current.x) / 6
    const c2y = next.y - (after.y - current.y) / 6
    path += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${next.x.toFixed(2)} ${next.y.toFixed(2)}`
  }
  return `${path} Z`
}

export class AideMotionEngine {
  private currentStatus: AideMotionStatus
  private stateSince = 0
  private transitionFrom: AidePose | null = null
  private transitionSince = 0
  readonly transitionDuration = 0.42

  constructor(initialStatus: AideMotionStatus = { state: "idle" }) {
    this.currentStatus = initialStatus
  }

  get state() {
    return this.currentStatus.state
  }

  get status() {
    return this.currentStatus
  }

  setStatus(nextStatus: AideMotionStatus, time: number, input: AideSampleInput = {}) {
    const sameState = nextStatus.state === this.currentStatus.state
    const samePhase = "phase" in nextStatus
      ? "phase" in this.currentStatus && nextStatus.phase === this.currentStatus.phase
      : !("phase" in this.currentStatus)
    if (sameState && samePhase) return
    this.transitionFrom = this.samplePose(time, input)
    this.currentStatus = nextStatus
    this.stateSince = time
    this.transitionSince = time
  }

  reset(nextStatus: AideMotionStatus, time: number, localTime = 0) {
    this.currentStatus = nextStatus
    this.stateSince = time - Math.max(0, localTime)
    this.transitionSince = time
    this.transitionFrom = null
  }

  sample(time: number, input: AideSampleInput = {}): AideFrame {
    const pose = this.samplePose(time, input)
    return {
      ...pose,
      status: this.currentStatus,
      state: this.currentStatus.state,
      bodyPath: pathFromRadii(pose.radii, pose.rotation),
    }
  }

  private samplePose(time: number, input: AideSampleInput): AidePose {
    const target = poseForStatus(this.currentStatus, Math.max(0, time - this.stateSince), input)
    if (!this.transitionFrom) return target
    const progress = (time - this.transitionSince) / this.transitionDuration
    if (progress >= 1) return target
    return interpolatePose(this.transitionFrom, target, easeOutQuint(progress), clamp(progress))
  }
}
