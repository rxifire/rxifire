import * as React from 'react'

import { View } from './say-color.types'

export const view: View = (c) => (s, e) => <div>
  {
    e.meta.error && <div>
      <p>Time's up!</p>
      <button onClick={() => e.meta.reset()}>Play Again</button>
    </div>
  }

  {s.state === 'before' &&
    <div>
      <p>
        Say Color (color not text)
      </p>
      <button onClick={c.start}>START</button>
    </div>}

  {s.state === 'in' &&
    <div style={{ padding: 20, fontSize: 82, fontWeight: 'bold', color: s.color }}>
      {s.text}
    </div>
  }

</div>
