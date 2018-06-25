import { Observable } from 'rxjs'
import * as P from './types.priv'
import { ActionsIO, Actions } from '../actions/types'

export type ComponentSpec<State, Signals extends {}, Act extends ActionsIO, Behaviors extends {}> = {
  defaultBehaviors?: Required<Behaviors>
  // todo: allow setting what actions should be permitted in view & state - priority low

  actions?: Actions<Act>

  // count, last-timestamp (?) - actually way better would be some flexible plugin mechanism
  // stats?: boolean | (keyof Signals | keyof Behaviors)[]

  externalStreams?: any
  // todo: hide it from external world - priority very low
  __F$__?: [State, Signals, Act, Behaviors]
}

export type Logic<T extends ComponentSpec<any, any, any, any>> = (ps: P.LogicParams<T>) => Observable<P.SpecToState<T>>

export type View<T extends ComponentSpec<any, any, any, any>> = (ps: P.ViewParams<T>) => (state: P.SpecToState<T>) => JSX.Element

export type createReactComponent<P = {}> =
  (spec: ComponentSpec<any, any, any, any>, view: View<any>, logic?: Logic<any>) => (props: P) => JSX.Element

export type LogicStatus = 'loading' | 'active' | 'completed' | 'error'

// most likely not needed
// signalsToBehaviors?: Partial<{
//   [K in keyof Signals]: P.SignalToBehaviors<Signals, Behaviors, K>
// }>
