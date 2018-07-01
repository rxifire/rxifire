import * as React from 'react'
import { Observable } from 'rxjs'

import * as F$ from '../../src'
import { fakeTasks, ActionsIO } from '../tasks'

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

const tasks = fakeTasks()

export const spec: Spec = {
  behaviorsDefaults: {
    name: '', dob: undefined as DoB | undefined, count: 0, x: '0', open: false
  },
  tasks: tasks as F$.TasksF$<any>,
  animate: {
    count: (a) => a.map(n => n),
    open: () => Observable.empty()
  }
}

const log: F$.Logic<Spec> = ({ beh, sig, tsk }) => {
  beh.$('dob')
  sig.$('click')
  // act.meta('error')
  return Observable.of({ name: 'ab', pos: { x: 0, y: 0 } })
    .merge($.timer(0, 1000).map(x => ({ name: `${x}-`, pos: { x, y: -x } })))
    .merge($.timer(2000).mergeMap(() => tsk.fire('randomNumbers')(100)).ignoreElements())
    .delay(1)
}

const view: F$.JSXView<Spec> = ps => (s) => {
 // ps.
  return <h1>HELLO ${s.name} {ps.meta.is('active') + ''} {ps.tsk.meta('randomNumbers').update + ps.tsk.meta('randomNumbers').status + ''}</h1>
}

export const Comp = F$.createJSXComponent(spec, view as any, log)
