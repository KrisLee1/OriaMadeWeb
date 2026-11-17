'use client'

import {useState} from 'react'
import type {Locale} from '@/i18n/config'
import {TerminalPreview} from './terminal-preview'

export function TerminalDock({locale, open, onClose, initialDock}: {locale: Locale; open: boolean; initialDock?: "bottom" | "right"; onClose: () => void}) {
  const [mounted, setMounted] = useState(open)
  if (open && !mounted) setMounted(true)
  return mounted ? <TerminalPreview key={locale} locale={locale} initialDock={initialDock} open={open} onClose={onClose}/> : null
}
