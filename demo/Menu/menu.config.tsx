import * as React from 'react'
import * as T from './menu.types'

import Empty from '../Empty'

export const options: T.Option[] = [
  'empty',
  'calculator',
  'counter'
]

export const optionsToComponent: T.OptionToComponent = {
  empty: <Empty />,
  calculator: <Empty />,
  counter: <Empty />
}
