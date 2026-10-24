import { NextResponse, type NextRequest } from 'next/server'
export function proxy(request: NextRequest) {
 const path = request.nextUrl.pathname
 if (path === '/en' || path.startsWith('/en/')) {
   return NextResponse.next()
 }
 if (path === '/zh-CN' || path.startsWith('/zh-CN/')) return NextResponse.next()
 const url = request.nextUrl.clone(); url.pathname = '/en' + (path === '/' ? '' : path)
 return NextResponse.rewrite(url)
}
export const config = {matcher:['/((?!api|_next|products/|favicon.ico|sitemap.xml|robots.txt|.*\\.).*)']}
