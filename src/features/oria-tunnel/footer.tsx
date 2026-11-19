import Link from 'next/link'
import {BrandName} from '@/components/site/brand-name'
import {Reveal} from '@/components/ui/reveal'
import {products} from '@/content/products'
import {localizedPath, type Locale} from '@/i18n/config'
import {localize} from '@/i18n/localize'
import {CardArt} from './card-art'
import {tunnelContent} from './content'
import {downloadCopy} from './download-copy'
import {tunnelRelease} from './release'

const repository = 'https://github.com/KrisLee1/OriaTunnel'

export function TunnelFooter({locale}: {locale: Locale}) {
  const home = localizedPath(locale, '/oria-tunnel')
  const features = localize(locale, 'Features')
  const support = localize(locale, 'Support')
  const collection = localize(locale, 'Oria collection', 'Oria 系列')
  const c = downloadCopy[locale]
  return <Reveal as="footer" className="product-footer tunnel-footer" id="tunnel-footer">
    <div className="tunnel-footer-card tunnel-card">
      <CardArt scene="footer"/>
      <div className="tunnel-footer-directory">
        <div className="tunnel-footer-about">
          <Link className="tunnel-footer-brand" href={home}>
            <img src="/products/oria-tunnel/logo.svg" width={32} height={32} alt=""/>
            <BrandName name="OriaTunnel"/>
          </Link>
          <p>{localize(locale, 'Manage SSH tunnels, remote services, terminals, file transfers and remote desktops together in OriaTunnel.')}</p>
          <small className="tunnel-footer-credits">
            <span>© 2026 KrisLee</span><span aria-hidden="true">·</span>
            <a rel="license" href={repository+'/blob/master/LICENSE'}>GPL-3.0-only</a>
          </small>
        </div>
        <div className="tunnel-footer-links">
          <nav aria-label={features}><h2>{features}</h2>
            {tunnelContent[locale].nav.map(({id,label})=><Link key={id} href={home+'#'+id}>{label}</Link>)}
          </nav>
          <nav aria-label={support}><h2>{support}</h2>
            <a href={tunnelRelease.releaseUrl}>{c.releaseNotes}</a>
            <a href={repository+'/releases'}>{c.previousReleases}</a>
            <a href={repository}>GitHub</a>
          </nav>
          <nav aria-label={collection}><h2>{collection}</h2>
            <Link href={localizedPath(locale)}>{localize(locale,'Oria home','Oria 首页')}</Link>
            {products.filter(p=>p.slug!=='oria-tunnel').map(p=><Link key={p.slug} href={localizedPath(locale,'/'+p.slug)}>{p.name}</Link>)}
          </nav>
        </div>
      </div>
    </div>
  </Reveal>
}
