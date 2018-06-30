import * as React from 'react'
import { Observable } from 'rxjs'

import * as F$ from '../../src'
import { mockActions, Actions } from '../actions'

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

type Spec = F$.ComponentSpec<State, Signals, Pick<Actions, 'randomNumber' | 'error'>, Behaviors>

const actions = mockActions()

export const spec: Spec = {
  behaviorsDefaults: {
    name: '', dob: undefined as DoB | undefined, count: 0, x: '0'
  },
  actions: actions as F$.ActionsF$<any>
}

const log: F$.Logic<Spec> = ({ beh, sig, act }) => {
  beh.$('dob')
  sig.$('click')
  act.meta('error')
  return Observable.of({ name: 'ab', pos: { x: 0, y: 0 } })
}

const view: F$.JSXView<Spec> = ps => (s) => {
  ps.act.is('randomNumber', 'in-progress')
  return <h1>HELLO ${s.name}</h1>
}
