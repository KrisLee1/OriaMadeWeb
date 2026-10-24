import Link from 'next/link'
import {localizedPath,type Locale} from '@/i18n/config'
import {products} from '@/content/products'
export function ProductFooter({locale,product}:{locale:Locale;product:string}){
 const item=products.find(p=>p.slug===product)!,zh=locale==='zh-CN'
 return <footer className={'product-footer '+product+'-footer'}><div><Link className="product-footer-brand" href={localizedPath(locale,'/'+product)}>{item.name}</Link><p>{item.description[locale]}</p></div><nav aria-label={zh?'产品与支持':'Product and support'}>{product==='oria-theme'?<><Link href={localizedPath(locale,'/oria-theme/docs')}>{zh?'文档':'Documentation'}</Link><Link href={localizedPath(locale,'/oria-theme/editor')}>{zh?'主题编辑器':'Theme editor'}</Link></>:product==='oria-tab'?<><Link href={localizedPath(locale,'/oria-tab/changelog')}>{zh?'更新日志':'Changelog'}</Link><Link href={localizedPath(locale,'/oria-tab/privacy')}>{zh?'隐私政策':'Privacy policy'}</Link></>:null}<a href={'https://github.com/KrisLee1/'+(product==='oria-tab'?'OriaTab-Releases':item.name)}>GitHub ↗</a></nav><nav aria-label={zh?'Oria 系列':'Oria collection'}><Link href={localizedPath(locale)}>{zh?'Oria 首页':'Oria home'}</Link>{products.filter(p=>p.slug!==product).map(p=><Link key={p.slug} href={localizedPath(locale,'/'+p.slug)}>{p.name}</Link>)}</nav></footer>
}
