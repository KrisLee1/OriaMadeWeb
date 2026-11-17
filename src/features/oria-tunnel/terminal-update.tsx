'use client'

import {Reveal} from '@/components/ui/reveal'
import {FeatureTour} from './feature-tour'
import type {Locale} from '@/i18n/config'
import {terminalUpdateCopy} from './terminal-update-copy'
import {StandaloneTerminal} from './terminal-preview'

import {terminalScenes} from './native-terminal/walkthrough-steps'


export function TunnelTerminalUpdate({locale}: {locale: Locale}) {
  const copy = terminalUpdateCopy[locale]
  return <Reveal as="section" id="terminal" tabIndex={-1} aria-labelledby="terminal-title" className="tunnel-section tunnel-terminal-update">
    <header className="tunnel-section-heading">
      <h2 id="terminal-title">{copy.title}</h2>
      <p>{copy.intro} {copy.shells}</p>
    </header>
    <FeatureTour features={copy.features} scenes={terminalScenes}>{index =>
      <figure className="terminal-showcase">
        <StandaloneTerminal locale={locale} scene={terminalScenes[index]}/>
      </figure>
    }</FeatureTour>
    <p className="file-demo-disclosure">{copy.sample}</p>
  </Reveal>
}
