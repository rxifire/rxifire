// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/11640

import { createRxComponent } from '../../src'

import * as T from './props.types'

import { logic } from './props.logic'
import { view } from './props.view'

const comp = createRxComponent<T.Props, T.UIEvents, T.UIState, {}>(logic, view, {})

export default comp
