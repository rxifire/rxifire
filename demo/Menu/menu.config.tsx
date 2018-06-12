import * as React from 'react'
import * as T from './menu.types'

import Empty from '../Empty'
import Counter from '../Counter'
import DefaultProps from '../DefaultProps'

export const options: T.Option[] = [
  'counter',
  'default props',
  'empty',
  'calculator'
]

export const optionsToComponent: T.OptionToComponent = {
  empty: <Empty />,
  calculator: <Empty />,
  counter: <Counter />,
  'default props': <DefaultProps required1={6} required2='6' />
}
