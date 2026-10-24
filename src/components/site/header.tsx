"use client";
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {ThemeSelect} from '@/components/theme/theme-select'
import {ThemeModeToggle} from '@/components/theme/theme-mode-toggle'
import {LanguageSelect} from '@/components/language/language-select'
import {localizedPath,type Locale} from '@/i18n/config'
import {products} from '@/content/products'
export function SiteHeader({locale}:{locale:Locale}) {
 const pathname=usePathname()
 return <header className="oria-header"><div className="oria-header-inner">
 <Link href={localizedPath(locale)} className="oria-wordmark" aria-label={locale==='en'?'Oria home':'Oria 首页'}><span className="oria-symbol" aria-hidden="true"/>Oria<span className="oria-made">made for you.</span></Link>
 <nav className="oria-product-nav" aria-label={locale==='en'?'Products':'产品'}>{products.map(p=><Link key={p.slug} href={localizedPath(locale,'/'+p.slug)} aria-current={pathname.includes('/'+p.slug)?'page':undefined}>{p.name}</Link>)}</nav>
 <div className="oria-controls"><ThemeSelect variant="ghost" size="sm" displayMode="icon" align="end"/><ThemeModeToggle variant="ghost" size="icon" displayMode="icon" align="end"/><LanguageSelect variant="ghost" size="sm" displayMode="icon" align="end"/></div>
 </div></header>
}
