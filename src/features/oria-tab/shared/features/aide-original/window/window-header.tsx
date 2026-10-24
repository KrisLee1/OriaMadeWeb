// Ported from OriaAide WindowHeader and App.HeaderAction.
// Chrome hosts the original action capsule beside its popup close control.
import { useRef, type ReactNode } from 'react'
import { FloatingCloseButton } from '@/features/oria-tab/shared/components/ui/floating-close-button'
import { useTranslation } from 'react-i18next'
import { Button } from '@/features/oria-tab/shared/components/ui/button'
import { GlassSurface } from '@/features/oria-tab/shared/components/glass'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/features/oria-tab/shared/components/ui/tooltip'
export function WindowHeader({ children, onClose, movable = false }: { children: ReactNode; onClose: () => void; movable?: boolean }) {
  const { t } = useTranslation()
  const drag = useRef<{ x: number; y: number } | null>(null)
  const post = (data: object) => window.parent.postMessage(data, '*')
  return <header data-glass-content="" className="app-titlebar absolute inset-x-0 top-0 z-30 flex select-none items-start justify-between" {...(movable ? {
    tabIndex: 0, role: 'button', 'aria-label': t('aide.page.move'),
    onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
      if (event.button !== 0 || (event.target as HTMLElement).closest('button')) return
      drag.current = { x: event.screenX, y: event.screenY }; event.currentTarget.setPointerCapture(event.pointerId)
      post({ type: 'oriatab.aide.drag-start' }); event.preventDefault()
    },
    onPointerMove: (event: React.PointerEvent<HTMLElement>) => { if (drag.current) post({ type: 'oriatab.aide.move', dx: event.screenX - drag.current.x, dy: event.screenY - drag.current.y }) },
    onPointerUp: () => { drag.current = null; post({ type: 'oriatab.aide.drag-end' }) },
    onPointerCancel: () => { drag.current = null; post({ type: 'oriatab.aide.drag-end' }) },
    onLostPointerCapture: () => { drag.current = null; post({ type: 'oriatab.aide.drag-end' }) },
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.target !== event.currentTarget || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return
      event.preventDefault(); const step = event.shiftKey ? 40 : 10
      post({ type: 'oriatab.aide.move', dx: event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0, dy: event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0 })
    },
  } : {})}>
    <div className="flex h-fit w-fit shrink-0 items-center" data-window-header-side="left">
      <div className="window-actions overlay flex h-fit w-fit shrink-0 items-center p-0.5"><GlassSurface radius={14} />{children}</div>
    </div>
    <div className="flex h-fit w-fit shrink-0 items-center p-0.5" data-window-header-side="right">
      <FloatingCloseButton placement="inline" onClick={onClose} className="aide-window-close" />
    </div>
  </header>
}
export function HeaderAction({ label, disabled, onClick, children }: { label: string; disabled?: boolean; onClick: () => void; children: ReactNode }) {
  return <Tooltip><TooltipTrigger render={<Button type="button" variant="ghost" size="icon-sm" className="text-muted-foreground" aria-label={label} disabled={disabled} onClick={onClick} />}>{children}</TooltipTrigger><TooltipContent>{label}</TooltipContent></Tooltip>
}
