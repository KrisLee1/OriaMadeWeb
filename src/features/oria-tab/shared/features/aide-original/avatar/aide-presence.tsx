// OriaAide AidePresence's center/titlebar branches. Native floating-window controls omitted.
import { useTranslation } from 'react-i18next'
import { useApp } from '@/features/oria-tab/website/state'
import { usePopupReady } from '@/features/oria-tab/shared/lib/popup-render'
import { useAideThemeColor } from '@/features/oria-tab/shared/features/aide-original/avatar/use-aide-theme-color'
import { AideAvatar } from '@/features/oria-tab/shared/features/aide-original/avatar/aide-avatar'
import { useAidePresentation } from '@/features/oria-tab/shared/features/aide-original/avatar/activity-store'
import { isAideExecutionPresentation } from '@/features/oria-tab/shared/features/aide-original/avatar/aide-presentation'
export function AidePresence({ compact }: { compact: boolean }) {
  const { t } = useTranslation('aideOriginal')
  const { state } = useApp()
  const popupReady = usePopupReady()
  const presentation = useAidePresentation()
  const baseColor = useAideThemeColor()
  const label = t(`aide.status.${presentation.kind}`)
  return <div data-glass-content="" className="aide-presence" data-aide-base-color={baseColor} data-placement={compact ? 'titlebar' : 'center'} data-status={presentation.kind} data-aide-state={presentation.status.state} data-execution-active={isAideExecutionPresentation(presentation.kind) || undefined} data-reduced-motion={state.settings.reduceMotion || undefined}>
    {/* The entry spring owns the frame budget; start decorative SVG motion
        once it settles, using the avatar's existing static-pose support. */}
    <AideAvatar paused={!popupReady} baseColor={baseColor} status={presentation.status} size="100%" ariaLabel={label} interactive idleBehavior={compact ? 'off' : 'auto'} idleDelay={7} motion={state.settings.reduceMotion ? 'reduced' : 'system'} />
    <span className="sr-only" aria-live="polite" aria-atomic="true">{label}</span>
  </div>
}
