import {isLocale} from './i18n/config'
import { NextResponse, type NextRequest } from 'next/server'
export function proxy(request: NextRequest) {
 const path = request.nextUrl.pathname
 if (isLocale(path.split('/')[1])) return NextResponse.next()
 const url = request.nextUrl.clone(); url.pathname = '/en' + (path === '/' ? '' : path)
 return NextResponse.rewrite(url)
}
export const config = {matcher:['/((?!api|_next|products/|favicon.ico|sitemap.xml|robots.txt|.*\\.).*)']}
