import * as React from 'react'
import * as Rx from 'rxjs'

import { createRxComponent, Logic, View, effects } from '../src'

const $ = Rx.Observable

export interface Props {
  name: string
  count: number
}

export interface UIEvents {
  click: any
}

export interface EffectsContract extends effects.EffectsContract {
  login: [number, boolean, null]
  logout: [void, boolean, null]
}

export const logic: Logic<Props, UIEvents> = ({ props, uiEvents }) =>
  props
    .mergeMap((p) =>
      $.timer(0, 1000)
        .map((c) => ({ ...p, count: c }))
    )
    .takeUntil(uiEvents.click)
    .repeat()

export const view: View<UIEvents, Props> = (cb) => (ps) =>
  <div>
    <h1>Cool, {ps.name} {ps.count}</h1>
    <button onClick={cb.click}>reset</button>
  </div>

export default createRxComponent<Props, UIEvents>(logic, view, {
  uiEventsNames: ['click']
})
