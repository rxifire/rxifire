import { Observable } from 'rxjs'
import * as P from './types.priv'

export type ComponentSpec<State = {}, Signals extends {} = {}, Behaviors extends {} = {}> = {
  defaultBehaviors?: Behaviors
  // todo: allow setting what actions should be permitted in view & state - priority low
  signalsToBehaviors?: Partial<{
    [K in keyof Signals]: P.SignalToBehaviors<Signals, Behaviors, K>
  }>

  // todo: figure out what's wrong
  stats?: string[] | true
  // stats?: (keyof Behaviors)[]

  externalStreams?: any

  // todo: hide it from external world - priority very low
  __F$__?: [State, Signals, Behaviors]
}

export type Logic<T extends ComponentSpec> = (ps: P.LogicParams<T>) => Observable<P.SpecToState<T>>

export type View<T extends ComponentSpec> = (ps: P.ViewParams<T>) => (state: P.SpecToState<T>) => JSX.Element

export type createReactComponent<P = {}> =
  (spec: ComponentSpec, view: View<any>, logic?: Logic<any>) => (props: P) => JSX.Element

export type LogicStatus = 'loading' | 'active' | 'completed' | 'error'
