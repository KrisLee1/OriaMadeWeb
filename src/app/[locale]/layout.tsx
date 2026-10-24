import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {createBootstrapStorageScript} from '@oriatheme/runtime-dom'
import {ThemeProvider} from '@/lib/theme/provider'
import {defaultThemeCss} from '@/lib/theme/default-style'
import {LanguageProvider} from '@/i18n/provider'
import {isLocale,locales} from '@/i18n/config'
import {siteOrigin} from '@/lib/seo'
import '@/styles/globals.css'
export const metadata:Metadata={metadataBase:new URL(siteOrigin),title:{default:'Oria — Made for you',template:'%s · Oria'},description:'Thoughtful tools for your digital everyday.'}
export function generateStaticParams(){return locales.map(locale=>({locale}))}
const bootstrap=createBootstrapStorageScript({storageKey:'oria-made-theme',contract:{name:'oria-standard',version:2}})+`;(()=>{const r=document.documentElement;r.classList.toggle('dark',r.dataset.oriaMode==='dark'||(!r.dataset.oriaMode&&matchMedia('(prefers-color-scheme: dark)').matches))})();`
export default async function Layout({children,params}:{children:React.ReactNode;params:Promise<{locale:string}>}) {
 const {locale}=await params;if(!isLocale(locale))notFound()
 return <html data-scroll-behavior="smooth" lang={locale} suppressHydrationWarning><head><style id="oria-default-theme">{defaultThemeCss}</style><script id="oria-theme-bootstrap" dangerouslySetInnerHTML={{__html:bootstrap}}/></head><body><LanguageProvider key={locale} locale={locale}><ThemeProvider><a className="skip-link" href="#main-content">{locale==='en'?'Skip to content':'跳至正文'}</a><div id="main-content" tabIndex={-1}>{children}</div></ThemeProvider></LanguageProvider></body></html>
}
