'use client'

import {Reveal} from '@/components/ui/reveal'
import type {Locale} from '@/i18n/config'
import {FeatureTour} from './feature-tour'
import {FileWorkspaceDemo, fileScenes} from './file-demo'
import {fileUpdateCopy} from './file-update-copy'


export function TunnelFileUpdate({locale}: {locale: Locale}) {
  const copy = fileUpdateCopy[locale]
  return <Reveal as="section" id="files" tabIndex={-1} className="tunnel-section tunnel-file-update" aria-labelledby="file-update-title">
    <header className="tunnel-section-heading">
      <h2 id="file-update-title">{copy.title}</h2><p>{copy.intro}</p>
    </header>
    <FeatureTour features={copy.highlights.map((title, i) => ({title, description: copy.changes[i]}))} scenes={fileScenes} reverse>
      {index => <FileWorkspaceDemo locale={locale} scene={fileScenes[index]} showNotice={false}/>}
    </FeatureTour>
    <p className="file-demo-disclosure">{copy.demoNotice}</p>
  </Reveal>
}
