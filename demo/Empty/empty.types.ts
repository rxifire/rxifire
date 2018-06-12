import * as T from '../../src'

export type Options = 'counter' | 'calculator'

export interface Props {}

export interface UIEvents {
  empty: null
  special: null
}

export interface UIState {
  run: number
  items: string[]
}

export type EffectsContract = {
  mockSpecial: [number, string, null]
}

export type Effects = T.Effects<EffectsContract>

export type Logic = T.Logic<Props, UIEvents, UIState, EffectsContract>

export type View = T.View<UIEvents, UIState, EffectsContract>
