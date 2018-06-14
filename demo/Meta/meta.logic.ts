import * as Rx from 'rxjs'

import { Logic, Props, PropsWithDefaults } from './meta.types'

const $ = Rx.Observable

const withDefaults = (p: Props): PropsWithDefaults => ({
  ...p,
  selfTerminationMs: 5000,
  autoErrorProb: 0.5,
  loadForMs: 2000,
  fireDurationMs: 5000
})

export const logic: Logic = ({ props }) =>
  props
    .map(withDefaults)
    .switchMap(p =>
      $.timer(p.loadForMs)
        .mapTo(p)
        .merge(
          $.timer(p.selfTerminationMs)
            .mergeMap(() => $.throw([new Date().toJSON(), p.autoErrorProb]))
        )
    )
    .catch(([e, p]) => Math.random() < p ? $.throw(e) : $.of(e))
