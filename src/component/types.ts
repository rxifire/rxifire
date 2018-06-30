import { Observable } from 'rxjs'
import * as P from './types.priv'
import { AsActions, ActionsF$, AsActionsIO } from '../actions'

export interface ComponentSpec<State, Signals extends {}, Actions extends AsActions<AsActionsIO<{}>>, Behaviors extends {}> {
  behaviorsDefaults?: Required<Behaviors>
  // todo: allow setting what actions should be permitted in view & state - priority low

  actions?: ActionsF$<Actions>

  // count, last-timestamp (?) - actually way better would be some flexible plugin mechanism
  // stats?: boolean | (keyof Signals | keyof Behaviors)[]

  externalStreams?: any
  // todo: hide it from external world - priority very low
  __F$__?: [State, Signals]
}

export type Logic<T extends ComponentSpec<any, any, any, any>> = (ps: P.LogicParams<T>) => Observable<P.SpecToState<T>>

export type View<T extends ComponentSpec<any, any, any, any>> = (ps: P.ViewParams<T>) => (state: P.SpecToState<T>) => JSX.Element

export type createReactComponent<P = {}> =
  (spec: ComponentSpec<any, any, any, any>, view: View<any>, logic?: Logic<any>) => (props: P) => JSX.Element

// most likely not needed
// signalsToBehaviors?: Partial<{
//   [K in keyof Signals]: P.SignalToBehaviors<Signals, Behaviors, K>
// }>
