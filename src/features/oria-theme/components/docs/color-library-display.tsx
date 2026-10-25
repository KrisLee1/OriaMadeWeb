
import {localize} from '@/i18n/localize'
import { oriaColorFamilies, oriaColors, oriaColorSteps } from "@oriatheme/colors";
import type { OriaColorFamily } from "@oriatheme/colors";

const specialColors = ["inherit", "current", "transparent", "black", "white"] as const;
type SpecialColor = (typeof specialColors)[number];

const familyLabels: Readonly<Record<OriaColorFamily, { readonly zh: string; readonly en: string }>> = {
  red: { zh: "红色", en: "Red" },
  orange: { zh: "橙色", en: "Orange" },
  amber: { zh: "琥珀色", en: "Amber" },
  yellow: { zh: "黄色", en: "Yellow" },
  lime: { zh: "青柠色", en: "Lime" },
  green: { zh: "绿色", en: "Green" },
  emerald: { zh: "翠绿色", en: "Emerald" },
  teal: { zh: "蓝绿色", en: "Teal" },
  cyan: { zh: "青色", en: "Cyan" },
  sky: { zh: "天蓝色", en: "Sky" },
  blue: { zh: "蓝色", en: "Blue" },
  indigo: { zh: "靛蓝色", en: "Indigo" },
  violet: { zh: "紫罗兰色", en: "Violet" },
  purple: { zh: "紫色", en: "Purple" },
  fuchsia: { zh: "洋红色", en: "Fuchsia" },
  pink: { zh: "粉色", en: "Pink" },
  rose: { zh: "玫瑰色", en: "Rose" },
  slate: { zh: "板岩色", en: "Slate" },
  gray: { zh: "灰色", en: "Gray" },
  zinc: { zh: "锌灰色", en: "Zinc" },
  neutral: { zh: "中性色", en: "Neutral" },
  stone: { zh: "石色", en: "Stone" },
  mauve: { zh: "灰紫色", en: "Mauve" },
  olive: { zh: "橄榄色", en: "Olive" },
  mist: { zh: "雾灰色", en: "Mist" },
  taupe: { zh: "灰褐色", en: "Taupe" },
};

const specialColorLabels: Readonly<Record<SpecialColor, { readonly zh: string; readonly en: string }>> = {
  inherit: { zh: "继承", en: "Inherit" },
  current: { zh: "当前颜色", en: "Current color" },
  transparent: { zh: "透明", en: "Transparent" },
  black: { zh: "黑色", en: "Black" },
  white: { zh: "白色", en: "White" },
};

export function ColorLibraryDisplay({ locale }: { readonly locale: import("@/i18n/config").Locale }) {
  return <div className="docs-color-library">
    <div className="color-library-grid">{oriaColorFamilies.map(family => {
      const label = localize(locale, familyLabels[family].en, familyLabels[family].zh);
      return <div className="color-family" key={family}><div className="color-family-heading"><strong>{label}</strong><code>--oria-palette-{family}-*</code></div><div className="color-scale-scroll"><div className="color-scale" role="list" aria-label={localize(locale, "{label} color scale", "{label} 色阶").replace("{label}",label)}>{oriaColorSteps.map(step => <div className="color-swatch" role="listitem" key={step} title={`${family}-${step}: ${oriaColors[family][step]}`}><i style={{ backgroundColor: `var(--oria-palette-${family}-${step})` }} /><span>{step}</span><code>{oriaColors[family][step]}</code></div>)}</div></div></div>;
    })}</div>
    <div className="special-colors"><div className="color-family-heading"><strong>{localize(locale, "Special colors", "特殊颜色")}</strong><code>inherit · current · transparent · black · white</code></div><div className="special-color-grid">{specialColors.map(name => <div className="color-swatch special-color-swatch" data-special={name} key={name}><i style={{ backgroundColor: `var(--oria-palette-${name})` }} /><span>{localize(locale, specialColorLabels[name].en, specialColorLabels[name].zh)}</span><code>{oriaColors[name]}</code></div>)}</div></div>
  </div>;
}
