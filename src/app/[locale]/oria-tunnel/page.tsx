import {notFound} from 'next/navigation'
import {isLocale} from '@/i18n/config'
import {pageMetadata} from '@/lib/seo'
import {tunnelContent} from '@/features/oria-tunnel/content'
import {TunnelPage} from '@/features/oria-tunnel/page'
import '@/features/oria-tunnel/native-demo.css'
import '@/features/oria-tunnel/native-file-artwork.css'
import '@/features/oria-tunnel/native-files.css'
import '@/features/oria-tunnel/file-demo.css'
import '@/features/oria-tunnel/native-terminal/terminal.css'

export async function generateMetadata({params}:{params:Promise<{locale:string}>}) {
  const {locale}=await params
  return isLocale(locale)?pageMetadata(locale,'/oria-tunnel','OriaTunnel',tunnelContent[locale].metadata):{}
}

export default async function Page({params}:{params:Promise<{locale:string}>}) {
  const {locale}=await params
  if(!isLocale(locale))notFound()
  return <TunnelPage locale={locale}/>
}
