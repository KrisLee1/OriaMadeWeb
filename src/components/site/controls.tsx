'use client'
import {ThemeSelect} from '@/components/theme/theme-select'
import {ThemeModeToggle} from '@/components/theme/theme-mode-toggle'
import {LanguageSelect} from '@/components/language/language-select'
export function SiteControls(){return <div className="oria-controls"><ThemeSelect variant="ghost" size="sm" displayMode="icon" align="end"/><ThemeModeToggle variant="ghost" size="icon" displayMode="icon" align="end"/><LanguageSelect variant="ghost" size="sm" displayMode="icon" align="end"/></div>}
