import * as React from 'react'
import { Observable } from 'rxjs'

import * as F$ from '../../src'

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

type Spec = F$.ComponentSpec<State, Signals, Behaviors>

export const spec: Spec = {
  defaultBehaviors: {
    name: '', dob: undefined as DoB | undefined, count: 0, x: '0'
  },
  behaviorsStats: ['count', 'dob', 'name'] // as (keyof Behaviors | keyof Signals)[]
}

const log: F$.Logic<Spec> = ({ beh, sig }) => {
  beh.$('dob')
  sig.$('click')
  return Observable.of({ name: 'ab', pos: { x: 0, y: 0 } })
}

const view: F$.View<Spec> = ps => s => {
  return <h1>HELLO ${s.name}</h1>
}

type S = {
  a: string, b: number
}

// type Sp<T extends {} = {}, W extends {} = {}, B extends {} = {}> = {
//   ks?: (keyof T)[]
//   ws?: (keyof W)[]
//   xs?: (keyof (T & W & B))[]
// }

// const l: Sp<S> = {
//   ks: ['b', 'a'],
//   ws: [],
//   xs: ['']
// }
