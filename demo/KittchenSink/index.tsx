import * as React from 'react'
import { Observable } from 'rxjs'

import * as F$ from '../../src'
import { someActions, Actions } from '../actions'

export type DoB = { day: number, month: number, year: number }
export type Pos = { x: number, y: number }

export interface Signals {
  click: null
  pos: Pos
}

export interface Behaviors {
  name: string, dob: DoB | undefined, count: number, x: string
}

export interface State {
  name: string
  pos: Pos
}

type Spec = F$.ComponentSpec<State, Signals, Actions, Behaviors>

export const spec: Spec = {
  behaviorsDefaults: {
    name: '', dob: undefined as DoB | undefined, count: 0, x: '0'
  },
  actions: someActions() as any

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
