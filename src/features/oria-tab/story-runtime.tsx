"use client";
import {useEffect,useState,useRef} from 'react'
import {createInstance} from 'i18next'
import {I18nextProvider} from 'react-i18next'
import {useOriaTheme} from '@oriatheme/react'
import {MotionConfig} from 'motion/react'
import {StoryView} from './website/story/story'
import {GlassEnvironment} from './shared/components/glass-environment'
import {translations} from './shared/lib/i18n'
import {content} from './website/content.mjs'
import {LIQUID_THEME_ID} from '@/lib/theme/liquid-theme'
import {useAppAppearance} from './shared/lib/use-app-appearance'
import {materialShadows} from './shared/lib/material'
import type {Locale} from '@/i18n/config'
function Demo({locale}:{locale:Locale}){
 const {snapshot}=useOriaTheme();const root=useRef<HTMLDivElement>(null)
 useAppAppearance(root)
 useEffect(()=>{const el=root.current;if(!el)return;for(const size of ['sm','md','lg'] as const)el.style.setProperty(`--material-shadow-${size}`,materialShadows(snapshot.resolvedTheme.variables,size).outer)},[snapshot.resolvedTheme.variables])
 return <MotionConfig reducedMotion="user"><div ref={root} className={'oria-tab-runtime '+(snapshot.resolvedMode==='dark'?'dark':'')} data-material={snapshot.preference.activeThemeId===LIQUID_THEME_ID?'liquid':'theme'}><GlassEnvironment scope={root}><StoryView c={content[locale]}/></GlassEnvironment></div></MotionConfig>
}

export default function StoryRuntime({locale}:{locale:Locale}) {
 const [i18n]=useState(()=>{const i=createInstance();void i.init({lng:locale,resources:{[locale]:{translation:translations[locale]}},keySeparator:false,initImmediate:false,interpolation:{escapeValue:false}});return i})
 return <I18nextProvider i18n={i18n}><Demo locale={locale}/></I18nextProvider>
}
