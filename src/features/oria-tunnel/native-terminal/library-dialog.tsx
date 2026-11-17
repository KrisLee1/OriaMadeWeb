import type {ReactNode} from 'react'
import {Dialog} from '@base-ui/react/dialog'
import {X} from 'lucide-react'
import {useTranslation} from 'react-i18next'
import {Button} from '@/components/ui/button'

export function Modal({title, close, children}: {title: string; close: () => void; children: ReactNode}) {
  const {t} = useTranslation('terminal')
  return <Dialog.Root open onOpenChange={open => { if (!open) close() }}>
    <Dialog.Portal>
      <Dialog.Backdrop className="file-preview-backdrop"/>
      <Dialog.Popup className="tunnel-terminal-ui terminal-library floating-surface">
        <header><Dialog.Title>{title}</Dialog.Title>
          <Button variant="ghost" size="icon-sm" aria-label={t('collapse')} onClick={close}><X/></Button>
        </header>
        {children}
      </Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>
}
export function Field({label, children}: {label: string; children: ReactNode}) {
  return <label className="field"><span>{label}</span>{children}</label>
}
export function ModalActions({children}: {children: ReactNode}) {
  return <footer>{children}</footer>
}
