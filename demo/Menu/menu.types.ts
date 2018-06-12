import * as T from '../../src'

export type Options = 'counter' | 'calculator'

export interface Props {}

export interface UIEvents {
  select: Options
}

export interface UIState {
  selected: Options
}

export type EffectsContract = {}

export type Logic = T.Logic<Props, UIEvents, UIState, EffectsContract>

export type View = T.View<UIEvents, UIState, EffectsContract>
