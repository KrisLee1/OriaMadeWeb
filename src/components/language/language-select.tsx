"use client";
import {isLocale, localizedPath, stripLocale, languageList} from "@/i18n/config"
import { LanguagesIcon } from "lucide-react"
import { useTranslation } from "react-i18next"

import { buttonVariants } from "@/components/ui/button"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

export {languageList} from '@/i18n/config'

export function LanguageSelect({ className, variant, size, displayMode, align, side, tooltip }: {
  className?: string
  variant?: "link" | "default" | "secondary" | "destructive" | "outline" | "ghost" | null
  size?: "default" | "sm" | "lg" | null
  displayMode?: "default" | "icon" | "label" | "code" | "icon-code" | null
  align?: "end" | "center" | "start"
  side?: "left" | "top" | "right" | "bottom"
  tooltip?: string
}) {
  const { i18n, t } = useTranslation()
  const changeLanguage = (lang: string) => {
    if (!isLocale(lang) || lang === i18n.language) return
    try { localStorage.setItem('oria-made-language', lang) } catch { /* Preferences are optional. */ }
    window.location.assign(localizedPath(lang, stripLocale(location.pathname)) + location.search + location.hash)
  }
  const selectedLanguage = languageList.find((lang) => lang.code === i18n.language)
    ?? languageList.find((lang) => i18n.language.startsWith(`${lang.code}-`))
    ?? languageList[0]
  const items = languageList.map((item) => ({ label: item.label, value: item.code }))

  return (
    <Select items={items} value={selectedLanguage.code} onValueChange={(lang) => changeLanguage(lang || "zh-CN")}>
      <SelectTrigger aria-label={tooltip || String(t("language"))} title={tooltip} className={cn(buttonVariants({ variant, size, className }))}>
        <SelectValue render={(props) => <span {...props}>
          {displayMode !== "label" && displayMode !== "code" && <LanguagesIcon />}
          {(displayMode === "code" || displayMode === "icon-code") && <span>{selectedLanguage.code}</span>}
          {displayMode !== "icon" && displayMode !== "code" && displayMode !== "icon-code" && props.children}
        </span>} />
      </SelectTrigger>
      <SelectContent align={align} side={side} className="w-fit" alignItemWithTrigger={false} sideOffset={8}>
        <SelectGroup>{items.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectGroup>
      </SelectContent>
    </Select>
  )
}
