import { createReactComponent } from '../../src'

import * as T from './menu.types'

import { logic } from './menu.logic'
import { view } from './menu.view'

const comp = createReactComponent<T.Props, T.UIEvents, T.UIState, T.EffectsContract>(logic, view, {}, {
  uiEventsNames: ['select']
})

export default comp
