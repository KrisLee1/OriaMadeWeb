
import {localize} from '@/i18n/localize'
import {pageMetadata} from "@/lib/seo";
import {isLocale as isSiteLocale} from "@/i18n/config";
import { notFound } from "next/navigation";
import { DocsHome } from "@/features/oria-theme/components/docs/docs-home";
import { DocsShell } from "@/features/oria-theme/components/docs/docs-shell";
import { isLocale } from "@/features/oria-theme/lib/i18n";

export default async function DocsPage({ params }: { readonly params: Promise<{ locale: string }> }) {
  const { locale: siteLocale } = await params; const locale = siteLocale;
  if (!isLocale(locale)) notFound();
  return <DocsShell locale={locale}><DocsHome locale={locale} /></DocsShell>;
}

export async function generateMetadata({params}:{params:Promise<{locale:string;slug?:string[]}>}) { const {locale,slug}=await params; if(!isSiteLocale(locale))return {}; return pageMetadata(locale, "/oria-theme/docs"+(slug?slug.join('/') : ''), localize(locale,'Documentation','文档'), localize(locale, 'A complete theme system for React, Vue and the web.', '适用于 React、Vue 与 Web 的完整主题体系。')) }
