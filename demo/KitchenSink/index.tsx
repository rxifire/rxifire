import * as React from 'react'
import { Observable } from 'rxjs'
import * as d3Ease from 'd3-ease'

import * as F$ from '../../src'
import { fakeTasks, ActionsIO } from '../tasks'

import { html } from 'lit-html/lib/lit-extended'

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

type Spec = F$.ComponentSpec<State, Signals, Pick<ActionsIO, 'randomNumbers' | 'randomNumber'>,
  Behaviors, 'count' | 'open', { value: string }>

const tasks = fakeTasks({ tickLength: 50 }, { randomNumbers: { inProgressRefire: 'ignore' } })

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

const log: F$.Logic<Spec> = ({ beh, sig, tsk, props }) => {
  beh.$('dob')
  sig.$('click')
  return Observable.of({ name: 'ab', pos: { x: 0, y: 0 } })
    .merge($.timer(0, 1000).map(x => ({ name: `${x}-`, pos: { x, y: -x } })))
    .merge($.timer(2000).mergeMap(() => tsk.fire('randomNumbers')(100)).ignoreElements())
    .delay(1)
    .merge(sig.$('click').do(() => beh.update('count')(x => x + 1)).ignoreElements())
  //   .merge(props.do(p => beh.fire('name')(p.value)).ignoreElements())
}

const jsxView: F$.JSXView<Spec> = ps => (s) => <div>
  <h1>JSX {s.name} or {ps.beh.v('name')} LOGIC: {ps.meta.is('active') + ''}</h1>
  {ps.meta.is('error') && <pre>{JSON.stringify(ps.meta.as('error'), null, 4)}</pre>}
  {ps.tsk.is('randomNumbers', 'success') && ps.tsk.as('randomNumbers', 'success').value + ' RANDOM-NUMs'}
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
    height: '100vh', opacity: 0.5, width: 200, top: 0, right: (-1 + ps.ani.v('open')) * 200
  }}>
  </div>
</div>

const domView: F$.DOMView<Spec> = ps => s =>
  html`<div>
  <h1>DOM ${s.name} or ${ps.beh.v('name')} LOGIC: ${ps.meta.is('active') + ''}</h1>
  <div>
    ${ps.tsk.is('randomNumbers', 'in-progress') && ps.tsk.as('randomNumbers', 'in-progress').update + ' ' + ps.tsk.meta('randomNumbers').status}
    <button on-click="${ps.sig.fire('click')}">click +1</button>
    ${ps.beh.v('count')}
    <br />
    <button on-click="${() => ps.beh.update('open')(o => !o)}">toggle</button>
    ${`is open: ${ps.beh.v('open')}?`}
    <br /> ${(ps.ani as any).v('open')}
    <br />
  </div>

  <div style="position:fixed;opacity:0.5;background-color:blue;height:100vh;width:200px;top:0;
    right: ${(-1 + ps.ani.v('open')) * 200}px">
  </div>
</div>`

export const JSXComp = F$.createJSXComponent(spec, jsxView as any, log)

export const DOMComp = F$.createDOMComponent(spec, domView as any, log)
