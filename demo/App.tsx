import * as React from 'react'

import { createRoute } from '../src'

export interface Props {
  name: string
  count: number
}

export default createRoute<Props>({
  view: (ps) => <h1>Cool, {ps.name} {ps.count}</h1>
})