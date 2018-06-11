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
  login: [number, string, null]
  logout: [void, boolean, null]
}

export const effects: eff.Effects<EffectsContract> = {
  login: (p) => $.of('SEC-TOK').delay(p * 1000).toPromise(),
  logout: () => $.of(true).delay(1000)
}

export const logic: Logic<Props, UIEvents, Props, EffectsContract> = ({ props, uiEvents, effects, effInfos }) =>
  props
    .mergeMap((p) =>
      $.timer(0, 1000).map((c) => ({ ...p, count: c }))
        .merge(
          $.timer(111)
            .do(() => console.log('FIRING'))
            .mergeMap(() => effects.login(1))
            .do(() => console.log('FIRED'))
            .ignoreElements()
        )
    )
    .takeUntil(uiEvents.click
      .do(() => effInfos.login.reset())
    )
    .repeat()

export const view: View<UIEvents, Props, EffectsContract> = (cb) => (ps, eff) => {
  console.log(eff.login.is('in-progress'), 'IN_PR', eff.login)
  return <div>
    <h1>Cool, {ps.name} {ps.count}</h1>
    {eff.login.is('in-progress') && <p>...Loading...</p>}
    {eff.login.is('success') && <p>{eff.login.result!}</p>}
    <button onClick={cb.click}>reset</button>
  </div>
}

export default createRxComponent<Props, UIEvents, Props, EffectsContract>(logic, view, effects, {
  uiEventsNames: ['click']
})
