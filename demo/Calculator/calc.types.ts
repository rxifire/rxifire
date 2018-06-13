import * as T from '../../src'

export type Operation = '+' | '-' | '*' | '/'

export type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export type Props = {}

export interface UIEvents {
  digit: Digit
  operation: Operation

  equal: never
  dot: never
  negate: never
  reset: never
}

export type UIStateIn = {
  left?: string
  operation?: Operation
  right?: string
}

export type UIStateR = {
  result: string
}

export type UIState = UIStateIn | UIStateR

export type EffectsContract = {}

export type Effects = T.Effects<EffectsContract>
export type Logic = T.Logic<Props, UIEvents, UIState, EffectsContract>
export type View = T.View<UIEvents, UIState, EffectsContract>
