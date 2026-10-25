import type { Metadata } from 'next'
import {localizedPath, locales, type Locale} from '@/i18n/config'
export const siteOrigin = new URL(process.env.SITE_URL || 'https://oriamade.com').origin
export const brandIcons = {
 Oria:'/favicon.svg',
 OriaTheme:'/products/oria-theme/icons/color-swatch-fan.svg',
 OriaTab:'/products/oria-tab/assets/logo.svg',
 OriaTunnel:'/products/oria-tunnel/logo.svg',
} as const
export function pageIdentity(path:string) {
 const brand=path.startsWith('/oria-theme')?'OriaTheme':path.startsWith('/oria-tab')?'OriaTab':path.startsWith('/oria-tunnel')?'OriaTunnel':'Oria'
 return {brand,icon:brandIcons[brand]}
}
export function pageMetadata(locale:Locale,path:string,title:string,description:string):Metadata {
 const {brand,icon}=pageIdentity(path)
 const home=path==='/'||/^\/oria-(theme|tab|tunnel)$/.test(path)
 const documentTitle=home?brand:`${title} · ${brand}`
 return {title:{absolute:documentTitle},description,icons:{icon:[...(brand==='Oria'?[{url:'/favicon.ico',sizes:'32x32',type:'image/x-icon'}]:[]),{url:icon,type:'image/svg+xml',sizes:'any'}],shortcut:icon},alternates:{canonical:localizedPath(locale,path),languages:{...Object.fromEntries(locales.map(language=>[language,localizedPath(language,path)])),'x-default':localizedPath('en',path)}},openGraph:{title:documentTitle,description,url:localizedPath(locale,path),siteName:brand,locale:({en:'en_US','zh-CN':'zh_CN','zh-TW':'zh_TW',ja:'ja_JP',ko:'ko_KR',de:'de_DE',fr:'fr_FR',ru:'ru_RU'})[locale],type:'website'}}
}
