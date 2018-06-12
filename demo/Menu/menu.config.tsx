import * as React from 'react'
import * as T from './menu.types'

import Empty from '../Empty'
import Counter from '../Counter'

export const options: T.Option[] = [
  'counter',
  'empty',
  'calculator'
]

export const optionsToComponent: T.OptionToComponent = {
  empty: <Empty />,
  calculator: <Empty />,
  counter: <Counter />
}
