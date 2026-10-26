import {notFound} from 'next/navigation'
import {isLocale} from '@/i18n/config'
import {pageMetadata} from '@/lib/seo'
import {content} from '@/features/oria-tab/website/content.mjs'
import {TabPage} from '@/features/oria-tab/page'

export async function generateMetadata({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params
  return isLocale(locale) ? pageMetadata(locale, '/oria-tab', 'OriaTab', content[locale].scenes[0][2]) : {}
}
export default async function Page({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params
  if (!isLocale(locale)) notFound()
  return <TabPage locale={locale}/>
}
