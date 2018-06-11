import * as React from 'react'
import * as Rx from 'rxjs'

import { rxComponent, Logic, View } from '../src'

const $ = Rx.Observable

export interface Props {
  name: string
  count: number
}

export interface UIEvents {
  click: any
}

export interface EffectsIn {
  login: { email: string, password: string }
}

export interface EffectsOut {
  login: { token: string }
}

export type Effects = {
  [k in keyof EffectsIn]: (p: EffectsIn[k]) => Promise<EffectsOut[k]>
}

const c: Effects = {} as Effects

export type Effs = {
  login: [string, number]
}

export type E = {
  [k in keyof Effs]: (p: Effs[k][0]) => Promise<Effs[k][1]>
}

const d = {} as E

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

export default rxComponent<Props, UIEvents>(logic, view, {
  uiEventsNames: ['click']
})
