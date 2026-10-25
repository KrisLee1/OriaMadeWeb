'use client'

import {BrandName} from '@/components/site/brand-name'
import {localize} from '@/i18n/localize'
import Link from 'next/link'
import {Popover} from '@base-ui/react/popover'
import {Palette} from 'lucide-react'
import {SiteControls} from '@/components/site/controls'
import {localizedPath,type Locale} from '@/i18n/config'
import {WebsiteStateProvider} from './website/state'
import {AppearanceControls} from './website/appearance'
export function TabShell({locale,children}:{locale:Locale;children:React.ReactNode}){return <WebsiteStateProvider locale={locale}><div className="oria-tab-shell"><header className="tab-site-header"><Link className="tab-brand tab-header-island" href={localizedPath(locale,'/oria-tab')}><img src="/products/oria-tab/assets/logo.svg" alt="" width={28} height={28}/><BrandName name="OriaTab"/></Link><div className="tab-header-island product-header-actions"><SiteControls/><Popover.Root><Popover.Trigger className="tab-appearance-trigger" aria-label={localize(locale, 'Demo appearance', '演示外观')}><Palette size={17}/></Popover.Trigger><Popover.Portal><Popover.Positioner sideOffset={10} align="end" className="z-50"><Popover.Popup className="tab-appearance-popover floating-surface"><Popover.Title>{localize(locale, 'Appearance', '外观设置')}</Popover.Title><AppearanceControls/></Popover.Popup></Popover.Positioner></Popover.Portal></Popover.Root></div></header>{children}</div></WebsiteStateProvider>}
