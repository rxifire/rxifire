// counter is propably an overkill

import { createRxComponent } from '../../src'

import * as T from './counter.types'

import { logic } from './counter.logic'
import { view } from './counter.view'

const comp = createRxComponent<T.Props, T.UIEvents, T.UIState, {}>(logic, view, {}, {
  uiEventsNames: ['up', 'down', 'reset']
})

export default comp
