import { Observable as $ } from 'rxjs/Observable'

import { createRxComponent } from '../../src'

import * as T from './process.types'

import { logic } from './process.logic'
import { view } from './process.view'

const effects: T.Effects = {
  fireComplete: (ms) => $.timer(ms).map(() => new Date()),
  fireError: (ms) => $.timer(ms).mergeMapTo($.throw(new Date()))
}

const comp = createRxComponent<T.Props, T.UIEvents, T.UIState, T.EffectsContract>(logic, view, effects, {
  unsafeLoading: true,
  uiEventsNames: ['forceComplete', 'forceError']
})

export default comp
