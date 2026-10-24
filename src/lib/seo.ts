import type { Metadata } from 'next'
import {localizedPath, type Locale} from '@/i18n/config'
export const siteOrigin = 'https://oriamade.com'
export function pageMetadata(locale:Locale,path:string,title:string,description:string):Metadata {
 return {title,description,alternates:{canonical:localizedPath(locale,path),languages:{en:localizedPath('en',path),'zh-CN':localizedPath('zh-CN',path),'x-default':localizedPath('en',path)}},openGraph:{title,description,url:localizedPath(locale,path),siteName:'Oria',locale:locale==='en'?'en_US':'zh_CN',type:'website'}}
}
