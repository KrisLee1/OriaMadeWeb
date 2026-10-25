import {notFound} from 'next/navigation'
import {isLocale} from '@/i18n/config'
import {pageMetadata} from '@/lib/seo'
import {downloadCopy} from '@/features/oria-tunnel/download-copy'
import {TunnelDownloadPage} from '@/features/oria-tunnel/download-page'
import '@/features/oria-tunnel/download.css'

export async function generateMetadata({params}:{params:Promise<{locale:string}>}) {
 const {locale}=await params
 return isLocale(locale)?pageMetadata(locale,'/oria-tunnel/download',downloadCopy[locale].download,downloadCopy[locale].intro):{}
}
export default async function Page({params}:{params:Promise<{locale:string}>}) {
 const {locale}=await params
 if(!isLocale(locale))notFound()
 return <TunnelDownloadPage locale={locale}/>
}
