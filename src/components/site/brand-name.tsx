type Brand = 'Oria' | 'OriaTheme' | 'OriaTab' | 'OriaTunnel'

export function BrandName({name='Oria'}:{name?:Brand}) {
 const product=name.slice(4)
 return <span className="oria-brand-name">Oria{product&&<span className="oria-brand-product">{product}</span>}</span>
}
