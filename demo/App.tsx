import * as React from 'react'
import * as Rx from 'rxjs'

import { rxComponent } from '../src'

const $ = Rx.Observable

export interface Props {
  name: string
  count: number
}

export default rxComponent<Props>(
  (ps) => ps.props,
  () => (ps) => <h1>Cool, {ps.name} {ps.count}</h1>
)