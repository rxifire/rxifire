import * as T from '../../src'

export type Option = 'empty' | 'default props' | 'counter' | 'calculator'
export type OptionToComponent = {
  [k in Option]: JSX.Element
}

export interface Props {}

export interface UIEvents {
  select: Option
}

export interface UIState {
  selectedIndex: number
  options: Option[]
}

export type EffectsContract = {}

export type Logic = T.Logic<Props, UIEvents, UIState, EffectsContract>

export type View = T.View<UIEvents, UIState, EffectsContract>
