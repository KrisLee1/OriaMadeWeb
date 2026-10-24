import {pageMetadata} from "@/lib/seo";
import {isLocale as isSiteLocale} from "@/i18n/config";
import { notFound } from "next/navigation";
import { EditorPanel } from "@/features/oria-theme/components/editor-page/editor-panel";
import { EditorI18nProvider } from "@/features/oria-theme/components/editor-page/editor-i18n";
import { EditorStage } from "@/features/oria-theme/components/editor-page/editor-stage";
import { EditorWorkspace } from "@/features/oria-theme/components/editor-page/editor-workspace";
import { isLocale } from "@/features/oria-theme/lib/i18n";

export default async function EditorPage({ params }: { readonly params: Promise<{ locale: string }> }) {
  const { locale: siteLocale } = await params; const locale = siteLocale === "zh-CN" ? "zh" : siteLocale;
  if (!isLocale(locale)) notFound();
  return <EditorI18nProvider locale={locale}><h1 className="sr-only">{locale === "zh" ? "OriaTheme 主题编辑器" : "OriaTheme editor"}</h1><EditorStage><EditorWorkspace locale={locale} /><EditorPanel /></EditorStage></EditorI18nProvider>;
}

export async function generateMetadata({params}:{params:Promise<{locale:string;slug?:string[]}>}) { const {locale,slug}=await params; if(!isSiteLocale(locale))return {}; return pageMetadata(locale, "/oria-theme/editor"+(slug?slug.join('/') : ''), locale==='en'?'Theme editor':'主题编辑器', locale==='en'?'A complete theme system for React, Vue and the web.':'适用于 React、Vue 与 Web 的完整主题体系。') }
