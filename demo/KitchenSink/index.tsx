import * as React from 'react'
import { Observable } from 'rxjs'

import * as F$ from '../../src'
import { mockActions, ActionsIO } from '../actions'

const $ = Observable

export type DoB = { day: number, month: number, year: number }
export type Pos = { x: number, y: number }

export interface Signals {
  click: null
  pos: Pos
}

export interface Behaviors {
  name: string, dob: DoB | undefined, count: number, x: string, open: boolean
}

export interface State {
  name: string
  pos: Pos
}

type Spec = F$.ComponentSpec<State, Signals, Pick<ActionsIO, 'randomNumbers'>,
  Behaviors, 'count' | 'open', { props: Observable<number> }>

const actions = mockActions()

export const spec: Spec = {
  behaviorsDefaults: {
    name: '', dob: undefined as DoB | undefined, count: 0, x: '0', open: false
  },
  actions: actions as F$.ActionsF$<any>,
  animate: {
    count: (a) => a.map(n => n),
    open: () => Observable.empty()
  }
}

const log: F$.Logic<Spec> = ({ beh, sig, act }) => {
  beh.$('dob')
  sig.$('click')
  // act.meta('error')
  return Observable.of({ name: 'ab', pos: { x: 0, y: 0 } })
    .merge($.timer(0, 1000).map(x => ({ name: `${x}-`, pos: { x, y: -x } })))
    .merge($.timer(2000).mergeMap(() => act.fire('randomNumbers')(100)).ignoreElements())
    .delay(1)
}

const view: F$.JSXView<Spec> = ps => (s) => {
 // ps.
  return <h1>HELLO ${s.name} {ps.meta.is('active') + ''} {ps.act.meta('randomNumbers').update + ps.act.meta('randomNumbers').status + ''}</h1>
}

export const Comp = F$.createJSXComponent(spec, view as any, log)
