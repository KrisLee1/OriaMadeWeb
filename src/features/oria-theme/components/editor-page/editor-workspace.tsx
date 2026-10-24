import { TokenGallery } from "@/features/oria-theme/components/editor-page/token-gallery";
import type { Locale } from "@/features/oria-theme/lib/i18n";

export function EditorWorkspace({ locale }: { readonly locale: Locale }) {
  return <main className="demo-shell">
    <TokenGallery locale={locale} />
  </main>;
}
