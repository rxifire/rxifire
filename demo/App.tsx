import * as React from 'react'
import * as Rx from 'rxjs'

import { createRxComponent, Logic, View, effects as eff } from '../src'

const $ = Rx.Observable

export interface Props {
  name: string
  count: number
}

export interface UIEvents {
  click: any
}

export interface EffectsContract extends eff.EffectsContract {
  login: [number, boolean, null]
  logout: [void, boolean, null]
}

export const effects: eff.Effects<EffectsContract> = {
  login: (p) => $.of(true).delay(1000),
  logout: () => $.of(true).delay(1000)
}

export const logic: Logic<Props, UIEvents, Props, EffectsContract> = ({ props, uiEvents, effects, effInfos }) =>
  props
    .mergeMap((p) =>
      $.timer(0, 1000)
        .do(c => effInfos.login.resetTo(c % 2 ? 'active' : 'inactive'))
        .map((c) => ({ ...p, count: c }))
    )
    .takeUntil(uiEvents.click)
    .repeat(1)

export const view: View<UIEvents, Props, EffectsContract> = (cb) => (ps, eff) => {
  console.log(eff.login.is('active'), 'LOGIN-IS-ACTIVE')
  console.log(eff.login.status, 'Status')
  return <div>
    <h1>Cool, {ps.name} {ps.count}</h1>
    <button onClick={cb.click}>reset</button>
  </div>
}

export default createRxComponent<Props, UIEvents, Props, EffectsContract>(logic, view, effects, {
  uiEventsNames: ['click']
})
