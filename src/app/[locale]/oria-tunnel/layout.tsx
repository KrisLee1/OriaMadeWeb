import Link from 'next/link'
import {notFound} from 'next/navigation'
import {isLocale,localizedPath} from '@/i18n/config'
import {SiteControls} from '@/components/site/controls'
import {FamilyMenu} from '@/components/site/family-menu'
import {ProductFooter} from '@/components/site/product-footer'
export default async function Layout({children,params}:{children:React.ReactNode;params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();return <div className="oria-tunnel-shell"><header className="tunnel-site-header"><Link className="theme-brand" href={localizedPath(locale,'/oria-tunnel')}>OriaTunnel</Link><div className="product-header-actions"><SiteControls/><FamilyMenu locale={locale} current="oria-tunnel"/></div></header>{children}<ProductFooter locale={locale} product="oria-tunnel"/></div>}
