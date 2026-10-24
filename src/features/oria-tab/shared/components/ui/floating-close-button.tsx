import type { ComponentProps } from 'react'
import { XIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/features/oria-tab/shared/components/ui/button'
import { GlassSurface } from '@/features/oria-tab/shared/components/glass'
import { cn } from '@/features/oria-tab/shared/lib/utils'

export function FloatingCloseButton({ className, placement = 'corner', ...props }: ComponentProps<typeof Button> & { placement?: 'corner' | 'inline' }) {
  const { t } = useTranslation()
  return <Button type="button" variant="ghost" size="icon-sm" aria-label={t('close')} data-close-placement={placement} className={cn('floating-popup-close', className)} {...props}><GlassSurface radius={14} effects={placement === 'inline' ? 'full' : 'static'} /><XIcon aria-hidden="true" className="size-3.5" /></Button>
}
