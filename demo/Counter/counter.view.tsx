import * as React from 'react'

import { View } from './counter.types'

export const view: View = (c) => (s, e) =>
  <div>
    <h1>{s.counter}</h1>
    <button onClick={c.up}>+</button>
    <button onClick={c.down}>-</button>
    <button onClick={c.reset}>reset</button>
  </div>
