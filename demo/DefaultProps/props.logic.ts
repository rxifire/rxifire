import * as Rx from 'rxjs'

import { Logic, PropsWithDefaults } from './props.types'

export const logic: Logic = ({ props }) =>
  props
    .map((p): PropsWithDefaults => ({ ...p, optional1: 7, optional2: '7' }))
