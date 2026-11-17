import {notFound} from 'next/navigation'
import {isLocale} from '@/i18n/config'
import {TunnelFooter} from '@/features/oria-tunnel/footer'
import {TunnelHeader} from '@/features/oria-tunnel/header'
import '@/features/oria-tunnel/tunnel.css'

export default async function Layout({children,params}:{children:React.ReactNode;params:Promise<{locale:string}>}) {
  const {locale}=await params
  if(!isLocale(locale))notFound()
  return <div className="oria-tunnel-shell"><TunnelHeader locale={locale}/>{children}<TunnelFooter locale={locale}/></div>
}
