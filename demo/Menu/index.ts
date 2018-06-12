import { createRxComponent } from '../../src'

import * as T from './menu.types'

import { logic } from './menu.logic'
import { view } from './menu.view'

const comp = createRxComponent<T.Props, T.UIEvents, T.UIState, T.EffectsContract>(logic, view, {}, {
  uiEventsNames: ['select']
})

export default comp
