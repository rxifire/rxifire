import * as Rx from 'rxjs'

import { options } from './menu.config'
import { Logic } from './menu.types'

const $ = Rx.Observable

export const logic: Logic = ({ props, uiEvents }) =>
  uiEvents.select
    .map(s => options.indexOf(s))
    .startWith(3)
    .do(x => console.log('SELECT'))
    .map(s => ({
      selectedIndex: s,
      options
    }))
