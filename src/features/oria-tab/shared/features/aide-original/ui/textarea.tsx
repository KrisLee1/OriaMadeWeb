// Ported from OriaAide; browser adaptations are documented in README.md.
import * as React from "react"
import { ChevronsLeftRightIcon } from "lucide-react"

import { cn } from "@/features/oria-tab/shared/lib/utils"

export type TextareaResizeHandlePosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"

export type TextareaResizeAxis = "both" | "horizontal" | "vertical"

export type TextareaProps = React.ComponentProps<"textarea"> & {
  /** Render a keyboard-accessible custom resize handle instead of the native handle. */
  showResizeHandle?: boolean
  /** Corner where the custom resize handle is rendered. */
  resizeHandlePosition?: TextareaResizeHandlePosition
  /** Which dimensions the custom resize handle can change. */
  resizeAxis?: TextareaResizeAxis
}

type ResizeSession = {
  pointerId: number
  startX: number
  startY: number
  startWidth: number
  startHeight: number
  directionX: 1 | -1
  directionY: 1 | -1
  resizeAxis: TextareaResizeAxis
  minWidth: number
  maxWidth: number
  minHeight: number
  maxHeight: number
}

type ResizeSize = {
  width: number
  height: number
}

const resizeHandlePositionClasses: Record<TextareaResizeHandlePosition, string> = {
  "top-left": "top-0 left-0",
  "top-right": "top-0 right-0",
  "bottom-left": "bottom-0 left-0",
  "bottom-right": "bottom-0 right-0",
}

const resizeAxisCursorClasses: Record<TextareaResizeAxis, string> = {
  both: "cursor-nwse-resize",
  horizontal: "cursor-ew-resize",
  vertical: "cursor-ns-resize",
}

const resizeDirections: Record<TextareaResizeHandlePosition, Pick<ResizeSession, "directionX" | "directionY">> = {
  "top-left": { directionX: -1, directionY: -1 },
  "top-right": { directionX: 1, directionY: -1 },
  "bottom-left": { directionX: -1, directionY: 1 },
  "bottom-right": { directionX: 1, directionY: 1 },
}

