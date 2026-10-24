"use client";
import dynamic from 'next/dynamic'
import type {Locale} from '@/i18n/config'
const Story=dynamic(()=>import('./story-runtime'),{ssr:false,loading:()=> <div className="oria-story-loading" aria-hidden="true"><span>OriaTab</span></div>})
export function TabStory({locale}:{locale:Locale}){return <Story locale={locale}/>}
