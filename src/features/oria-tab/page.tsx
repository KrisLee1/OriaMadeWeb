import Link from 'next/link'
import {ArrowDown, ArrowUpRight, Check, Download, Fingerprint, FolderOpen, Languages, LayoutGrid, MessageCircle, Monitor, Palette, Search, ShieldCheck, Sparkles} from 'lucide-react'
import {localizedPath, type Locale} from '@/i18n/config'
import {localize} from '@/i18n/localize'
import {TabDemo} from './story-client'
import {content} from './website/content.mjs'
import {site} from './website/site-config.mjs'
import {PlatformIcon} from './website/platform-icons.mjs'

export function TabPage({locale}: {locale: Locale}) {
  const c = content[locale]
  const featureIcons = [Search, LayoutGrid, MessageCircle, Sparkles]
  const previews = ['search', 'organize', 'aide', 'web'] as const
  return <main className="tab-main">
    <section className="tab-hero" id="begin">
      <div className="tab-hero-haze" aria-hidden="true"/>
      <div className="tab-hero-copy">
        <p className="tab-eyebrow"><i/>OriaTab <span/> Chrome & Edge</p>
        <h1>{c.scenes[0][1].split('\n').map((line: string) => <span key={line}>{line}</span>)}</h1>
        <p className="tab-hero-description">{c.scenes[0][2]}</p>
        <div className="tab-actions"><a className="tab-button tab-button-primary" href="#get"><Download size={16}/>{c.nav[4]}</a><a className="tab-button tab-button-quiet" href="#workspace">{c.nav[0]}<ArrowDown size={16}/></a></div>
        <p className="tab-hero-note"><Monitor size={13}/>{c.scenes[6][3]}<span/>v{site.version}</p>
      </div>
      <div className="tab-hero-workspace" id="workspace">
        <div className="tab-demo-meta"><span><i/>{c.demo[19]}</span><span>OriaTab {site.version} · Chrome / Edge</span></div>
        <TabDemo locale={locale}/>
        <p className="tab-demo-note">{localize(locale, 'Interactive product preview. Sample content only; no browser data or AI requests.', '交互式产品演示。仅使用示例内容，不读取浏览器数据或发送 AI 请求。')}</p>
      </div>
    </section>
    <section id="workflow" className="tab-section tab-workflow">
      <header className="tab-section-heading"><p className="tab-eyebrow">{c.scenes[1][3]}</p><h2>{c.scenes[1][1].replace('\n', '')}</h2><p>{c.journal[3]}</p></header>
      <div className="tab-feature-grid">{previews.map((preview, i) => {
        const scene = c.scenes[i + 1], Icon = featureIcons[i]
        return <article id={['search', 'organize', 'imagine', 'on-the-web'][i]} className="tab-feature" key={preview}>
          <div className="tab-feature-copy"><p className="tab-eyebrow"><span>0{i + 1}</span><Icon size={14}/>{scene[0]}</p><h3>{scene[1].replace('\n', '')}</h3><p>{scene[2]}</p></div>
          <div className="tab-feature-window"><TabDemo locale={locale} variant={preview}/></div>
          <p className="tab-feature-note">{scene[3]}</p>
        </article>
      })}</div>
    </section>
    <section id="appearance" className="tab-section tab-appearance">
      <header className="tab-section-heading"><p className="tab-eyebrow">OriaTheme</p><h2>{c.scenes[5][1].replace('\n', '')}</h2><p>{c.scenes[5][2]}</p></header>
      <div className="tab-theme-gallery" aria-hidden="true">{['dawn', 'aurora', 'dusk'].map((wall, i) => <div className={`tab-theme-sample tab-theme-sample-${i}`} key={wall}><img src={`/products/oria-tab/assets/wallpapers/${wall}.svg`} alt="" loading="lazy"/><div className="tab-sample-search"><Search size={15}/><span>OriaTab</span></div><div className="tab-sample-dock">{[LayoutGrid, MessageCircle, Palette].map((Icon, n) => <span key={n}><Icon size={15}/></span>)}</div></div>)}</div>
      <div className="tab-detail-grid">{[[Palette, '44', c.settings[1]], [Sparkles, c.settings[2], 'OriaTab'], [Monitor, c.settings[3], c.settings[4]], [Languages, '8', c.nav[5]]].map(([Icon, title, label], i) => {
        const DetailIcon = Icon as typeof Palette
        return <article key={i}><DetailIcon size={22}/><h3>{title as string}</h3><p>{label as string}</p></article>
      })}</div>
      <Link className="tab-text-link" href={localizedPath(locale, '/oria-theme')}>{c.download[11]}<ArrowUpRight size={15}/></Link>
    </section>
    <section id="local" className="tab-section tab-privacy">
      <div className="tab-privacy-mark" aria-hidden="true"><ShieldCheck size={46}/><span/><Fingerprint size={22}/></div>
      <div><p className="tab-eyebrow">{c.scenes[6][0]}</p><h2>{c.scenes[6][1].replace('\n', '')}</h2><p>{c.scenes[6][2]}</p><div className="tab-privacy-points">{[c.stage[7], c.stage[8], c.scenes[6][3]].map((text: string) => <span key={text}><Check size={14}/>{text}</span>)}</div><Link className="tab-text-link" href={localizedPath(locale, '/oria-tab/privacy')}>{c.privacy[2]}<ArrowUpRight size={15}/></Link></div>
    </section>
    <section id="family" className="tab-family"><p className="tab-eyebrow">{c.scenes[7][0]}</p><h2>{c.scenes[7][1].replace('\n', '')}</h2><p>{c.scenes[7][2]}</p><Link className="tab-text-link" href={localizedPath(locale)}>{c.scenes[7][3]}<ArrowUpRight size={15}/></Link></section>
    <section id="get" className="tab-install">
      <img className="tab-install-logo" src="/products/oria-tab/assets/logo.svg" width={64} height={64} alt=""/>
      <p className="tab-eyebrow">{c.scenes[8][3]}</p><h2>{c.scenes[8][1].replace('\n', '')}</h2><p className="tab-install-description">{c.scenes[8][2]}</p>
      <div className="tab-actions tab-store-actions"><a className="tab-button tab-button-primary" href={site.chrome}><PlatformIcon platform="chrome"/>{c.download[1]}<ArrowUpRight size={15}/></a><a className="tab-button tab-button-quiet" href={site.edge}><PlatformIcon platform="edge"/>{c.download[0]}<ArrowUpRight size={15}/></a></div>
      <div className="tab-install-manual"><header><div><p className="tab-eyebrow">GitHub · v{site.version}</p><h3>{c.download[4]}</h3></div><a className="tab-text-link" href={site.releaseRepository + '/releases/latest'}>{c.download[2]}<ArrowUpRight size={14}/></a></header>
        <ol>{[Download, Monitor, FolderOpen, LayoutGrid].map((Icon, i) => <li key={i}><span className="tab-step-number">0{i + 1}</span><Icon size={20}/><h4>{c.stage[10 + i]}</h4><p>{c.download[5 + i]}</p></li>)}</ol>
      </div>
      <div className="tab-install-links"><Link href={localizedPath(locale, '/oria-tab/changelog')}>{c.nav[2]}<ArrowUpRight size={13}/></Link><a href={site.releaseRepository + '/releases'}>{c.download[9]}<ArrowUpRight size={13}/></a></div>
    </section>
  </main>
}
