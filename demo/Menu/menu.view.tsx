import * as React from 'react'

import { View } from './menu.types'
import { optionsToComponent } from './menu.config'

export const view: View = cb => s =>
  <div style={{ display: 'flex', flexDirection: 'row' }}>
    <div style={{ padding: 20, backgroundColor: 'rgb(200, 250, 200, 0.3)' }}>
      Demo components:
      {
        s.options.map((o, i) =>
          <div
            key={o}
            style={{ cursor: 'pointer', fontSize: 20, padding: 20, fontWeight: i === s.selectedIndex ? 'bold' : 'normal' }}
            onClick={() => cb.select(o)}>
            <a>{o}</a>
          </div>
        )}

    </div>

    <div style={{ flex: 1, padding: 20 }}>
        {optionsToComponent[s.options[s.selectedIndex]]}
    </div>
  </div>
