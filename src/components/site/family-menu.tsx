'use client'
import Link from 'next/link'
import {Grid2X2} from 'lucide-react'
import {DropdownMenu,DropdownMenuTrigger,DropdownMenuContent,DropdownMenuItem} from '@/components/ui/dropdown-menu'
import {localizedPath,type Locale} from '@/i18n/config'
import {products} from '@/content/products'
export function FamilyMenu({locale,current}:{locale:Locale;current?:string}){return <DropdownMenu modal={false}><DropdownMenuTrigger className="family-trigger" aria-label={locale==='en'?'Oria collection':'Oria 系列'}><Grid2X2 size={16}/><span>Oria</span></DropdownMenuTrigger><DropdownMenuContent align="end" className="min-w-44"><DropdownMenuItem render={<Link href={localizedPath(locale)}/>}>{locale==='en'?'Oria home':'Oria 首页'}</DropdownMenuItem>{products.filter(p=>p.slug!==current).map(p=><DropdownMenuItem key={p.slug} render={<Link href={localizedPath(locale,'/'+p.slug)}/>}>{p.name}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>}
