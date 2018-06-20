import * as T from '../../src'

export type Props = {}

export interface UIEvents {
  start: never
}

export type UIState = {
  state: 'before' | 'in' | 'after'
  text?: string
  color?: string
}

export type EffectsContract = {}

export type Effects = T.Effects<EffectsContract>
export type Logic = T.Logic<Props, UIEvents, UIState, EffectsContract>
export type View = T.View<UIEvents, UIState, EffectsContract>
