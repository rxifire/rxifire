import * as React from 'react'

import { View } from './empty.types'

export const view: View = (c) => (s, e) =>
  <div>
    <button onClick={() => c.empty(null)}>Empty</button>
    {
      e.mockSpecial.is('active') ?
        <button onClick={() => c.special(null)}>Fire Special</button> :
        '...'
    }
    <h1>Run {s.run}</h1>

    {s.items.map(i => <div key={i}>{i}</div>)}
  </div>
