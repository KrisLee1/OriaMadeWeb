import {LanguageProvider} from '@/i18n/provider'
import {websiteThemeConfig} from '@/lib/theme/provider'

import {localize} from '@/i18n/localize'
import {LIQUID_THEME_ID} from '@/lib/theme/liquid-theme'
import {isLocale} from '@/i18n/config'
import {content} from './content.mjs'
import {ThemeSelect} from '@/components/theme/theme-select'
import {ThemeModeToggle} from '@/components/theme/theme-mode-toggle'
import {LanguageSelect} from '@/components/language/language-select'
import {useTranslation} from 'react-i18next'
import {Check, Palette} from 'lucide-react'
import {OriaThemeProvider,useThemeSnapshot} from '@oriatheme/react'
import {useApp} from './state'
import {themeColors,luminance} from '../shared/lib/theme'
type Color = keyof typeof themeColors | 'native' | 'custom'
export function AppearanceControls(){
 const {runtime}=useApp()
 const {i18n}=useTranslation()
 const locale=isLocale(i18n.language)?i18n.language:'en'
 return <OriaThemeProvider config={websiteThemeConfig} runtime={runtime}><LanguageProvider key={locale} locale={locale}><AppearanceContent/></LanguageProvider></OriaThemeProvider>
}
function AppearanceContent(){
 const {i18n}=useTranslation(),locale=isLocale(i18n.language)?i18n.language:'en',c=content[locale]
 const {state,act}=useApp(),id=state.settings.themeId,override=state.settings.materialOverrides[id]
 const liquid=id===LIQUID_THEME_ID
 const choice=liquid?state.settings.themeColor:override?.themeColor || 'native',custom=liquid?state.settings.customColor:override?.customColor || '#CDB0F4'
 const original=useThemeSnapshot(s=>s.resolvedTheme.variables['--oria-color-primary'])
 const change=(themeColor:Color,customColor=custom)=>void act(liquid?{type:'settings',patch:{themeColor:themeColor==='native'?'violet':themeColor,customColor}}:{type:'theme.material',id,patch:{themeColor,customColor}})
 return <div className="website-appearance appearance-settings">
  <div className="setting-row"><strong>{c.settings[1]}</strong><ThemeSelect variant="outline"/></div>
  <div className="setting-row"><strong>{c.settings[3]}</strong><ThemeModeToggle/></div>
  <div className="setting-row"><strong>{c.nav[5]}</strong><LanguageSelect variant="outline"/></div>
  <div className="setting-row"><strong>{localize(i18n.language, 'Demo accent', '演示强调色')}</strong><div className="theme-swatches">
   <button className="theme-swatch" style={{backgroundColor:original}} aria-label={localize(i18n.language, 'Original color', '原始主题色')} aria-pressed={choice==='native'} onClick={()=>change('native')}>{choice==='native'&&<Check size={15}/>}</button>
   {Object.entries(themeColors).map(([color,value],index)=><button key={color} className="theme-swatch" style={{backgroundColor:value.swatch}} aria-label={c.colors[index]} aria-pressed={choice===color} onClick={()=>change(color as Color)}>{choice===color&&<Check size={15}/>}</button>)}
   <label className="theme-swatch theme-custom" style={{backgroundColor:custom,color:luminance(custom)>.45?'#243529':'#fff'}}><Palette size={16}/><input type="color" aria-label={localize(i18n.language, 'Custom accent color', '自定义强调色')} value={custom} onChange={e=>change('custom',e.target.value)}/></label>
  </div></div>
 </div>
}
