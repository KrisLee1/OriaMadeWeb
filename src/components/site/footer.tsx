
import {BrandName} from '@/components/site/brand-name'
import {localize} from '@/i18n/localize'
import Link from 'next/link'
import {products} from '@/content/products'
import {localizedPath,type Locale} from '@/i18n/config'
export function SiteFooter({locale}:{locale:Locale}) {return <footer className="oria-footer"><Link href={localizedPath(locale)} className="oria-wordmark"><BrandName/></Link><p>{localize(locale, 'Thoughtful tools. A little more yours.', '用心做工具，让日常更自在。')}</p><nav aria-label="Oria">{products.map(p=><Link key={p.slug} href={localizedPath(locale,"/"+p.slug)}>{p.name}</Link>)}</nav><a href="https://github.com/KrisLee1">GitHub ↗</a></footer>}
