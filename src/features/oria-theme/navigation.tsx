'use client'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {SlidersHorizontal} from 'lucide-react'
import {localizedPath,type Locale} from '@/i18n/config'
import {SiteControls} from '@/components/site/controls'
import {FamilyMenu} from '@/components/site/family-menu'
import {useEditorPanel} from './components/editor-panel-provider'
export function ThemeNavigation({locale}:{locale:Locale}){
 const path=usePathname(),{toggleEditor,editorShown}=useEditorPanel(),zh=locale==='zh-CN'
 return <header className="theme-site-header"><Link className="theme-brand" href={localizedPath(locale,'/oria-theme')}><img src="/products/oria-theme/icons/color-swatch-fan.svg" alt="" width={32} height={32}/><span>Oria<b>Theme</b></span></Link><nav aria-label="OriaTheme"><Link href={localizedPath(locale,'/oria-theme/docs')} aria-current={path.includes('/docs')?'page':undefined}>{zh?'文档':'Documentation'}</Link><Link href={localizedPath(locale,'/oria-theme/editor')} aria-current={path.endsWith('/editor')?'page':undefined}>{zh?'体验与编辑':'Playground'}</Link><a href="https://github.com/KrisLee1/OriaTheme">GitHub ↗</a></nav><div className="product-header-actions">{path.endsWith('/editor')&&<button className="family-trigger" onClick={toggleEditor} aria-label={zh?'编辑面板':'Editor panel'} aria-expanded={editorShown} aria-controls="theme-editor-panel"><SlidersHorizontal size={17}/></button>}<SiteControls/><FamilyMenu locale={locale} current="oria-theme"/></div></header>
}
