import * as T from '../../src'

export interface PropsBase {
  loadForMs: number
  selfTerminationMs: number
  autoErrorProb: number
  fireDurationMs: number
}

export type Props = Partial<PropsBase>

export type PropsWithDefaults = PropsBase

export interface UIEvents {
  forceError: never
  forceComplete: never
}

export type UIState = Props

export type EffectsContract = {
  fireError: [number, any, null]
  fireComplete: [number, any, Date]
}

export type Effects = T.Effects<EffectsContract>
export type Logic = T.Logic<Props, UIEvents, UIState, EffectsContract>
export type View = T.View<UIEvents, UIState, EffectsContract>
