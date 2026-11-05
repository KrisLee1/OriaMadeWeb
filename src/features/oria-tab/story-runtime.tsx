'use client'
import {useEffect, useLayoutEffect, useState, useRef} from 'react'
import {createInstance} from 'i18next'
import {I18nextProvider} from 'react-i18next'
import {OriaThemeProvider, useOriaTheme} from '@oriatheme/react'
import type {OriaThemeConfig} from '@oriatheme/runtime-dom'
import {MotionConfig} from 'motion/react'
import {StoryView, FeaturePreview} from './website/story/story'
import type {TabDemoVariant} from './story-client'
import {GlassEnvironment} from './shared/components/glass-environment'
import {translations} from './shared/lib/i18n'
import {content} from './website/content.mjs'
import {LIQUID_THEME_ID, websiteThemes} from '@/lib/theme/liquid-theme'
import {useAppAppearance} from './shared/lib/use-app-appearance'
import {materialShadows} from './shared/lib/material'
import {WebsiteStateProvider} from './website/state'
import type {Locale} from '@/i18n/config'
import type {ResolvedMode,ThemeDefinition} from '@oriatheme/core'

function DemoModeSync({mode}: {mode: ResolvedMode}) {
  const {runtime} = useOriaTheme()
  useEffect(() => {runtime.setAppearance(mode)}, [mode, runtime])
  return null
}

function Demo({locale, variant,active}: {locale: Locale; variant: TabDemoVariant;active:boolean}) {
  const {snapshot} = useOriaTheme(), root = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const element = root.current
    if (!element) return
    for (const [name, value] of Object.entries(snapshot.resolvedTheme.variables)) element.style.setProperty(name, value)
    for (const size of ['sm', 'md', 'lg'] as const) element.style.setProperty(`--material-shadow-${size}`, materialShadows(snapshot.resolvedTheme.variables, size).outer)
  }, [snapshot.resolvedTheme.variables])
  useAppAppearance(root)
  return <MotionConfig reducedMotion="user"><div ref={root} className={'oria-tab-runtime ' + (snapshot.resolvedMode === 'dark' ? 'dark' : '')} data-material={snapshot.preference.activeThemeId === LIQUID_THEME_ID ? 'liquid' : 'theme'}>
    <GlassEnvironment scope={root} active={active&&variant==='showcase'}>{variant === 'showcase' ? <StoryView c={content[locale]} active={active}/> : <FeaturePreview c={content[locale]} variant={variant}/>}</GlassEnvironment>
  </div></MotionConfig>
}

export default function StoryRuntime({locale,variant,active}:{locale:Locale;variant:TabDemoVariant;active:boolean}) {
  const {snapshot}=useOriaTheme()
  const theme=snapshot.customThemes.find(theme=>theme.id===snapshot.preference.activeThemeId)
    ??snapshot.presets.find(theme=>theme.id===snapshot.preference.activeThemeId)
    ??websiteThemes[0]
  return <DemoThemeScope key={theme.id+':'+(theme.updatedAt??0)} locale={locale} variant={variant} active={active} theme={theme} mode={snapshot.resolvedMode}/>
}

function DemoThemeScope({locale,variant,active,theme,mode}:{locale:Locale;variant:TabDemoVariant;active:boolean;theme:ThemeDefinition;mode:ResolvedMode}) {
  const [config]=useState<OriaThemeConfig>(()=>({presets:websiteThemes.some(item=>item.id===theme.id)?websiteThemes:[...websiteThemes,theme],defaultThemeId:theme.id,defaultAppearance:mode,storage:false,transition:false,target:document.createElement('div').attachShadow({mode:'open'}),attributeAdapter:()=>{}}))
  const [i18n]=useState(()=>{const instance=createInstance();void instance.init({lng:locale,resources:{[locale]:{translation:translations[locale]}},keySeparator:false,initImmediate:false,interpolation:{escapeValue:false}});return instance})
  return <I18nextProvider i18n={i18n}><OriaThemeProvider config={config}><DemoModeSync mode={mode}/><WebsiteStateProvider locale={locale}><Demo locale={locale} variant={variant} active={active}/></WebsiteStateProvider></OriaThemeProvider></I18nextProvider>
}
