'use client'

import {Reveal} from '@/components/ui/reveal'
import {FeatureTour} from './feature-tour'
import type {Locale} from '@/i18n/config'
import {VncDesktopDemo, vncScenes} from './vnc-desktop-demo'
import {vncUpdateCopy} from './vnc-update-copy'


export function TunnelVncUpdate({locale}: {locale: Locale}) {
  const copy = vncUpdateCopy[locale]
  return (
    <Reveal as="section" id="vnc" tabIndex={-1} aria-labelledby="vnc-title" className="tunnel-section tunnel-vnc-update">
      <header className="tunnel-section-heading">
        <h2 id="vnc-title">{copy.title}</h2>
        <p>{copy.intro}</p>
      </header>
      <FeatureTour features={copy.details} scenes={vncScenes}>
        {index => <VncDesktopDemo locale={locale} copy={copy.demo} scene={vncScenes[index]}/>}
      </FeatureTour>
    </Reveal>
  )
}
