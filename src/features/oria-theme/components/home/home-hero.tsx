import { themePath } from "@/features/oria-theme/lib/paths";
import Link from "next/link";
import { getCopy, type Locale } from "@/features/oria-theme/lib/i18n";
import { Reveal } from "@/components/ui/reveal";
import {HomeThemePreview} from './home-theme-preview';

export function HomeHero({ locale }: { readonly locale: Locale }) {
  const copy = getCopy(locale).home.hero;
  return <section className="hero home-hero" id="top">
    <div className="hero-copy">
      <Reveal immediate><p className="eyebrow">{copy.eyebrow}</p></Reveal>
      <Reveal immediate delay={0.08}>
        <h1>{copy.title.replaceAll("\n", " ")}</h1>
      </Reveal>
      <Reveal immediate delay={0.16}><p>{copy.body}</p></Reveal>
      <Reveal immediate delay={0.24}>
        <div className="home-cta-row">
          <Link className="home-cta home-cta-primary" href={`${themePath(locale)}/editor`}>{copy.primaryCta}</Link>
          <Link className="home-cta home-cta-secondary" href={`${themePath(locale)}/docs`}>{copy.secondaryCta}</Link>
        </div>
      </Reveal>
    </div>
    <Reveal immediate delay={0.32}>
      <HomeThemePreview locale={locale}/>
    </Reveal>
  </section>;
}
