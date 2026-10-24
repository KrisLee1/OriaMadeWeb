import {notFound} from 'next/navigation'
import {isLocale} from '@/i18n/config'
import {TabShell} from '@/features/oria-tab/shell'
import {ProductFooter} from '@/components/site/product-footer'
import '@/features/oria-tab/migrated.css'
export default async function Layout({children,params}:{children:React.ReactNode;params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();return <TabShell locale={locale}>{children}<ProductFooter locale={locale} product="oria-tab"/></TabShell>}
