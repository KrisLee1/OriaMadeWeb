import {ProductFooter} from '@/components/site/product-footer'
import {notFound} from 'next/navigation'
import {isLocale} from '@/i18n/config'
import {EditorPanelProvider} from '@/features/oria-theme/components/editor-panel-provider'
import {ThemeNavigation} from '@/features/oria-theme/navigation'
import '@/features/oria-theme/migrated.css'
export default async function Layout({children,params}:{children:React.ReactNode;params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();return <div className="oria-theme"><EditorPanelProvider locale={locale==='zh-CN'?'zh':'en'}><ThemeNavigation locale={locale}/>{children}<ProductFooter locale={locale} product="oria-theme"/></EditorPanelProvider></div>}
