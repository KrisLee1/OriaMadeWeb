// Ported from OriaAide MainWindowShell's normal window branch.
import type { ReactNode } from 'react'
import { AidePresence } from '@/features/oria-tab/shared/features/aide-original/avatar/aide-presence'
export function MainWindowShell({ compact, children }: { compact: boolean; children: ReactNode }) {
  return <div className="aide-window-shell relative size-full overflow-hidden rounded-[inherit]"><div data-glass-content="" className="window-content absolute inset-0">{children}</div><AidePresence compact={compact} /></div>
}
export function PanelLayer({ active, children, label, className = '' }: { active: boolean; children: ReactNode; label: string; className?: string }) {
  return <div data-glass-content="" className={`aide-panel-layer absolute ${className}`} hidden={!active} inert={!active || undefined} aria-label={label} role="region">{children}</div>
}
