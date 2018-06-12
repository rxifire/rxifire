import * as Rx from 'rxjs'

import { Logic } from './empty.types'

const $ = Rx.Observable

export const logic: Logic = ({ uiEvents, eff, effInfos }) =>
  uiEvents.empty.startWith(null)
    .switchMap((_, r) =>
      $.merge(
        $.timer(0, 1000)
          .map(i => `item-${i}`),
        uiEvents.special
          .mergeMap((_, i) =>
            eff.mockSpecial(1)
              .map(s => `${s}-${i}`)
          )
          .do(() => effInfos.mockSpecial.reset())
      )
        .scan((acc, i) => acc.concat(i), [])
        .map((items) => ({
          run: r,
          items
        }))
    )
    .takeUntil(uiEvents.kill)
    .repeatWhen(() => uiEvents.resurect.do((x) => console.log('RES', x)))
    .merge(uiEvents.kill.mapTo({ killed: true }))
