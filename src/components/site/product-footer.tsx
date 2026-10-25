
import {BrandName} from '@/components/site/brand-name'
import {localize} from '@/i18n/localize'
import Link from 'next/link'
import {localizedPath,type Locale} from '@/i18n/config'
import {downloadCopy} from '@/features/oria-tunnel/download-copy'
import {products} from '@/content/products'
export function ProductFooter({locale,product}:{locale:Locale;product:string}){
 const item=products.find(p=>p.slug===product)!,zh=locale==='zh-CN'
 return <footer className={'product-footer '+product+'-footer'}><div><Link className="product-footer-brand" href={localizedPath(locale,'/'+product)}><BrandName name={item.name}/></Link><p>{localize(locale,item.description.en,item.description['zh-CN'])}</p></div><nav aria-label={localize(locale, 'Product and support', '产品与支持')}>{product==='oria-theme'?<><Link href={localizedPath(locale,'/oria-theme/docs')}>{localize(locale, 'Documentation', '文档')}</Link><Link href={localizedPath(locale,'/oria-theme/editor')}>{localize(locale, 'Theme editor', '主题编辑器')}</Link></>:product==='oria-tab'?<><Link href={localizedPath(locale,'/oria-tab/changelog')}>{localize(locale, 'Changelog', '更新日志')}</Link><Link href={localizedPath(locale,'/oria-tab/privacy')}>{localize(locale, 'Privacy policy', '隐私政策')}</Link></>:product==='oria-tunnel'?<Link href={localizedPath(locale,'/oria-tunnel/download')}>{downloadCopy[locale].download}</Link>:null}<a href={'https://github.com/KrisLee1/'+(product==='oria-tab'?'OriaTab-Releases':item.name)}>GitHub ↗</a></nav><nav aria-label={localize(locale, 'Oria collection', 'Oria 系列')}><Link href={localizedPath(locale)}>{localize(locale, 'Oria home', 'Oria 首页')}</Link>{products.filter(p=>p.slug!==product).map(p=><Link key={p.slug} href={localizedPath(locale,'/'+p.slug)}>{p.name}</Link>)}</nav></footer>
}
