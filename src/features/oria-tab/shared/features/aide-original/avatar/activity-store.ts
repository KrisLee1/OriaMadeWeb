// Chrome session adapter for OriaAide's original presentation timing/state resolver.
import { useEffect, useState, useSyncExternalStore } from 'react'
import { deriveAidePresentation, nextAidePresentationChangeAt, type AidePresentation } from '@/features/oria-tab/shared/features/aide-original/avatar/aide-presentation'
import type { ChatMessage } from '@/features/oria-tab/shared/lib/aide/types'
import type { Action, AssistantStreamEvent } from '@/features/oria-tab/shared/features/aide-original/types'
export interface PresentationMessage {
  from: 'assistant'; status: 'loading' | 'streaming' | 'complete' | 'error' | 'cancelled'; action: Action;
  streamEvents?: (AssistantStreamEvent & { receivedAt?: number })[]; streamingContent?: string;
  completedAt?: number; answerStartedAt?: number;
}
let snapshot: { messages: PresentationMessage[]; busy: boolean; action: Action | null; error?: string } = { messages: [], busy: false, action: null }
const startedAt = Date.now(), listeners = new Set<() => void>()
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener) } }
export function setAideActivity(messages: ChatMessage[], busy: boolean, action: Action | null, error?: string) {
  snapshot = { busy, action, error, messages: messages.filter(m => m.role === 'assistant').map((message, index, replies) => ({
    from: 'assistant', action: message.action || 'explain',
    status: message.cancelled ? 'cancelled' : message.error ? 'error' : busy && index === replies.length - 1 ? message.text ? 'streaming' : 'loading' : 'complete',
    streamingContent: message.text, completedAt: message.completedAt, answerStartedAt: message.answerStartedAt,
    streamEvents: [...(message.contextSummaryEvents || []).map(status => ({ type:`context_summary_${status}` as 'context_summary_started' | 'context_summary_completed' | 'context_summary_failed' })), ...(message.tools || []).map<AssistantStreamEvent & { receivedAt?: number }>(tool => tool.status === 'error' ? { type: 'tool_failed', tool: tool.name, message: tool.error || '', receivedAt: tool.receivedAt } : { type: tool.status === 'running' ? 'tool_started' : 'tool_completed', tool: tool.name, receivedAt: tool.receivedAt })],
  })) }
  listeners.forEach(listener => listener())
}
export function useAidePresentation(): AidePresentation {
  const activity = useSyncExternalStore(subscribe, () => snapshot)
  const [, tick] = useState(0)
  const now = Date.now()
  const startup = !activity.messages.length && !activity.busy && !activity.error && now < startedAt + 1200
  const presentation: AidePresentation = activity.error ? { kind: 'error', status: { state: 'error' } }
    : startup ? { kind: 'idle', status: { state: 'startup', phase: now < startedAt + 600 ? 'active' : 'resolved' } }
    : deriveAidePresentation(activity.messages, activity.busy, activity.action, now)
  useEffect(() => {
    const deadline = startup ? startedAt + (Date.now() < startedAt + 600 ? 600 : 1200) : nextAidePresentationChangeAt(activity.messages)
    if (deadline === null) return
    const timer = window.setTimeout(() => tick(value => value + 1), Math.max(0, deadline - Date.now()) + 1)
    return () => window.clearTimeout(timer)
  }, [activity, presentation.kind, presentation.status.state, 'phase' in presentation.status ? presentation.status.phase : null, now])
  return presentation
}
