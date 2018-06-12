import * as Rx from 'rxjs'

import { Logic } from './menu.types'

const $ = Rx.Observable

export const logic: Logic = ({ props, uiEvents }) =>
  uiEvents.select
    .do(x => console.log('SELECT'))
    .map(s => ({
      selected: s
    }))
