import { Observable as $ } from 'rxjs'
import { createReactComponent } from '../../src'

import * as T from './empty.types'

import { logic } from './empty.logic'
import { view } from './empty.view'

const effects: T.Effects = {
  mockSpecial: n => $.of('SPECIAL-ITEM').delay(n * 1000)
}

const comp = createReactComponent<T.Props, T.UIEvents, T.UIState, T.EffectsContract>(logic, view, effects, {
  uiEventsNames: ['empty', 'special', 'kill', 'resurect']
})

export default comp
