import * as React from 'react'
import { Observable } from 'rxjs'

import * as F$ from '../../src'

export type DoB = { day: number, month: number, year: number }
export type Pos = { x: number, y: number }

export interface Signals {
  click: never
  pos: Pos
}

export interface Behaviors {
  name: string, dob: DoB | undefined, count: number, x: string
}

export type State = {
  name: string
  pos: Pos
}

export const spec: F$.ComponentSpec<State, Signals, Behaviors> = {
  defaultBehaviors: {
    name: '', dob: undefined as DoB | undefined, count: 0, x: '0'
  },
  signalsToBehaviors: {
    click: {
      count: (v) => v + 1
    },
    pos: {
      x: (c, pos) => pos.x + ''
    }
  }
 // stats: ['count', 'dob','name']
}

const log: F$.Logic<typeof spec> = ({ beh, sig }) => {
  beh.$('dob')
  sig.$('click')
  return Observable.of({ name: 'ab', pos: { x: 0, y: 0 } })
}

const view: F$.View<typeof spec> = ps => s => {
  return <h1>HELLO ${s.name}</h1>
}
