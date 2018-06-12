import { Observable as $ } from 'rxjs'
import { createRxComponent } from '../../src'

import * as T from './empty.types'

import { logic } from './empty.logic'
import { view } from './empty.view'

const effects: T.Effects = {
  mockSpecial: n => $.of('SPECIAL-EFFECT').delay(n * 1000)
}

const comp = createRxComponent<T.Props, T.UIEvents, T.UIState, T.EffectsContract>(logic, view, effects, {
  uiEventsNames: ['empty', 'special', 'kill', 'resurect']
})

export default comp
