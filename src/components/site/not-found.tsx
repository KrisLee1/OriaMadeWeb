"use client"
import Link from 'next/link'
import {useSiteLocale} from '@/i18n/provider'
import {localize} from '@/i18n/localize'
import {localizedPath} from '@/i18n/config'
export default function NotFound(){const locale=useSiteLocale();return <main className="oria-empty"><p>404</p><h1>{localize(locale,'Page not found','页面未找到')}</h1><Link href={localizedPath(locale)}>Oria →</Link></main>}
