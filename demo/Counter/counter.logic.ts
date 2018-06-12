import * as Rx from 'rxjs'

import { Logic } from './counter.types'

const $ = Rx.Observable

export const logic: Logic = ({ uiEvents }) =>
  uiEvents.reset.startWith(null)
    .switchMapTo(
      $.merge(
        uiEvents.up.mapTo(1),
        uiEvents.down.mapTo(-1)
      )
        .scan((acc, s) => acc + s, 0)
        .startWith(0)
        .map(c => ({ counter: c }))
    )
