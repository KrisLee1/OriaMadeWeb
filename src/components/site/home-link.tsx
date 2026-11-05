import Link from 'next/link'
import {localizedPath,type Locale} from '@/i18n/config'
import {localize} from '@/i18n/localize'

export function HomeLink({locale,onNavigate}:{locale:Locale;onNavigate:()=>void}) {
 return <Link className="site-home-link" href={localizedPath(locale)} onClick={onNavigate}>{localize(locale,'Oria home','Oria 首页')}</Link>
}
