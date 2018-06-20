import * as React from 'react'
import * as T from './menu.types'

import Empty from '../Empty'
import Counter from '../Counter'
import DefaultProps from '../DefaultProps'
import Calc from '../Calculator'
import Meta from '../Meta'
import SayColor from '../SayColor'

export const options: T.Option[] = [
  'counter',
  'default props',
  'empty',
  'calculator',
  'meta',
  'say color'
]

export const optionsToComponent: T.OptionToComponent = {
  empty: <Empty />,
  calculator: <Calc />,
  counter: <Counter />,
  'default props': <DefaultProps required1={5} required2='6' />,
  meta: <Meta />,
  'say color': <SayColor />
}
