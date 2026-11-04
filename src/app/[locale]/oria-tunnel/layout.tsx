import {notFound} from 'next/navigation'
import {isLocale} from '@/i18n/config'
import {ProductFooter} from '@/components/site/product-footer'
import {TunnelHeader} from '@/features/oria-tunnel/header'
import '@/features/oria-tunnel/native-demo.css'
import '@/features/oria-tunnel/tunnel.css'
import '@/features/oria-tunnel/native-file-artwork.css'
import '@/features/oria-tunnel/native-files.css'
import '@/features/oria-tunnel/file-demo.css'

export default async function Layout({children,params}:{children:React.ReactNode;params:Promise<{locale:string}>}) {
  const {locale}=await params
  if(!isLocale(locale))notFound()
  return <div className="oria-tunnel-shell"><TunnelHeader locale={locale}/>{children}<ProductFooter locale={locale} product="oria-tunnel"/></div>
}
