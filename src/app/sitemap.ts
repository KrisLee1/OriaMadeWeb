import {siteOrigin} from '@/lib/seo'
import {locales,localizedPath} from '@/i18n/config'
import {docsPages} from '@/features/oria-theme/components/docs/docs-shell'
export default function sitemap(){const paths=['/','/oria-theme','/oria-theme/editor','/oria-theme/docs',...docsPages.map(p=>'/oria-theme/docs/'+p.slug),'/oria-tab','/oria-tab/changelog','/oria-tab/privacy','/oria-tunnel'];return paths.flatMap(path=>locales.map(locale=>({url:siteOrigin+localizedPath(locale,path),alternates:{languages:{en:siteOrigin+localizedPath('en',path),'zh-CN':siteOrigin+localizedPath('zh-CN',path)}}})))}
