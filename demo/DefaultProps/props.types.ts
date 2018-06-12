import * as T from '../../src'

export interface OptionalProps {
  optional1: number
  optional2: string
}

export interface PropsBase {
  required1: number
  required2: string

  notRequired?: boolean
}

export type Props = PropsBase & Partial<OptionalProps>

export type PropsWithDefaults = PropsBase & OptionalProps

export interface UIEvents {}

export type UIState = PropsWithDefaults

export type EffectsContract = {}

export type Effects = T.Effects<EffectsContract>
export type Logic = T.Logic<Props, UIEvents, UIState, EffectsContract>
export type View = T.View<UIEvents, UIState, EffectsContract>
