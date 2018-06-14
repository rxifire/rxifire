import { Observable as $ } from 'rxjs/Observable'

import { createRxComponent } from '../../src'

import * as T from './meta.types'

import { logic } from './meta.logic'
import { view } from './meta.view'

const effects: T.Effects = {
  fireComplete: (ms) => $.timer(ms).map(() => new Date()),
  fireError: (ms) => $.timer(ms).mergeMapTo($.throw(new Date()))
}

const comp = createRxComponent<T.Props, T.UIEvents, T.UIState, T.EffectsContract>(logic, view, effects, {
  unsafeLoading: true,
  uiEventsNames: ['forceComplete', 'forceError']
})

export default comp
