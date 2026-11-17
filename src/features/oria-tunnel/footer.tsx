import {Reveal} from '@/components/ui/reveal'
import Link from 'next/link'
import {ArrowRight} from 'lucide-react'
import {BrandName} from '@/components/site/brand-name'
import {CardArt} from './card-art'
import {localizedPath, type Locale} from '@/i18n/config'
import {localize} from '@/i18n/localize'
import {products} from '@/content/products'
import {downloadCopy} from './download-copy'
import {tunnelRelease} from './release'

export function TunnelFooter({locale}: {locale: Locale}) {
  const home = localizedPath(locale, '/oria-tunnel')
  const support = localize(locale, 'Product and support', '产品与支持')
  const collection = localize(locale, 'Oria collection', 'Oria 系列')
  const c = downloadCopy[locale]
  return <Reveal as="footer" className="product-footer tunnel-footer" id="tunnel-footer">
    <div className="tunnel-footer-download tunnel-card">
      <CardArt scene="download"/>
      <div className="tunnel-card-copy"><div><h2>{c.title}</h2><p>macOS · Windows</p></div>
      <Link className="tunnel-button tunnel-button-primary" href={home+'/download#platforms'}>{c.choose}<ArrowRight size={15}/></Link></div>
    </div>
    <div className="tunnel-footer-directory tunnel-card">
      <Link className="tunnel-footer-brand" href={home}><BrandName name="OriaTunnel"/></Link>
      <nav aria-label={support}><h2>{support}</h2>
        <a href={tunnelRelease.releaseUrl}>{c.releaseNotes}</a>
        <a href="https://github.com/KrisLee1/OriaTunnel/releases">{c.previousReleases}</a>
        <a href="https://github.com/KrisLee1/OriaTunnel">GitHub</a>
      </nav>
      <nav aria-label={collection}><h2>{collection}</h2>
        <Link href={localizedPath(locale)}>{localize(locale,'Oria home','Oria 首页')}</Link>
        {products.filter(p=>p.slug!=='oria-tunnel').map(p=><Link key={p.slug} href={localizedPath(locale,'/'+p.slug)}>{p.name}</Link>)}
      </nav>
    </div>
  </Reveal>
}
