
import {BrandName} from '@/components/site/brand-name'
import {localize} from '@/i18n/localize'
import {SiteHeader} from '@/components/site/header'
import {SiteFooter} from '@/components/site/footer'
import Link from 'next/link'
import {ArrowUpRight,ArrowDownRight} from 'lucide-react'
import {notFound} from 'next/navigation'
import {isLocale,localizedPath} from '@/i18n/config'
import {products} from '@/content/products'
import {pageMetadata} from '@/lib/seo'
export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return isLocale(locale)?pageMetadata(locale,'/','Oria',localize(locale, 'Thoughtful tools for your digital everyday.', '为你的数字日常，用心打造工具。')):{}}
export default async function Home({params}:{params:Promise<{locale:string}>}) {
 const {locale}=await params;if(!isLocale(locale))notFound();const zh=locale==='zh-CN'
 return <div className="oria-brand-shell"><SiteHeader locale={locale}/><main className="oria-home"><section className="oria-hero"><p className="oria-eyebrow">{localize(locale,"A family of thoughtful tools","用心打造的工具系列")}</p><h1>{localize(locale, <>Made with care.<br/><span>Made for you.</span></>, <>用心创造，<br/><span>自在日常。</span></>)}</h1><div className="oria-hero-bottom"><p>{localize(locale, 'From a fresh start to a new connection. Oria brings considered design and useful tools to your digital everyday.', '从每一次打开，到每一处连接。Oria 将细致的设计与实用的工具，带入你的数字生活。')}</p><a href="#products" className="oria-text-link">{localize(locale, 'Explore the collection', '探索 Oria 系列')}<ArrowDownRight size={22}/></a></div><div className="oria-orbit" aria-hidden="true"><i/><i/><i/><span>O</span></div></section>
 <section id="products" className="oria-products"><div className="oria-section-heading"><p className="oria-eyebrow">{localize(locale,"The collection","Oria 系列")}</p><h2>{localize(locale, 'Different tools. A shared spirit.', '各有所长，一脉相承。')}</h2></div>{products.map(p=><Link className={'oria-product-card '+p.slug} href={localizedPath(locale,'/'+p.slug)} key={p.slug}><div className="oria-product-info"><span className="oria-eyebrow">{p.number} / {localize(locale,p.type)}</span><h3><BrandName name={p.name}/></h3><p>{localize(locale,p.description.en,p.description['zh-CN'])}</p><span className="oria-text-link">{localize(locale, 'Discover', '探索产品')}<ArrowUpRight size={20}/></span></div><div className="oria-product-art"><img src={p.icon} alt="" width={150} height={150}/><div className="oria-art-ring"/></div></Link>)}</section>
 <section className="oria-manifesto"><p className="oria-eyebrow">{localize(locale,"The Oria way","Oria 的理念")}</p><h2>{localize(locale, <>Less friction.<br/>More room for you.</>, <>让工具融入生活，<br/>让细节属于你。</>)}</h2><p>{localize(locale, 'Familiar design. Personal themes. Just the right interaction. Small details that make every Oria tool feel like yours.', '熟悉的设计，自由的主题，恰到好处的交互。让每一款 Oria，都成为你喜欢使用的工具。')}</p></section></main><SiteFooter locale={locale}/></div>
}
