export type Action = "translate" | "explain"

export type ModelId = string

export type TargetLanguagePreference = string

export interface ServiceModel {
  id: string
  platformId: ModelId
  name: string
  officialId: string
  contextWindowTokens?: number
  maxOutputTokens?: number | null
  enabled?: boolean
  supportsVision?: boolean
}


export type AssistantStreamEvent =
  | { type: "continuation_summary"; content: string }
  | { type: "context_summary_started" }
  | { type: "context_summary_completed" }
  | { type: "context_summary_failed" }
  | { type: "thinking_started" }
  | { type: "response_completed" }
  | { type: "content_reset" }
  | { type: "content_delta"; delta: string }
  | { type: "intermediate_message"; content: string }
  | { type: "user_adjustment"; content: string }
  | { type: "reasoning_delta"; delta: string }
  | { type: "tool_started"; tool: string; detail?: string }
  | { type: "tool_completed"; tool: string; detail?: string; resultCount?: number }
  | { type: "tool_failed"; tool: string; message: string }
  | {
      type: "visual_capture_preview"
      image: VisionImage
    }



export type { VisionImage, ImageAttachment } from '@/features/oria-tab/shared/lib/aide/types'
import type { VisionImage } from '@/features/oria-tab/shared/lib/aide/types'

export type { TranslationProvider, TranslationResult } from '@/features/oria-tab/shared/lib/aide/types'
export type InputAttachment = never
export interface WebSearchSource { title: string; url: string; snippet?: string; iconUrl?: string }

export interface ContextArtifact { kind: Action; input: string; output: string; provider: string; language?: string }
export interface SelectionQuote { purpose?: "figure-edit"; text: string; context?: string; source?: string }
export interface SelectionActionRequest { purpose?: "figure-edit"; intent?: "ask"; surroundingText?: string; source?: string; action: Action; text: string; context?: ContextArtifact }
