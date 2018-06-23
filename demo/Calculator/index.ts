import { createReactComponent } from '../../src'

import * as T from './calc.types'

import { logic } from './calc.logic'
import { view } from './calc.view'

const comp = createReactComponent<T.Props, T.UIEvents, T.UIState, {}>(logic, view, {}, {
  uiEventsNames: ['digit', 'operation', 'reset', 'negate', 'equal', 'dot']
})

export default comp