function readPixelValue(value: string, fallback: number) {
  const parsedValue = Number.parseFloat(value)
  return value.endsWith("px") && Number.isFinite(parsedValue) ? parsedValue : fallback
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function getResizeSize(session: ResizeSession, deltaX: number, deltaY: number): ResizeSize {
  const width = clamp(
    session.startWidth + deltaX * session.directionX,
    session.minWidth,
    session.maxWidth,
  )
  const height = clamp(
    session.startHeight + deltaY * session.directionY,
    session.minHeight,
    session.maxHeight,
  )

  return {
    width: session.resizeAxis === "vertical" ? session.startWidth : width,
    height: session.resizeAxis === "horizontal" ? session.startHeight : height,
  }
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    className,
    resizeHandlePosition = "bottom-right",
    resizeAxis = "both",
    showResizeHandle,
    style,
    disabled,
    ...props
  },
  ref,
) {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)
  const resizeSessionRef = React.useRef<ResizeSession | null>(null)
  const [resizeSize, setResizeSize] = React.useState<ResizeSize | null>(null)

  const setTextareaRef = React.useCallback(
    (node: HTMLTextAreaElement | null) => {
      textareaRef.current = node

      if (typeof ref === "function") {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    },
    [ref],
  )

  const startResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    const textarea = textareaRef.current
    if (!textarea || disabled || event.button !== 0) return

    const computedStyle = window.getComputedStyle(textarea)
    const rect = textarea.getBoundingClientRect()
    const minWidth = readPixelValue(computedStyle.minWidth, 0)
    const minHeight = readPixelValue(computedStyle.minHeight, 0)
    const maxWidth = readPixelValue(computedStyle.maxWidth, Number.POSITIVE_INFINITY)
    const maxHeight = readPixelValue(computedStyle.maxHeight, Number.POSITIVE_INFINITY)

    event.preventDefault()
    resizeSessionRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: Math.max(rect.width, minWidth),
      startHeight: Math.max(rect.height, minHeight),
      ...resizeDirections[resizeHandlePosition],
      resizeAxis,
      minWidth,
      maxWidth: Math.max(maxWidth, minWidth),
      minHeight,
      maxHeight: Math.max(maxHeight, minHeight),
    }
    setResizeSize({
      width: Math.max(rect.width, minWidth),
      height: Math.max(rect.height, minHeight),
    })
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const updateResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    const session = resizeSessionRef.current
    if (!session || session.pointerId !== event.pointerId) return

    event.preventDefault()
    setResizeSize(getResizeSize(session, event.clientX - session.startX, event.clientY - session.startY))
  }

  const finishResize = (event?: React.PointerEvent<HTMLButtonElement>) => {
    resizeSessionRef.current = null

    if (event?.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const resizeWithKeyboard = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const textarea = textareaRef.current
    if (!textarea || disabled) return

    const step = event.shiftKey ? 32 : 8
    let deltaX = 0
    let deltaY = 0

    switch (event.key) {
      case "ArrowLeft":
        deltaX = -step
        break
      case "ArrowRight":
        deltaX = step
        break
      case "ArrowUp":
        deltaY = -step
        break
      case "ArrowDown":
        deltaY = step
        break
      default:
        return
    }

    const computedStyle = window.getComputedStyle(textarea)
    const rect = textarea.getBoundingClientRect()
    const minWidth = readPixelValue(computedStyle.minWidth, 0)
    const minHeight = readPixelValue(computedStyle.minHeight, 0)
    const maxWidth = readPixelValue(computedStyle.maxWidth, Number.POSITIVE_INFINITY)
    const maxHeight = readPixelValue(computedStyle.maxHeight, Number.POSITIVE_INFINITY)
    const currentSize = resizeSize ?? {
      width: Math.max(rect.width, minWidth),
      height: Math.max(rect.height, minHeight),
    }
    const session: ResizeSession = {
      pointerId: -1,
      startX: 0,
      startY: 0,
      startWidth: currentSize.width,
      startHeight: currentSize.height,
      ...resizeDirections[resizeHandlePosition],
      resizeAxis,
      minWidth,
      maxWidth: Math.max(maxWidth, minWidth),
      minHeight,
      maxHeight: Math.max(maxHeight, minHeight),
    }

    event.preventDefault()
    setResizeSize(getResizeSize(session, deltaX, deltaY))
  }

  const textareaClassName = cn(
    "aide-scrollbar-slim flex field-sizing-content min-h-16 w-full select-text rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
    className,
    showResizeHandle !== undefined && "resize-none",
  )
  const resizeStyle = resizeSize && showResizeHandle
    ? {
        ...(resizeAxis !== "vertical" ? { width: resizeSize.width } : {}),
        ...(resizeAxis !== "horizontal" ? { height: resizeSize.height } : {}),
      }
    : undefined
  const textareaStyle = resizeStyle ? { ...style, ...resizeStyle } : style

  const textarea = (
    <textarea
      data-slot="textarea"
      className={textareaClassName}
      style={textareaStyle}
      disabled={disabled}
      ref={setTextareaRef}
      {...props}
    />
  )

  if (showResizeHandle !== true) {
    return textarea
  }

  let iconClassName = "";
  if(resizeAxis == "both") {
    iconClassName = resizeHandlePosition == "bottom-left" || resizeHandlePosition == "top-right" ? "rotate-135" : "rotate-45";
  } else {
    iconClassName = resizeAxis == "horizontal" ? "" : "rotate-90";
  }


  return (
    <div
      data-slot="textarea-wrapper"
      className="relative flex w-full min-w-0 max-w-full flex-1"
      style={
        resizeSize
          ? {
              flex: "0 0 auto",
              ...(resizeAxis !== "vertical" ? { width: resizeSize.width } : {}),
              ...(resizeAxis !== "horizontal" ? { height: resizeSize.height } : {}),
            }
          : undefined
      }
    >
      {textarea}
      <button
        type="button"
        data-slot="textarea-resize-handle"
        aria-label="Resize text area"
        disabled={disabled}
        className={cn(
          "absolute z-10 flex size-5 touch-none select-none items-center justify-center rounded-sm text-muted-foreground/50 transition-colors hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50",
          resizeHandlePositionClasses[resizeHandlePosition],
          resizeAxisCursorClasses[resizeAxis],
        )}
        style={{ cursor: resizeAxis === 'vertical' ? 'ns-resize' : resizeAxis === 'horizontal' ? 'ew-resize' : resizeHandlePosition === 'top-right' || resizeHandlePosition === 'bottom-left' ? 'nesw-resize' : 'nwse-resize' }}
        onPointerDown={startResize}
        onPointerMove={updateResize}
        onPointerUp={finishResize}
        onPointerCancel={finishResize}
        onLostPointerCapture={() => finishResize()}
        onKeyDown={resizeWithKeyboard}
      >
        <ChevronsLeftRightIcon className={cn("pointer-events-none size-4", iconClassName)} aria-hidden="true" />
      </button>
    </div>
  )
})

Textarea.displayName = "Textarea"

export { Textarea }
