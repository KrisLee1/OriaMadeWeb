
import {localize} from '@/i18n/localize'
import {pageMetadata} from "@/lib/seo";
import {isLocale as isSiteLocale} from "@/i18n/config";
import { notFound } from "next/navigation";
import { HomeFeatures } from "@/features/oria-theme/components/home/home-features";
import { HomeHero } from "@/features/oria-theme/components/home/home-hero";
import { HomePresets } from "@/features/oria-theme/components/home/home-presets";
import { HomeStart } from "@/features/oria-theme/components/home/home-start";
import { getCopy, isLocale } from "@/features/oria-theme/lib/i18n";

export default async function HomePage({ params }: { readonly params: Promise<{ locale: string }> }) {
  const { locale: siteLocale } = await params; const locale = siteLocale;
  if (!isLocale(locale)) notFound();
  return <main className="demo-shell" aria-label={getCopy(locale).nav.home}>
    <HomeHero locale={locale} />
    <HomePresets locale={locale} />
    <HomeFeatures locale={locale} />
    <HomeStart locale={locale} />
  </main>;
}

export async function generateMetadata({params}:{params:Promise<{locale:string;slug?:string[]}>}) { const {locale,slug}=await params; if(!isSiteLocale(locale))return {}; return pageMetadata(locale, "/oria-theme"+(slug?slug.join('/') : ''), "OriaTheme", localize(locale, 'A complete theme system for React, Vue and the web.', '适用于 React、Vue 与 Web 的完整主题体系。')) }
