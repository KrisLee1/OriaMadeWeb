'use client'

import type {Locale} from '@/i18n/config'
import {WorkspaceDemo, views} from './demo'
import {getDemoCopy} from './demo-copy'
import {FeatureTour} from './feature-tour'
import {workspaceGuide} from './workspace-guide'


export function WorkspaceTour({locale}: {locale: Locale}) {
  const copy = getDemoCopy(locale)
  const features = views.map(view => ({title: copy[view], description: workspaceGuide[locale][view]}))
  return <FeatureTour features={features} scenes={views} strip>
    {(active, select) => <WorkspaceDemo locale={locale} view={views[active]} onViewChange={view => select(views.indexOf(view))}/>}
  </FeatureTour>
}
