import * as T from '../../src'

export interface Props {}

export interface UIEvents {
  next: -1 | 1
}

export type UIState = {
  counter: number
}

export type EffectsContract = {}

export type Effects = T.Effects<EffectsContract>
export type Logic = T.Logic<Props, UIEvents, UIState, EffectsContract>
export type View = T.View<UIEvents, UIState, EffectsContract>
