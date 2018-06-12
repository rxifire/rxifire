import * as Rx from 'rxjs'

import { Logic } from './empty.types'

const $ = Rx.Observable

export const logic: Logic = ({ props, uiEvents, eff, effInfos }) =>
  uiEvents.empty.startWith(null)
    .switchMap((_, r) =>
      $.timer(0, 1000)
        .map(i => `item-${i}`)
        .merge(uiEvents.special
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
