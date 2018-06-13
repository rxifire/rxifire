import * as React from 'react'

import { View } from './empty.types'

export const view: View = (c) => (s, { eff }) => {
  if ('killed' in s) {
    return <div>
      Only if you are ready for it.
      <div>
        <button onClick={() => c.resurect(null)}>resurect the process</button>
      </div>
    </div>
  }
  return <div>

    <p>A very simple component presenting most functionalities</p>

    <button onClick={() => c.empty(null)}>Empty</button>
    {
      eff.mockSpecial.is('active') ?
        <button onClick={() => c.special(null)}>Fire Special</button> :
        '...'
    }
    <button onClick={() => c.kill(null)}>Kill</button>
    <h1>Run #{s.run}</h1>

    {s.items.map(i => <div key={i}>{i}</div>)}
  </div>
}
