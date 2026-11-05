'use client'

import Link from 'next/link'
import {ArrowUpRight,Check,Palette} from 'lucide-react'
import {useOriaTheme} from '@oriatheme/react'
import {oriaPresetCatalog} from '@oriatheme/presets'
import {resolveTheme} from '@oriatheme/core'
import {Button} from '@/components/ui/button'
import {useEditorPanel} from '../editor-panel-provider'
import {getCopy,type Locale} from '../../lib/i18n'
import {themePath} from '../../lib/paths'

export function HomeThemePreview({locale}:{locale:Locale}) {
 const {snapshot}=useOriaTheme()
 const {activeTheme,requestThemeChange}=useEditorPanel()
 const copy=getCopy(locale)
 const presets=oriaPresetCatalog.filter((_,index)=>[0,3,8].includes(index)).map(({theme})=>theme)
 return <div className="home-theme-preview">
  <header><Palette size={16}/><span>OriaTheme</span><span className="home-preview-status"><i/>{copy.home.hero.eyebrow}</span></header>
  <div className="home-preview-canvas">
   <div className="home-preview-type" aria-hidden="true"><span>Aa</span><i/><i/><i/></div>
   <div className="home-preview-tokens">{['primary','accent','surface','fg'].map(token=><div key={token}><i style={{background:`var(--oria-color-${token})`}}/><code>color.{token}</code></div>)}</div>
   <div className="home-preview-surface"><span className="home-preview-avatar" aria-hidden="true">O</span><div><strong>{activeTheme.name}</strong><p>{copy.home.features.cards[0].title}</p></div><Check size={16}/></div>
   <Link href={`${themePath(locale)}/editor`} className="home-preview-action">{copy.home.hero.primaryCta}<ArrowUpRight size={15}/></Link>
  </div>
  <div className="home-preview-presets" aria-label={copy.home.presets.kicker}>{presets.map(theme=>{
   const variables=resolveTheme(theme,snapshot.resolvedMode).variables
   return <Button key={theme.id} variant="ghost" size="sm" aria-pressed={activeTheme.id===theme.id} onClick={event=>requestThemeChange(theme.id,event.currentTarget)}><i style={{background:variables['--oria-color-primary']}}/>{theme.name}</Button>
  })}</div>
 </div>
}
