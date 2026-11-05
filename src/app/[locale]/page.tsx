
import {Reveal} from '@/components/ui/reveal'
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
const productTags = [
 ['Themes','Design tokens','Live editor'],
 ['Search','Bookmarks','AI assistant'],
 ['SSH tunnels','File transfer','Remote services'],
] as const
export default async function Home({params}:{params:Promise<{locale:string}>}) {
 const {locale}=await params
 if(!isLocale(locale))notFound()
 return <div className="oria-brand-shell">
  <SiteHeader locale={locale}/>
  <main className="oria-home">
   <section className="oria-hero">
    <Reveal immediate>
     <p className="oria-eyebrow">{localize(locale,'A family of thoughtful tools','用心打造的工具系列')}</p>
     <h1>{localize(locale,<>Made with care.<br/><span>Made for you.</span></>,<>用心创造，<br/><span>自在日常。</span></>)}</h1>
     <div className="oria-hero-bottom">
      <p>{localize(locale,'From a fresh start to a new connection. Oria brings considered design and useful tools to your digital everyday.','从每一次打开，到每一处连接。Oria 将细致的设计与实用的工具，带入你的数字生活。')}</p>
      <a href="#products" className="oria-text-link">{localize(locale,'Explore the collection','探索 Oria 系列')}<ArrowDownRight size={20}/></a>
     </div>
    </Reveal>
    <Reveal immediate delay={0.12}>
     <aside className="oria-hero-index" aria-label={localize(locale,'Find your starting point','从这里开始')}>
      <p className="oria-eyebrow">{localize(locale,'Find your starting point','从这里开始')}</p>
      {products.map(product=><a href={'#'+product.slug} key={product.slug}><img src={product.icon} alt="" width={28} height={28}/><BrandName name={product.name}/><ArrowUpRight size={16}/></a>)}
     </aside>
    </Reveal>
   </section>
   <section id="products" className="oria-products">
    <div className="oria-section-heading"><p className="oria-eyebrow">{localize(locale,'The collection','Oria 系列')}</p><h2>{localize(locale,'Different tools. A shared spirit.','各有所长，一脉相承。')}</h2></div>
    <div className="oria-product-grid">{products.map((product,index)=><Reveal key={product.slug} delay={index*0.07}>
     <Link id={product.slug} className="oria-product-card" data-product={product.slug} href={localizedPath(locale,'/'+product.slug)}>
      <div className="oria-product-art"><img src={product.icon} alt="" width={92} height={92}/><div className="oria-art-ring"/></div>
      <div className="oria-product-info">
       <span className="oria-eyebrow">{product.number} / {localize(locale,product.type)}</span>
       <h3><BrandName name={product.name}/></h3>
       <p>{localize(locale,product.description.en,product.description['zh-CN'])}</p>
       <ul className="oria-product-tags">{productTags[index].map(tag=><li key={tag}>{localize(locale,tag)}</li>)}</ul>
       <span className="oria-text-link">{localize(locale,'Discover','探索产品')}<ArrowUpRight size={17}/></span>
      </div>
     </Link>
    </Reveal>)}</div>
   </section>
   <Reveal><section className="oria-manifesto">
    <p className="oria-eyebrow">{localize(locale,'The Oria way','Oria 的理念')}</p>
    <h2>{localize(locale,<>Less friction.<br/>More room for you.</>,<>让工具融入生活，<br/>让细节属于你。</>)}</h2>
    <p>{localize(locale,'Familiar design. Personal themes. Just the right interaction. Small details that make every Oria tool feel like yours.','熟悉的设计，自由的主题，恰到好处的交互。让每一款 Oria，都成为你喜欢使用的工具。')}</p>
   </section></Reveal>
  </main>
  <SiteFooter locale={locale}/>
 </div>
}
