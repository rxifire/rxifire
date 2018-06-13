import * as React from 'react'

import { View, Digit, Operation, UIEvents, UIState, UIStateIn, UIStateR } from './calc.types'

const SIDE = 30
const GUTTER = 4

const LAYOUT: Array<Array<[keyof UIEvents, Digit | Operation | '.' | '=']>> = [
  [['digit', 9], ['digit', 8], ['digit', 7], ['operation', '/']],
  [['digit', 6], ['digit', 5], ['digit', 4], ['operation', '*']],
  [['digit', 3], ['digit', 2], ['digit', 1], ['operation', '-']],
  [['dot', '.'], ['digit', 0], ['equal', '='], ['operation', '+']]
]

const st = (row: number, col: number): React.CSSProperties => ({
  position: 'absolute',
  width: SIDE,
  height: SIDE,
  left: col * (GUTTER * 2 + SIDE),
  top: row * (GUTTER * 2 + SIDE),
  padding: GUTTER, margin: GUTTER
})

const InProgress = (s: UIStateIn) =>
  <div>
    <div>{s.left}</div>
    <div>{s.operation}</div>
    <div>{s.right}</div>
  </div>

export const view: View = (c) => (s, e) =>
  <div>
    {
      e.meta.is('completed') &&
      <button onClick={() => e.meta.reset()}>reset</button>
    }
    <div style={{ width: 4 * (2 * GUTTER + SIDE), minHeight: SIDE, padding: GUTTER, border: '1px solid black' }}>
      {
        (s as UIStateIn).left ?
          InProgress(s as UIStateIn) : <h3>{(s as UIStateR).result}</h3>
      }
    </div>
    <div style={{ position: 'relative', filter: `blur(${e.meta.is('completed') ? 4 : 0}px)` }}>
      {
        LAYOUT.map((r, rX) => <div key={rX}>
          {r.map(([call, what], cX) =>
            <button key={cX} style={st(rX, cX)} onClick={() => (c[call] as any)(what)} >{what}</button>
          )}
        </div>
        )
      }
    </div>
  </div>
