import * as React from 'react'

import { View } from './meta.types'

export const view: View = (c) => (s, e) => <div>
  <b>This example shows how meta information about the logic process can be used in view</b>
  <br /><br />
  {e.meta.is('loading') && <div style={{ padding: 20, backgroundColor: 'rgba(0,0,200, 0.2)' }}>
    The logic did not emit any value here - probably doing some operations.
    Since state is not ready it yet it may break at runtime.
      <br />
    Here are two options of improvements:
      <br />
    <ul>
      <li>have a global default loader / spinner</li>
      <li>allow loader / spinner component to be passed via config</li>
      <li>if no loader / spinner available wait with first render of the view until 'active'</li>
    </ul>
  </div>}
  {
    e.meta.is('active') && <div style={{ padding: 20, backgroundColor: 'rgba(0,200,0, 0.2)' }}>
      Now logic is active. It means it emitted at least one state.

      The state value in this example just passes props to be displayed:

        <pre>
        {JSON.stringify(s, null, 4)}
      </pre>
    </div>
  }
  {
    e.meta.is('error') && <div style={{ padding: 20, backgroundColor: 'rgba(200,0,0, 0.2)' }}>
      So, we have an error. In this case a fake one fortunately: {e.meta.error}.
      We definetely would like to know whenever it happens. In dev mode displaying it on red
      background makes most sense. Please mind, that React error boundaries are totally unnecessary
      as Observable offers error hanlding out of the box.
      <br />
      <button onClick={() => e.meta.reset()}>retry the logic code</button>
    </div>
  }
  {
    e.meta.is('completed') && <div style={{ padding: 20, backgroundColor: 'rgba(200,200,200, 0.2)' }}>
      The logic is not active any more, even passing new Props cannot resurrect this component.
      Only thing which may help is this little magic button.
      We can automatically detect if user tries to interact with a dead component, for sure
      it would indicate something wrong with the component and/or the user.
      <br />
      <button onClick={() => e.meta.reset()}>repeat the logic code</button>
    </div>
  }
</div>
