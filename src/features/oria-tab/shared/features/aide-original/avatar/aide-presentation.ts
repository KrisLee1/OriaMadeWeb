// Ported from OriaAide; tool mappings restricted to web_search and translate_text.
import type { AideMotionStatus } from "@/features/oria-tab/shared/features/aide-original/avatar/aide-motion-engine"
import type { PresentationMessage as ChatMessage } from "@/features/oria-tab/shared/features/aide-original/avatar/activity-store"
import type { Action, AssistantStreamEvent } from "@/features/oria-tab/shared/features/aide-original/types"

export type AidePresentationKind =
  | "idle"
  | "lookup"
  | "translate"
  | "context-summary"
  | "thinking"
  | "thinking-complete"
  | "web-search"
  | "web-search-error"
  | "visual-capture"
  | "data-chart"
  | "file-create"
  | "file-read"
  | "file-edit"
  | "calculate"
  | "time"
  | "complete"
  | "error"

export interface AidePresentation {
  kind: AidePresentationKind
  status: AideMotionStatus
}

export const AIDE_COMPLETE_FEEDBACK_MS = 2_600
export const AIDE_TOOL_FEEDBACK_MIN_MS = 900
export const AIDE_THINKING_RESOLVED_FEEDBACK_MIN_MS = 900

export function isAideExecutionPresentation(kind: AidePresentationKind) {
  return kind !== "idle" && kind !== "error" && kind !== "web-search-error"
}

function thinkingResolvedExpiresAt(answerStartedAt: number, toolExpiresAt: number | null) {
  return Math.max(answerStartedAt, toolExpiresAt ?? answerStartedAt)
    + AIDE_THINKING_RESOLVED_FEEDBACK_MIN_MS
}

function completionFeedbackExpiresAt(
  completedAt: number,
  toolExpiresAt: number | null,
  resolvedExpiresAt: number | null,
) {
  return Math.max(
    completedAt,
    toolExpiresAt ?? completedAt,
    resolvedExpiresAt ?? completedAt,
  ) + AIDE_COMPLETE_FEEDBACK_MS
}

const idlePresentation: AidePresentation = {
  kind: "idle",
  status: { state: "idle" },
}

const WEB_TOOLS = ["web_search"]

function isWebTool(tool: string) {
  return WEB_TOOLS.includes(tool)
}

function toolPresentation(event: AssistantStreamEvent | undefined): AidePresentation | null {
  if (!event) return null
  if (event.type === "tool_failed") {
    if (isWebTool(event.tool)) {
      return {
        kind: "web-search-error",
        status: { state: "web-search", phase: "error" },
      }
    }
    return { kind: "error", status: { state: "error" } }
  }
  if (event.type !== "tool_started" && event.type !== "tool_completed") return null

  if (event.tool === "translate_text") return { kind: "translate", status: { state: "translate" } }
  if (isWebTool(event.tool)) {
    return { kind: "web-search", status: { state: "web-search", phase: "active" } }
  }
  return null
}

function actionPresentation(action: Action): AidePresentation {
  if (action === "translate") {
    return { kind: "translate", status: { state: "translate" } }
  }
  return { kind: "thinking", status: { state: "thinking", phase: "active" } }
}

function contextSummaryPresentation(
  event: AssistantStreamEvent | undefined,
): AidePresentation | null {
  if (event?.type !== "context_summary_started") return null
  return {
    kind: "context-summary",
    status: { state: "context-summary" },
  }
}

export function deriveAidePresentation(
  messages: ChatMessage[],
  isLoading: boolean,
  activeAction: Action | null,
  now = Date.now(),
): AidePresentation {
  const latest = [...messages].reverse().find(
    (message): message is Extract<ChatMessage, { from: "assistant" }> => message.from === "assistant",
  )

  if (!latest) {
    return isLoading && activeAction ? actionPresentation(activeAction) : idlePresentation
  }

  const events = latest.streamEvents || []
  const latestEvent = events[events.length - 1]
  const latestTool = toolPresentation(latestEvent)
  const latestContextSummary = contextSummaryPresentation(latestEvent)
  if (latest.status === "error") {
    return latestEvent?.type === "tool_failed" && isWebTool(latestEvent.tool)
      ? latestTool!
      : { kind: "error", status: { state: "error" } }
  }
  const toolFeedbackExpiresAt = latestEvent
    && (latestEvent.type === "tool_started" || latestEvent.type === "tool_completed")
    && latestEvent.receivedAt !== undefined
    ? latestEvent.receivedAt + AIDE_TOOL_FEEDBACK_MIN_MS
    : null

  if (latestTool && toolFeedbackExpiresAt !== null && now < toolFeedbackExpiresAt) {
    return latestTool
  }
  const resolvedExpiresAt = latest.answerStartedAt !== undefined
    ? thinkingResolvedExpiresAt(latest.answerStartedAt, toolFeedbackExpiresAt)
    : null
  if (latest.status === "complete") {
    if (resolvedExpiresAt !== null && now < resolvedExpiresAt) {
      return {
        kind: "thinking-complete",
        status: { state: "thinking", phase: "resolved" },
      }
    }
    const completedAt = latest.completedAt
    if (
      completedAt !== undefined
      && now < completionFeedbackExpiresAt(
        completedAt,
        toolFeedbackExpiresAt,
        resolvedExpiresAt,
      )
    ) {
      return { kind: "complete", status: { state: "complete" } }
    }
    return idlePresentation
  }
  if (latest.status === "cancelled") return idlePresentation

  if (latest.status === "loading" || latest.status === "streaming" || isLoading) {
    if (latest.streamingContent?.trim()) {
      return {
        kind: "thinking-complete",
        status: { state: "thinking", phase: "resolved" },
      }
    }

    if (latestTool) return latestTool
    if (latestContextSummary) return latestContextSummary
    return actionPresentation(latest.action)
  }

  return idlePresentation
}

export function nextAidePresentationChangeAt(
  messages: ChatMessage[],
  now = Date.now(),
): number | null {
  const latest = [...messages].reverse().find(
    (message): message is Extract<ChatMessage, { from: "assistant" }> => message.from === "assistant",
  )
  if (!latest) return null

  const latestEvent = latest.streamEvents?.[latest.streamEvents.length - 1]
  const toolExpiresAt = latestEvent
    && (latestEvent.type === "tool_started" || latestEvent.type === "tool_completed")
    && latestEvent.receivedAt !== undefined
    ? latestEvent.receivedAt + AIDE_TOOL_FEEDBACK_MIN_MS
    : null
  const resolvedExpiresAt = latest.answerStartedAt !== undefined
    ? thinkingResolvedExpiresAt(latest.answerStartedAt, toolExpiresAt)
    : null
  const completeExpiresAt = latest.status === "complete" && latest.completedAt !== undefined
    ? completionFeedbackExpiresAt(latest.completedAt, toolExpiresAt, resolvedExpiresAt)
    : null
  const deadlines = [toolExpiresAt, resolvedExpiresAt, completeExpiresAt].filter(
    (deadline): deadline is number => deadline !== null && deadline > now,
  )
  return deadlines.length > 0 ? Math.min(...deadlines) : null
}
