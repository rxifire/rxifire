import * as React from 'react'
import { Observable } from 'rxjs'
import * as d3Ease from 'd3-ease'

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
  Behaviors, 'count' | 'open', { value: string }>

const tasks = fakeTasks({ tickLength: 50 })

export const spec: Spec = {
  behaviorsDefaults: {
    name: '', dob: undefined as DoB | undefined, count: 0, x: '0', open: false
  },
  tasks: tasks as F$.TasksF$<any>,
  animate: {
    count: (a) => a.map(n => n),
    open: o => o.map(v => v ? 1 : 0).pipe(F$.boundedAnimation({
      min: 0, max: 1, duration: 200, easing: d3Ease.easeSinInOut
    }))
  }
}

const log: F$.JSXLogic<Spec> = ({ beh, sig, tsk, props }) => {
  beh.$('dob')
  sig.$('click')
  return Observable.of({ name: 'ab', pos: { x: 0, y: 0 } })
    .merge($.timer(0, 1000).map(x => ({ name: `${x}-`, pos: { x, y: -x } })))
    .merge($.timer(2000).mergeMap(() => tsk.fire('randomNumbers')(100)).ignoreElements())
    .delay(1)
    .merge(sig.$('click').do(() => beh.update('count')(x => x + 1)).ignoreElements())
    .merge(props.do(p => beh.fire('name')(p.value)).ignoreElements())
}

const view: F$.JSXView<Spec> = ps => (s) => <div>
  <h1>HELLO ${s.name} or {ps.beh.v('name')} {ps.meta.is('active') + ''}</h1>
  {ps.tsk.is('randomNumbers', 'in-progress') && ps.tsk.as('randomNumbers', 'in-progress').update + ' ' + ps.tsk.meta('randomNumbers').status}
  <div>

    <button onClick={ps.sig.fire('click')} >click +1</button>
    {ps.beh.v('count')}
    <br />
    <button onClick={() => ps.beh.update('open')(o => !o)} >toggle</button>
    {`is open: ${ps.beh.v('open')}?`}
    <br />
    {(ps.ani as any).v('open')}
    <br />
  </div>

  <div style={{
    position: 'fixed', backgroundColor: 'green',
    height: '100vh', width: 200, top: 0, right: (-1 + ps.ani.v('open')) * 200
  }}>
  </div>
</div>

export const Comp = F$.createJSXComponent(spec, view as any, log)
