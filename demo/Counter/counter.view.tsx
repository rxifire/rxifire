import * as React from 'react'

import { View } from './counter.types'

export const view: View = (c) => (s, e) =>
  <div>
    <h1>{s.counter}</h1>
    <button onClick={() => c.next(1)}>+</button>
    <button onClick={() => c.next(-1)}>-</button>
    <button onClick={e.meta.reset}>zero</button>
  </div>
