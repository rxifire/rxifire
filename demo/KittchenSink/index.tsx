import * as React from 'react'
import { Observable } from 'rxjs'

import * as F$ from '../../src'
import { Actions } from '../../src/actions/types'

export type DoB = { day: number, month: number, year: number }
export type Pos = { x: number, y: number }

export interface Signals {
  click: null
  pos: Pos
}

export interface Behaviors {
  name: string, dob: DoB | undefined, count: number, x: string
}

export type State = {
  name: string
  pos: Pos
}

type ActionsSpc = {
  asyncA: [number, string, null],
  asyncB: [string, string[], null]
  asyncUp: [string, string[], number]
}

type Spec = F$.ComponentSpec<State, Signals, ActionsSpc, Behaviors>

export const effectsC: Actions<ActionsSpc> = {
  asyncA: (n) => Observable.of(`${n}`),
  asyncB: (s) => Observable.of(s.split('')),
  asyncUp: (s) => Observable.of(s.split('')).map(x => ({ result: x })).delay(2000)
    .merge(Observable.timer(0, 2000).map(x => ({ update: x })))
}

export const spec: Spec = {
  defaultBehaviors: {
    name: '', dob: undefined as DoB | undefined, count: 0, x: '0'
  },
  actions: effectsC

  // stats: ['count', 'dob', 'name']
}

const log: F$.Logic<Spec> = ({ beh, sig, eff }) => {
  beh.$('dob')
  sig.$('click')
  return Observable.of({ name: 'ab', pos: { x: 0, y: 0 } })
}

const view: F$.View<Spec> = ps => s => {
  return <h1>HELLO ${s.name}</h1>
}
