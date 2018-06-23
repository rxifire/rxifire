import { Observable as $ } from 'rxjs/Observable'

import { createReactComponent } from '../../src'

import * as T from './say-color.types'

import { logic } from './say-color.logic'
import { view } from './say-color.view'

const effects: T.Effects = {}

const comp = createReactComponent<T.Props, T.UIEvents, T.UIState, T.EffectsContract>(logic, view, effects, {
  uiEventsNames: ['start']
})

export default comp
