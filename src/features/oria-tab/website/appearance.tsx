import {LIQUID_THEME_ID} from '@/lib/theme/liquid-theme'
import {LanguageProvider} from '@/i18n/provider'
import {ThemeSelect} from '@/components/theme/theme-select'
import {ThemeModeToggle} from '@/components/theme/theme-mode-toggle'
import {LanguageSelect} from '@/components/language/language-select'
import {useTranslation} from 'react-i18next'
import {Check, Palette} from 'lucide-react'
import {useThemeSnapshot} from '@oriatheme/react'
import {useApp} from './state'
import {themeColors,luminance} from '../shared/lib/theme'
type Color = keyof typeof themeColors | 'native' | 'custom'
export function AppearanceControls(){
 const {i18n,t}=useTranslation(),zh=i18n.language==='zh-CN'
 const {state,act}=useApp(),id=state.settings.themeId,override=state.settings.materialOverrides[id]
 const liquid=id===LIQUID_THEME_ID
 const choice=liquid?state.settings.themeColor:override?.themeColor || 'native',custom=liquid?state.settings.customColor:override?.customColor || '#CDB0F4'
 const original=useThemeSnapshot(s=>s.resolvedTheme.variables['--oria-color-primary'])
 const change=(themeColor:Color,customColor=custom)=>void act(liquid?{type:'settings',patch:{themeColor:themeColor==='native'?'violet':themeColor,customColor}}:{type:'theme.material',id,patch:{themeColor,customColor}})
 return <LanguageProvider locale={zh?'zh-CN':'en'}><div className="website-appearance appearance-settings">
  <div className="setting-row"><strong>{zh?'主题':'Theme'}</strong><ThemeSelect variant="outline"/></div>
  <div className="setting-row"><strong>{zh?'外观':'Appearance'}</strong><ThemeModeToggle/></div>
  <div className="setting-row"><strong>{zh?'语言':'Language'}</strong><LanguageSelect variant="outline"/></div>
  <div className="setting-row"><strong>{zh?'演示强调色':'Demo accent'}</strong><div className="theme-swatches">
   <button className="theme-swatch" style={{backgroundColor:original}} aria-label={zh?'原始主题色':'Original color'} aria-pressed={choice==='native'} onClick={()=>change('native')}>{choice==='native'&&<Check size={15}/>}</button>
   {Object.entries(themeColors).map(([color,value])=><button key={color} className="theme-swatch" style={{backgroundColor:value.swatch}} aria-label={zh?({violet:'紫色',blue:'蓝色',sage:'绿色',rose:'玫瑰色',amber:'琥珀色'}[color as keyof typeof themeColors]):color} aria-pressed={choice===color} onClick={()=>change(color as Color)}>{choice===color&&<Check size={15}/>}</button>)}
   <label className="theme-swatch theme-custom" style={{backgroundColor:custom,color:luminance(custom)>.45?'#243529':'#fff'}}><Palette size={16}/><input type="color" aria-label={zh?'自定义强调色':'Custom accent color'} value={custom} onChange={e=>change('custom',e.target.value)}/></label>
  </div></div>
 </div></LanguageProvider>
}
